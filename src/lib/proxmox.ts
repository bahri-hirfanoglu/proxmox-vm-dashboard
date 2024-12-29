import axios from 'axios';
import https from 'https';
import { VirtualMachine } from '@/types/vm';

interface ProxmoxApiResponse<T> {
  data: T;
  errors?: string[];
  message?: string;
  success?: boolean;
}

interface ProxmoxResponse<T> {
  data: ProxmoxApiResponse<T>;
  status: number;
}

interface VMConfig {
  name: string;
  cores: number;
  memory: number;
  [key: string]: string | number | boolean | undefined;
}

interface VMStatus {
  status: string;
  uptime: number;
  qmpstatus?: string;
}

interface ProxmoxNode {
  node: string;
  status: string;
  cpu: number;
  maxcpu: number;
  mem: number;
  maxmem: number;
  uptime: number;
  [key: string]: string | number | boolean | undefined;
}

interface RawVMData {
  vmid: number;
  name?: string;
  status: 'running' | 'stopped' | 'paused';
  mem?: number;
  maxmem?: number;
  cpu?: number;
  cpus?: number;
  disk?: number;
  maxdisk?: number;
  net0?: string;
  ip?: string;
  uptime?: number;
}

interface RawVMListResponse {
  vmid: number;
  name?: string;
  status: 'running' | 'stopped' | 'paused';
  mem?: number;
  maxmem?: number;
  cpu?: number;
  cpus?: number;
  disk?: number;
  maxdisk?: number;
  net0?: string;
  ip?: string;
  uptime?: number;
  [key: string]: string | number | boolean | undefined;
}

// Proxmox ticket (cookie) based authentication
async function getAuthTicket() {
  const username = (process.env.PROXMOX_USERNAME || 'root').replace('@pam', '');
  
  try {
    console.log('Attempting to get auth ticket from:', process.env.PROXMOX_API_URL);
    
    const response = await axios.post(
      `${process.env.PROXMOX_API_URL}/access/ticket`,
      new URLSearchParams({
        username: username,
        password: process.env.PROXMOX_PASSWORD || '',
        realm: 'pam'
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        httpsAgent: new https.Agent({
          rejectUnauthorized: false
        })
      }
    );

    if (!response.data?.data?.ticket) {
      console.error('No ticket in response:', response.data);
      throw new Error('Authentication failed: No ticket received');
    }

    console.log('Successfully obtained auth ticket');
    return {
      ticket: response.data.data.ticket,
      csrf: response.data.data.CSRFPreventionToken
    };
  } catch (error) {
    console.error('Authentication error details:', {
      url: process.env.PROXMOX_API_URL,
      username: username,
      error: error.response?.data || error.message,
      fullError: error
    });
    throw error;
  }
}

// Create axios instance with authentication
async function createAuthenticatedApi() {
  console.log('Creating authenticated API instance');
  const { ticket, csrf } = await getAuthTicket();
  
  const api = axios.create({
    baseURL: process.env.PROXMOX_API_URL,
    headers: {
      'Cookie': `PVEAuthCookie=${ticket}`,
      'CSRFPreventionToken': csrf,
      'Content-Type': 'application/json'
    },
    httpsAgent: new https.Agent({
      rejectUnauthorized: false
    })
  });

  // Add response interceptor for debugging
  api.interceptors.response.use(
    response => {
      console.log(`API Response [${response.config.method?.toUpperCase()}] ${response.config.url}:`, {
        status: response.status,
        data: response.data
      });
      return response;
    },
    error => {
      console.error(`API Error [${error.config?.method?.toUpperCase()}] ${error.config?.url}:`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        fullError: error
      });
      return Promise.reject(error);
    }
  );

  return api;
}

export async function getNodes(): Promise<ProxmoxNode[]> {
  try {
    console.log('Fetching nodes...');
    const api = await createAuthenticatedApi();
    const response = await api.get<ProxmoxResponse<ProxmoxNode[]>>('/nodes');
    
    console.log('Full nodes response:', JSON.stringify(response.data, null, 2));
    
    if (!response.data?.data) {
      console.error('Invalid response format - missing data:', response.data);
      return [];
    }

    const nodes = response.data.data;
    console.log('Parsed nodes:', nodes);

    if (!Array.isArray(nodes)) {
      console.error('Nodes data is not an array:', nodes);
      return [];
    }

    return nodes;
  } catch (error) {
    console.error('Error fetching nodes:', error);
    return [];
  }
}

function transformVMData(vmData: RawVMData, node: string): VirtualMachine {
  console.log('Raw VM Data:', vmData);
  
  return {
    id: vmData.vmid.toString(),
    name: vmData.name || `VM ${vmData.vmid}`,
    status: vmData.status,
    memory: {
      used: vmData.mem || 0,
      total: vmData.maxmem || 0,
    },
    cpu: {
      usage: vmData.cpu || 0,
      cores: vmData.cpus || 1,
    },
    disk: {
      used: vmData.disk || 0,
      total: vmData.maxdisk || 1,
    },
    network: {
      macAddress: vmData.net0?.match(/([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})/)?.[0] || 'N/A',
      ipAddress: vmData.ip || undefined,
    },
    uptime: vmData.uptime,
    node: node
  };
}

export async function getVirtualMachines(): Promise<VirtualMachine[]> {
  try {
    const api = await createAuthenticatedApi();
    const nodes = await getNodes();
    
    console.log('Retrieved nodes for VM fetch:', nodes);
    
    if (!nodes || nodes.length === 0) {
      console.warn('No nodes found or unable to fetch nodes');
      return [];
    }

    // Get VMs from all nodes
    const vmPromises = nodes.map(async (node: ProxmoxNode) => {
      try {
        console.log(`Fetching VMs for node: ${node.node}`);
        const response = await api.get<ProxmoxResponse<RawVMListResponse[]>>(`/nodes/${node.node}/qemu`);
        
        console.log(`Full VM response for node ${node.node}:`, JSON.stringify(response.data, null, 2));
        
        if (!response.data?.data) {
          console.error(`Invalid VM response format for node ${node.node}:`, response.data);
          return [];
        }

        const vms = response.data.data;
        console.log(`Parsed VMs for node ${node.node}:`, vms);

        if (!Array.isArray(vms)) {
          console.error(`VMs data is not an array for node ${node.node}:`, vms);
          return [];
        }

        return vms.map((vm: RawVMListResponse) => {
          console.log(`Transforming VM data for ${vm.vmid}:`, vm);
          return transformVMData(vm as RawVMData, node.node);
        });
      } catch (error) {
        console.error(`Error fetching VMs from node ${node.node}:`, error);
        return [];
      }
    });

    const vmsFromAllNodes = await Promise.all(vmPromises);
    const flattenedVMs = vmsFromAllNodes.flat();
    console.log('Final transformed VMs:', flattenedVMs);
    return flattenedVMs;
  } catch (error) {
    console.error('Error fetching virtual machines:', error);
    return [];
  }
}

export async function getVMDetails(vmId: string, node: string): Promise<{
  status: VMStatus;
  config: VMConfig;
  rrddata: Array<Record<string, number>>;
  basicData: {
    cpu: { usage: number; cores: number };
    memory: { used: number; total: number };
    disk: { used: number; total: number };
  };
} | null> {
  try {
    const api = await createAuthenticatedApi();
    
    // First, verify that the VM exists
    const vmsResponse = await api.get<ProxmoxResponse<RawVMListResponse[]>>(`/nodes/${node}/qemu`);
    const vms = vmsResponse?.data?.data?.data || [];
    const vm = vms.find((vm: RawVMListResponse) => vm.vmid.toString() === vmId);
    
    if (!vm) {
      console.warn(`VM with ID ${vmId} not found on node ${node}`);
      return null;
    }

    // Get basic VM data
    const basicData = transformVMData(vm, node);

    try {
      // Get additional details with error handling for each request
      const [statusRes, configRes, rrddataRes] = await Promise.all([
        api.get<ProxmoxResponse<VMStatus>>(`/nodes/${node}/qemu/${vmId}/status/current`)
          .catch(() => ({ data: { data: { data: { status: 'unknown', uptime: 0 } } } })),
        api.get<ProxmoxResponse<VMConfig>>(`/nodes/${node}/qemu/${vmId}/config`)
          .catch(() => ({ data: { data: { data: { name: basicData.name, cores: basicData.cpu.cores, memory: 0 } } } })),
        api.get<ProxmoxResponse<Array<Record<string, number>>>>(`/nodes/${node}/qemu/${vmId}/rrddata`)
          .catch(() => ({ data: { data: { data: [] } } }))
      ]);

      return {
        status: {
          ...statusRes?.data?.data?.data || { status: 'unknown', uptime: 0 },
          status: basicData.status
        },
        config: {
          ...configRes?.data?.data?.data || { name: basicData.name, cores: basicData.cpu.cores, memory: 0 },
          name: basicData.name,
          cores: basicData.cpu.cores,
          memory: Math.floor(basicData.memory.total / (1024 * 1024))
        },
        rrddata: rrddataRes?.data?.data?.data || [],
        basicData
      };
    } catch (error) {
      console.error(`Error fetching additional VM details for ${vmId}:`, error);
      return {
        status: {
          status: basicData.status,
          uptime: 0
        },
        config: {
          name: basicData.name,
          cores: basicData.cpu.cores,
          memory: Math.floor(basicData.memory.total / (1024 * 1024))
        },
        rrddata: [],
        basicData
      };
    }
  } catch (error) {
    console.error(`Error fetching VM details for ${vmId}:`, error);
    return null;
  }
} 
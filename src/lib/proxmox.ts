import axios from 'axios';
import https from 'https';
import { VirtualMachine } from '@/types/vm';

interface ProxmoxApiResponse<T> {
  data: T;
  errors?: string[];
  message?: string;
}

interface ProxmoxResponse<T> {
  data: ProxmoxApiResponse<T>;
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
  try {
    const response = await axios.post(
      `${process.env.PROXMOX_API_URL}/access/ticket`,
      new URLSearchParams({
        username: 'root',
        password: process.env.PROXMOX_PASSWORD || '',
        realm: 'pam'
      }),
      {
        httpsAgent: new https.Agent({
          rejectUnauthorized: false
        })
      }
    );

    return {
      ticket: response.data.data.ticket,
      csrf: response.data.data.CSRFPreventionToken
    };
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
}

// Create axios instance with authentication
async function createAuthenticatedApi() {
  const { ticket, csrf } = await getAuthTicket();
  
  return axios.create({
    baseURL: process.env.PROXMOX_API_URL,
    headers: {
      'Cookie': `PVEAuthCookie=${ticket}`,
      'CSRFPreventionToken': csrf
    },
    httpsAgent: new https.Agent({
      rejectUnauthorized: false
    })
  });
}

export async function getNodes(): Promise<ProxmoxNode[]> {
  try {
    const api = await createAuthenticatedApi();
    const response = await api.get<ProxmoxResponse<ProxmoxNode[]>>('/nodes');
    return response?.data?.data?.data || [];
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
    
    if (!nodes || nodes.length === 0) {
      console.warn('No nodes found or unable to fetch nodes');
      return [];
    }

    // Get VMs from all nodes
    const vmPromises = nodes.map(async (node: ProxmoxNode) => {
      try {
        const response = await api.get<ProxmoxResponse<RawVMListResponse[]>>(`/nodes/${node.node}/qemu`);
        const vms = response?.data?.data?.data || [];
        return vms.map((vm: RawVMListResponse) => transformVMData(vm as RawVMData, node.node));
      } catch (error) {
        console.error(`Error fetching VMs from node ${node.node}:`, error);
        return [];
      }
    });

    const vmsFromAllNodes = await Promise.all(vmPromises);
    return vmsFromAllNodes.flat();
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
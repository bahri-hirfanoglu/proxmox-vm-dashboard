import axios from 'axios';
import https from 'https';
import { VirtualMachine } from '@/types/vm';

interface ProxmoxResponse<T> {
  data: {
    data: T;
  };
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

interface VMSnapshot {
  name: string;
  snaptime: number;
  description?: string;
  vmstate?: boolean;
}

interface VMBackup {
  volid: string;
  ctime: number;
  format: string;
  size: number;
}

interface VMDetails {
  status: VMStatus;
  config: VMConfig;
  rrddata: Record<string, number>[];
  snapshots: VMSnapshot[];
  backups: VMBackup[];
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

// Get authentication ticket
async function getTicket(): Promise<string> {
  const { ticket } = await getAuthTicket();
  return ticket;
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

        const vmList = response.data.data;
        if (!Array.isArray(vmList)) {
          console.error(`VMs data is not an array for node ${node.node}:`, vmList);
          return [];
        }

        return vmList.map(vm => {
          console.log(`Transforming VM data for ${vm.vmid}:`, vm);
          return transformVMData(vm, node.node);
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

export async function getVMDetails(vmId: string, node: string): Promise<VMDetails | null> {
  try {
    const api = await createAuthenticatedApi();
    
    // First, verify that the VM exists
    const vmsResponse = await api.get<ProxmoxResponse<RawVMListResponse[]>>(`/nodes/${node}/qemu`);
    
    console.log('VM List Response:', JSON.stringify(vmsResponse.data, null, 2));
    
    if (!vmsResponse?.data?.data) {
      console.error('Invalid VM list response:', vmsResponse);
      return null;
    }

    const vmList = vmsResponse.data.data;
    if (!Array.isArray(vmList)) {
      console.error('VM list is not an array:', vmList);
      return null;
    }

    const vm = vmList.find(vm => vm.vmid.toString() === vmId);
    
    if (!vm) {
      console.warn(`VM with ID ${vmId} not found on node ${node}`);
      return null;
    }

    // Get basic VM data
    const basicData = transformVMData(vm, node);

    // Get all VM details in parallel
    const [statusRes, configRes, rrddataRes, snapshots, backups] = await Promise.all([
      api.get<ProxmoxResponse<VMStatus>>(`/nodes/${node}/qemu/${vmId}/status/current`)
        .catch(error => {
          console.error('Error fetching VM status:', error);
          return null;
        }),
      api.get<ProxmoxResponse<VMConfig>>(`/nodes/${node}/qemu/${vmId}/config`)
        .catch(error => {
          console.error('Error fetching VM config:', error);
          return null;
        }),
      api.get<ProxmoxResponse<Array<Record<string, number>>>>(`/nodes/${node}/qemu/${vmId}/rrddata`, {
        params: {
          timeframe: 'hour'
        }
      }).catch(error => {
          console.error('Error fetching VM rrddata:', error);
          return null;
        }),
      getVMSnapshots(vmId, node),
      getVMBackups(vmId, node)
    ]);

    // Create default values for missing data
    const defaultStatus: VMStatus = {
      status: basicData.status,
      uptime: 0,
      qmpstatus: 'unknown'
    };

    const defaultConfig: VMConfig = {
      name: basicData.name,
      cores: basicData.cpu.cores,
      memory: Math.floor(basicData.memory.total / (1024 * 1024))
    };

    return {
      status: statusRes?.data?.data || defaultStatus,
      config: configRes?.data?.data || defaultConfig,
      rrddata: rrddataRes?.data?.data || [],
      snapshots: snapshots || [],
      backups: backups || []
    };
  } catch (error) {
    console.error('Error fetching VM details:', error);
    return null;
  }
}

// Get VM snapshots
export async function getVMSnapshots(vmId: string, node: string): Promise<VMSnapshot[]> {
  try {
    const api = await createAuthenticatedApi();
    const response = await api.get<ProxmoxResponse<VMSnapshot[]>>(`/nodes/${node}/qemu/${vmId}/snapshot`);
    return response.data?.data || [];
  } catch (error) {
    console.error('Error fetching VM snapshots:', error);
    return [];
  }
}

// Get VM backups
export async function getVMBackups(vmId: string, node: string): Promise<VMBackup[]> {
  try {
    const api = await createAuthenticatedApi();
    const response = await api.get<ProxmoxResponse<VMBackup[]>>(`/nodes/${node}/storage/local/content`, {
      params: {
        content: 'backup',
        vmid: vmId
      }
    });
    return response.data?.data || [];
  } catch (error) {
    console.error('Error fetching VM backups:', error);
    return [];
  }
} 
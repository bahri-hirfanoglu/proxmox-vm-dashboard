import axios from 'axios';
import https from 'https';
import { VirtualMachine } from '@/types/vm';

interface ProxmoxResponse<T> {
  data: T;
  errors?: string[];
  message?: string;
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

export async function getNodes() {
  try {
    const api = await createAuthenticatedApi();
    const response = await api.get('/nodes');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching nodes:', error);
    throw error;
  }
}

function transformVMData(vmData: any, node: string): VirtualMachine {
  console.log('Raw VM Data:', vmData); // For debugging
  
  return {
    id: vmData.vmid.toString(),
    name: vmData.name || `VM ${vmData.vmid}`,
    status: vmData.status as 'running' | 'stopped' | 'paused',
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

export async function getVirtualMachines() {
  try {
    const api = await createAuthenticatedApi();
    const nodes = await getNodes();
    
    // Get VMs from all nodes
    const vmPromises = nodes.map(async (node) => {
      try {
        const response = await api.get(`/nodes/${node.node}/qemu`);
        return response.data.data.map((vm: any) => transformVMData(vm, node.node));
      } catch (error) {
        console.error(`Error fetching VMs from node ${node.node}:`, error);
        return [];
      }
    });

    const vmsFromAllNodes = await Promise.all(vmPromises);
    return vmsFromAllNodes.flat();
  } catch (error) {
    console.error('Error fetching virtual machines:', error);
    throw error;
  }
}

export async function getVMDetails(vmId: string, node: string): Promise<ProxmoxResponse<{
  status: VMStatus;
  config: VMConfig;
  rrddata: Array<Record<string, number>>;
  basicData: {
    cpu: { usage: number; cores: number };
    memory: { used: number; total: number };
    disk: { used: number; total: number };
  };
}>> {
  try {
    const api = await createAuthenticatedApi();
    
    // First, verify that the VM exists
    const vmsResponse = await api.get(`/nodes/${node}/qemu`);
    const vm = vmsResponse.data.data.find((vm: any) => vm.vmid.toString() === vmId);
    
    if (!vm) {
      throw new Error(`VM with ID ${vmId} not found on node ${node}`);
    }

    // Get basic VM data
    const basicData = transformVMData(vm, node);

    // Get additional details
    const [status, config, rrddata] = await Promise.all([
      api.get(`/nodes/${node}/qemu/${vmId}/status/current`).catch(() => ({ data: { data: { status: 'unknown' } } })),
      api.get(`/nodes/${node}/qemu/${vmId}/config`).catch(() => ({ data: { data: {} } })),
      api.get(`/nodes/${node}/qemu/${vmId}/rrddata`).catch(() => ({ data: { data: [] } }))
    ]);

    return {
      status: {
        ...status.data.data,
        status: basicData.status // Use the status from basic data as it's more reliable
      },
      config: {
        ...config.data.data,
        name: basicData.name, // Use the name from basic data
        cores: basicData.cpu.cores,
        memory: Math.floor(basicData.memory.total / (1024 * 1024)) // Convert to MB
      },
      rrddata: rrddata.data.data,
      basicData // Include the basic data for reference
    };
  } catch (error) {
    console.error(`Error fetching VM details for ${vmId}:`, error);
    throw error;
  }
} 
export interface VirtualMachine {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'paused';
  memory: {
    used: number;
    total: number;
  };
  cpu: {
    usage: number;
    cores: number;
  };
  disk: {
    used: number;
    total: number;
  };
  network: {
    macAddress: string;
    ipAddress?: string;
  };
  uptime?: number;
  node: string;
} 
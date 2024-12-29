import { getVirtualMachines, getNodes } from '@/lib/proxmox';
import { VMList } from '@/components/VMList';
import { Navbar } from '@/components/Navbar';
import {
  CpuChipIcon,
  CircleStackIcon,
  ServerIcon,
  ClockIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline';

function formatBytes(bytes: number, decimals = 2) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

export const revalidate = 30;

export default async function Home() {
  try {
    const nodes = await getNodes();
    const vms = await getVirtualMachines();

    // Calculate total node statistics
    const nodeStats = nodes.reduce((acc, node) => {
      return {
        totalCpu: acc.totalCpu + (node.cpu || 0),
        maxCpu: acc.maxCpu + (node.maxcpu || 0),
        totalMem: acc.totalMem + (node.mem || 0),
        maxMem: acc.maxMem + (node.maxmem || 0),
        nodeCount: acc.nodeCount + 1,
        onlineNodes: acc.onlineNodes + (node.status === 'online' ? 1 : 0),
      };
    }, {
      totalCpu: 0,
      maxCpu: 0,
      totalMem: 0,
      maxMem: 0,
      nodeCount: 0,
      onlineNodes: 0,
    });

    const hostStats = [
      {
        name: 'CPU Usage',
        value: `${((nodeStats.totalCpu / nodeStats.maxCpu) * 100).toFixed(1)}%`,
        subtext: `${nodeStats.maxCpu} Cores`,
        icon: CpuChipIcon,
        color: 'text-blue-500 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-500/10'
      },
      {
        name: 'Memory Usage',
        value: formatBytes(nodeStats.totalMem),
        subtext: `of ${formatBytes(nodeStats.maxMem)}`,
        icon: CircleStackIcon,
        color: 'text-purple-500 dark:text-purple-400',
        bgColor: 'bg-purple-50 dark:bg-purple-500/10'
      },
      {
        name: 'Node Status',
        value: `${nodeStats.onlineNodes} / ${nodeStats.nodeCount}`,
        subtext: 'Online Nodes',
        icon: ServerIcon,
        color: 'text-emerald-500 dark:text-emerald-400',
        bgColor: 'bg-emerald-50 dark:bg-emerald-500/10'
      },
      {
        name: 'Active VMs',
        value: `${vms.filter(vm => vm.status === 'running').length}`,
        subtext: `Total: ${vms.length} VMs`,
        icon: ClockIcon,
        color: 'text-amber-500 dark:text-amber-400',
        bgColor: 'bg-amber-50 dark:bg-amber-500/10'
      }
    ];

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8">
          {/* Host Statistics */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4 flex items-center">
              <ServerIcon className="w-5 h-5 mr-2 text-gray-400 dark:text-slate-500" />
              Host Statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {hostStats.map((stat, index) => (
                <div key={index} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-slate-400">
                      {stat.name}
                    </span>
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                      {stat.subtext}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Virtual Machines */}
          <div>
            <VMList vms={vms} />
          </div>
        </main>
      </div>
    );
  } catch (error) {
    console.error('Error loading data:', error);
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 dark:border-red-500 p-4 rounded-r-lg">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-400">
                  Error loading host statistics and virtual machines.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

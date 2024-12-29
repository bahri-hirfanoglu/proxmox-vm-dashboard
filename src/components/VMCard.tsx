import { VirtualMachine } from '@/types/vm';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { 
  ComputerDesktopIcon, 
  CpuChipIcon, 
  CircleStackIcon,
  SignalIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface VMCardProps {
  vm: VirtualMachine;
}

export function VMCard({ vm }: VMCardProps) {
  const statusColors = {
    running: 'badge-success',
    stopped: 'badge-danger',
    paused: 'badge-warning',
  };

  const formatMemory = (bytes: number) => {
    return `${((bytes || 0) / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const formatDiskUsage = (used: number, total: number) => {
    if (!total) return 'N/A';
    return `${((used / total) * 100).toFixed(1)}%`;
  };

  return (
    <div className="card p-6 group">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
            <ComputerDesktopIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 leading-tight">
              {vm.name}
            </h3>
            <span className={cn('badge mt-1', statusColors[vm.status] || 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300')}>
              {vm.status}
            </span>
          </div>
        </div>
        <Link 
          href={`/vm/${vm.id}?node=${vm.node}`}
          className="p-2 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
        >
          <ArrowTopRightOnSquareIcon className="w-5 h-5 text-gray-400 dark:text-slate-500 group-hover:text-gray-600 dark:group-hover:text-slate-300" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <CpuChipIcon className="w-4 h-4 text-gray-400 dark:text-slate-500" />
            <span className="stat-label">CPU Usage</span>
          </div>
          <div className="stat-value">{(vm.cpu.usage * 100).toFixed(1)}%</div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <CircleStackIcon className="w-4 h-4 text-gray-400 dark:text-slate-500" />
            <span className="stat-label">Memory</span>
          </div>
          <div className="stat-value">
            {formatMemory(vm.memory.used)} / {formatMemory(vm.memory.total)}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <SignalIcon className="w-4 h-4 text-gray-400 dark:text-slate-500" />
            <span className="stat-label">Network</span>
          </div>
          <div className="stat-value font-mono text-xs">
            {vm.network.macAddress}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <CircleStackIcon className="w-4 h-4 text-gray-400 dark:text-slate-500" />
            <span className="stat-label">Storage</span>
          </div>
          <div className="stat-value">
            {formatDiskUsage(vm.disk.used, vm.disk.total)}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100/10 dark:border-slate-700/50">
        <div className="flex items-center justify-between">
          <span className="stat-label">Node</span>
          <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-0.5 rounded-full">
            {vm.node}
          </span>
        </div>
      </div>
    </div>
  );
} 
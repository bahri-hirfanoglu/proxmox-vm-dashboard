'use client';

import { VMCard } from '@/components/VMCard';
import { VirtualMachine } from '@/types/vm';
import { 
  Squares2X2Icon, 
  ListBulletIcon,
  ComputerDesktopIcon,
  CpuChipIcon,
  CircleStackIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';

function ViewModeToggle({ mode, onChange }: { mode: 'grid' | 'list', onChange: (mode: 'grid' | 'list') => void }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-1 inline-flex shadow-sm">
      <button
        onClick={() => onChange('grid')}
        className={`${
          mode === 'grid'
            ? 'bg-indigo-50 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400'
            : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
        } p-2 rounded-md transition-colors`}
      >
        <Squares2X2Icon className="w-5 h-5" />
      </button>
      <button
        onClick={() => onChange('list')}
        className={`${
          mode === 'list'
            ? 'bg-indigo-50 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400'
            : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
        } p-2 rounded-md transition-colors`}
      >
        <ListBulletIcon className="w-5 h-5" />
      </button>
    </div>
  );
}

function VMListView({ vms }: { vms: VirtualMachine[] }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
          <thead className="bg-gray-50 dark:bg-slate-700/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                CPU
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Memory
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Disk
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Node
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
            {vms.map((vm) => (
              <tr 
                key={vm.id} 
                className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                onClick={() => window.location.href = `/vm/${vm.id}?node=${vm.node}`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg mr-3">
                      <ComputerDesktopIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                        {vm.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-slate-400">
                        ID: {vm.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${vm.status === 'running' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400'
                      : vm.status === 'stopped'
                      ? 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400'
                    }`}
                  >
                    {vm.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <CpuChipIcon className="w-4 h-4 text-gray-400 dark:text-slate-500 mr-2" />
                    <span className="text-sm text-gray-900 dark:text-slate-100">
                      {(vm.cpu.usage * 100).toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <CircleStackIcon className="w-4 h-4 text-gray-400 dark:text-slate-500 mr-2" />
                    <span className="text-sm text-gray-900 dark:text-slate-100">
                      {Math.round(vm.memory.used / (1024 * 1024 * 1024))} / {Math.round(vm.memory.total / (1024 * 1024 * 1024))} GB
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <CircleStackIcon className="w-4 h-4 text-gray-400 dark:text-slate-500 mr-2" />
                    <span className="text-sm text-gray-900 dark:text-slate-100">
                      {((vm.disk.used / vm.disk.total) * 100).toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                    {vm.node}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface VMListProps {
  vms: VirtualMachine[];
}

export function VMList({ vms }: VMListProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
            Virtual Machines
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Manage and monitor your virtual machines
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <ViewModeToggle mode={viewMode} onChange={setViewMode} />
          <span className="text-sm text-gray-500 dark:text-slate-400">
            Auto-refresh: 30s
          </span>
        </div>
      </div>
      
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vms.map((vm: VirtualMachine) => (
            <VMCard key={vm.id} vm={vm} />
          ))}
        </div>
      ) : (
        <VMListView vms={vms} />
      )}
    </main>
  );
} 
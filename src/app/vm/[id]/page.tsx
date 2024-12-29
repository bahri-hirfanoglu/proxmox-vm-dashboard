import { getVMDetails } from '@/lib/proxmox';
import { 
  ComputerDesktopIcon,
  CpuChipIcon,
  CircleStackIcon,
  ClockIcon,
  SignalIcon,
  ChartBarIcon,
  CogIcon,
  ServerIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
  CloudIcon,
  CommandLineIcon
} from '@heroicons/react/24/outline';
import { Navbar } from '@/components/Navbar';

export const revalidate = 30;

interface Props {
  params: { id: string };
  searchParams: { node?: string };
}

function formatBytes(bytes: number, decimals = 2) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

function formatUptime(seconds: number) {
  if (!seconds) return 'Not running';
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  
  return parts.join(' ') || '< 1m';
}

function StatusBadge({ status }: { status: string }) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running':
        return 'bg-emerald-400/10 text-emerald-400 ring-emerald-400/20';
      case 'stopped':
        return 'bg-red-400/10 text-red-400 ring-red-400/20';
      case 'paused':
        return 'bg-yellow-400/10 text-yellow-400 ring-yellow-400/20';
      default:
        return 'bg-slate-400/10 text-slate-400 ring-slate-400/20';
    }
  };

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(status)}`}>
      {status}
    </span>
  );
}

export default async function VMDetailPage(props: Props) {
  const vmId = props.params.id;
  const nodeName = props.searchParams.node;

  if (!nodeName) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <Navbar showBackButton />
        <main className="container mx-auto px-4 py-8">
          <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 dark:border-red-500 p-4 rounded-r-lg">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-400">
                  Node parameter is missing. Please return to the home page and try again.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  try {
    const vmDetails = await getVMDetails(vmId, nodeName);
    const { status, config, rrddata, basicData } = vmDetails;

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <Navbar showBackButton />

        <main className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">
                <ComputerDesktopIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                    {config.name || `VM ${vmId}`}
                  </h1>
                  <StatusBadge status={status.status} />
                </div>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="inline-flex items-center text-sm text-gray-500 dark:text-slate-400">
                    <ServerIcon className="w-4 h-4 mr-1" />
                    Node: {nodeName}
                  </span>
                  <span className="inline-flex items-center text-sm text-gray-500 dark:text-slate-400">
                    <CommandLineIcon className="w-4 h-4 mr-1" />
                    ID: {vmId}
                  </span>
                  <span className="inline-flex items-center text-sm text-gray-500 dark:text-slate-400">
                    <CloudIcon className="w-4 h-4 mr-1" />
                    Type: {config.ostype || 'Unknown OS'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[
              {
                label: 'CPU Usage',
                value: `${(basicData.cpu.usage * 100).toFixed(1)}%`,
                subtext: `${basicData.cpu.cores} Cores`,
                icon: CpuChipIcon,
                color: 'text-blue-500 dark:text-blue-400',
                bg: 'bg-blue-50 dark:bg-blue-500/10'
              },
              {
                label: 'Memory Usage',
                value: formatBytes(basicData.memory.used),
                subtext: `of ${formatBytes(basicData.memory.total)}`,
                icon: CircleStackIcon,
                color: 'text-purple-500 dark:text-purple-400',
                bg: 'bg-purple-50 dark:bg-purple-500/10'
              },
              {
                label: 'Disk Usage',
                value: `${((basicData.disk.used / basicData.disk.total) * 100).toFixed(1)}%`,
                subtext: `${formatBytes(basicData.disk.used)} / ${formatBytes(basicData.disk.total)}`,
                icon: CircleStackIcon,
                color: 'text-emerald-500 dark:text-emerald-400',
                bg: 'bg-emerald-50 dark:bg-emerald-500/10'
              },
              {
                label: 'Uptime',
                value: formatUptime(status.uptime),
                subtext: status.qmpstatus || status.status,
                icon: ClockIcon,
                color: 'text-amber-500 dark:text-amber-400',
                bg: 'bg-amber-50 dark:bg-amber-500/10'
              }
            ].map((stat, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-slate-400">
                    {stat.label}
                  </span>
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* System Configuration */}
            <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-6 flex items-center">
                <CogIcon className="w-5 h-5 mr-2 text-gray-400 dark:text-slate-500" />
                System Configuration
              </h2>
              <dl className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-700/50">
                  <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">BIOS Type</dt>
                  <dd className="text-sm font-semibold text-gray-900 dark:text-slate-100">{config.bios || 'Default'}</dd>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-700/50">
                  <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Machine Type</dt>
                  <dd className="text-sm font-semibold text-gray-900 dark:text-slate-100">{config.machine || 'Default'}</dd>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-700/50">
                  <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">CPU Type</dt>
                  <dd className="text-sm font-semibold text-gray-900 dark:text-slate-100">{config.cpu || 'Default'}</dd>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-700/50">
                  <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">KVM Hardware virtualization</dt>
                  <dd className="text-sm font-semibold text-gray-900 dark:text-slate-100">{config.kvm === 1 ? 'Enabled' : 'Disabled'}</dd>
                </div>
                {config.scsihw && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-700/50">
                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">SCSI Controller</dt>
                    <dd className="text-sm font-semibold text-gray-900 dark:text-slate-100">{config.scsihw}</dd>
                  </div>
                )}
                {config.tablet && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-700/50">
                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">USB Tablet</dt>
                    <dd className="text-sm font-semibold text-gray-900 dark:text-slate-100">{config.tablet === 1 ? 'Enabled' : 'Disabled'}</dd>
                  </div>
                )}
              </dl>
            </section>

            {/* Hardware Resources */}
            <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-6 flex items-center">
                <ServerIcon className="w-5 h-5 mr-2 text-gray-400 dark:text-slate-500" />
                Hardware Resources
              </h2>
              <dl className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-700/50">
                  <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">CPU Cores</dt>
                  <dd className="text-sm font-semibold text-gray-900 dark:text-slate-100">{config.cores || config.sockets || 'N/A'}</dd>
                </div>
                {config.sockets && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-700/50">
                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">CPU Sockets</dt>
                    <dd className="text-sm font-semibold text-gray-900 dark:text-slate-100">{config.sockets}</dd>
                  </div>
                )}
                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-700/50">
                  <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Memory</dt>
                  <dd className="text-sm font-semibold text-gray-900 dark:text-slate-100">{config.memory ? `${config.memory} MB` : 'N/A'}</dd>
                </div>
                {config.balloon && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-700/50">
                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Balloon Device</dt>
                    <dd className="text-sm font-semibold text-gray-900 dark:text-slate-100">{config.balloon === 1 ? 'Enabled' : 'Disabled'}</dd>
                  </div>
                )}
                {config.shares && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-700/50">
                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">CPU Shares</dt>
                    <dd className="text-sm font-semibold text-gray-900 dark:text-slate-100">{config.shares}</dd>
                  </div>
                )}
              </dl>
            </section>

            {/* Network Interfaces */}
            <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-6 flex items-center">
                <SignalIcon className="w-5 h-5 mr-2 text-gray-400 dark:text-slate-500" />
                Network Interfaces
              </h2>
              <div className="space-y-6">
                {Object.entries(config)
                  .filter(([key]) => key.startsWith('net'))
                  .map(([key, value]) => (
                    <div key={key} className="bg-gray-50 dark:bg-slate-700/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                          {key.toUpperCase()}
                        </span>
                        <span className="text-xs font-medium text-gray-500 dark:text-slate-400">
                          {String(value).split(',')[0]}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-gray-600 dark:text-slate-300 break-all">
                        {String(value)}
                      </div>
                    </div>
                  ))}
              </div>
            </section>

            {/* Storage Devices */}
            <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 lg:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-6 flex items-center">
                <CircleStackIcon className="w-5 h-5 mr-2 text-gray-400 dark:text-slate-500" />
                Storage Devices
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(config)
                  .filter(([key]) => key.startsWith('scsi') || key.startsWith('virtio') || key.startsWith('ide') || key.startsWith('sata'))
                  .map(([key, value]) => (
                    <div key={key} className="bg-gray-50 dark:bg-slate-700/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                          {key.toUpperCase()}
                        </span>
                        <span className="text-xs font-medium text-gray-500 dark:text-slate-400">
                          {String(value).split(',')[0]}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-gray-600 dark:text-slate-300 break-all">
                        {String(value)}
                      </div>
                    </div>
                  ))}
              </div>
            </section>

            {/* Security Settings */}
            <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-6 flex items-center">
                <ShieldCheckIcon className="w-5 h-5 mr-2 text-gray-400 dark:text-slate-500" />
                Security Settings
              </h2>
              <dl className="space-y-4">
                {config.protection && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-700/50">
                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Protection</dt>
                    <dd className="text-sm font-semibold text-gray-900 dark:text-slate-100">{config.protection === 1 ? 'Enabled' : 'Disabled'}</dd>
                  </div>
                )}
                {config.freeze && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-700/50">
                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Freeze CPU at Startup</dt>
                    <dd className="text-sm font-semibold text-gray-900 dark:text-slate-100">{config.freeze === 1 ? 'Yes' : 'No'}</dd>
                  </div>
                )}
                {config.hookscript && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-700/50">
                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Hook Script</dt>
                    <dd className="text-sm font-semibold text-gray-900 dark:text-slate-100">{config.hookscript}</dd>
                  </div>
                )}
              </dl>
            </section>

            {/* Performance Metrics */}
            {rrddata && rrddata.length > 0 && (
              <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 lg:col-span-3">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-6 flex items-center">
                  <ArrowPathIcon className="w-5 h-5 mr-2 text-gray-400 dark:text-slate-500" />
                  Performance History
                </h2>
                <div className="bg-gray-50 dark:bg-slate-700/30 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-gray-700 dark:text-slate-300">
                    {JSON.stringify(rrddata[0], null, 2)}
                  </pre>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    );
  } catch (error) {
    console.error('VM Details Error:', error);
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <Navbar showBackButton />
        <main className="container mx-auto px-4 py-8">
          <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 dark:border-red-500 p-4 rounded-r-lg">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-400">
                  Error loading VM details. The VM might not exist or there was a problem connecting to the server.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
} 
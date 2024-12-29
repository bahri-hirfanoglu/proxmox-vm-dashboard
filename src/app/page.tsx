import { getVirtualMachines } from '@/lib/proxmox';
import { VMList } from '@/components/VMList';
import { Navbar } from '@/components/Navbar';

export const revalidate = 30;

export default async function Home() {
  const vms = await getVirtualMachines();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navbar />
      <VMList vms={vms} />
    </div>
  );
}

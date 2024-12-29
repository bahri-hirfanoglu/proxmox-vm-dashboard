'use client';

import { ServerIcon } from '@heroicons/react/24/outline';
import { ThemeToggle } from './ThemeToggle';
import Link from 'next/link';

interface NavbarProps {
  showBackButton?: boolean;
}

export function Navbar({ showBackButton }: NavbarProps) {
  return (
    <nav className="bg-white/80 dark:bg-slate-800/50 border-b border-gray-200/50 dark:border-slate-700/50 backdrop-blur-sm supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">
              <ServerIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
              Proxmox Dashboard
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Link
                href="/"
                className="text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100"
              >
                Back to Overview
              </Link>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
} 
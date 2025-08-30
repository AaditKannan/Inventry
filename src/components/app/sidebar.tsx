'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Boxes,
  MessageSquare,
  Users,
  Map,
  Settings,
  LogOut,
  Menu,
  X,
  FileText,
  Database,
  Trophy,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/app', icon: LayoutDashboard },
  { name: 'Invoices', href: '/app/invoices', icon: FileText },
  { name: 'Inventory', href: '/app/inventory', icon: Package },
  { name: 'Parts Library', href: '/app/parts', icon: Database },
  { name: 'Requests', href: '/app/requests', icon: MessageSquare },
  { name: 'Leaderboard', href: '/app/leaderboard', icon: Trophy },
  { name: 'Teams', href: '/app/teams', icon: Users },
  { name: 'Map', href: '/app/map', icon: Map },
  { name: 'Settings', href: '/app/settings', icon: Settings },
];

export function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar - sticky on desktop, fixed on mobile */}
      <div
        className={`lg:sticky lg:top-0 lg:inset-y-0 lg:left-0 lg:z-40 w-64 bg-slate-900/95 backdrop-blur-xl border-r border-white/20 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:transform-none`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-white/20">
            <Link href="/app" className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
              Inventry
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 shadow-lg shadow-blue-500/25'
                      : 'text-blue-200 hover:bg-white/10 hover:text-white hover:border-white/20'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Sign out */}
          <div className="p-4 border-t border-white/20">
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full justify-start gap-3 bg-white/10 border-white/20 text-blue-200 hover:bg-white/20 hover:border-blue-400 hover:text-white"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}

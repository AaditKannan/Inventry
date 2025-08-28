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
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/app', icon: LayoutDashboard },
  { name: 'Parts', href: '/app/parts', icon: Package },
  { name: 'Inventory', href: '/app/inventory', icon: Boxes },
  { name: 'Requests', href: '/app/requests', icon: MessageSquare },
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
        className={`lg:sticky lg:top-0 lg:inset-y-0 lg:left-0 lg:z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:transform-none`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
            <Link href="/app" className="text-xl font-bold text-blue-600">
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
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
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
          <div className="p-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full justify-start gap-3"
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

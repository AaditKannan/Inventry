import { Sidebar } from '@/components/app/sidebar';
import { Toaster } from '@/components/ui/toaster';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      {/* Main content area with proper spacing from sidebar */}
      <main className="flex-1 overflow-auto lg:ml-0">
        {/* Add top padding for mobile menu button on small screens */}
        <div className="lg:hidden h-16"></div>
        {children}
      </main>
      <Toaster />
    </div>
  );
}

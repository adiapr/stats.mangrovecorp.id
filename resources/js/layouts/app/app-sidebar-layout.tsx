import { Link } from '@inertiajs/react';
import { LayoutGrid, Menu, Plus, ShoppingCart, Users } from 'lucide-react';
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { dashboard } from '@/routes';
import { useSidebar } from '@/components/ui/sidebar';
import type { AppLayoutProps } from '@/types';

function MobileBottomNav() {
    const { isCurrentUrl } = useCurrentUrl();
    const { toggleSidebar } = useSidebar();

    return (
        <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around rounded-t-[1.75rem] border-t border-pink-100 bg-white px-2 pt-2 pb-[max(env(safe-area-inset-bottom),0.75rem)] shadow-[0_-10px_40px_-10px_rgba(236,72,153,0.18)] md:hidden">
            <Link
                href={dashboard()}
                className={`flex flex-col items-center gap-1 p-2 transition-colors ${
                    isCurrentUrl(dashboard())
                        ? 'text-pink-600'
                        : 'text-pink-300 hover:text-pink-500'
                }`}
            >
                <LayoutGrid className="size-5" />
                <span className="text-[10px] font-bold">Dashboard</span>
            </Link>

            <button
                type="button"
                className="flex flex-col items-center gap-1 p-2 text-pink-300 transition-colors hover:text-pink-500"
            >
                <ShoppingCart className="size-5" />
                <span className="text-[10px] font-bold">Order</span>
            </button>

            <button
                type="button"
                className="relative -top-6 flex size-[68px] items-center justify-center rounded-full border-[6px] border-[#fffbfc] bg-pink-600 text-white shadow-xl shadow-pink-400/40 transition-transform hover:-translate-y-1"
            >
                <Plus className="size-8" />
            </button>

            <button
                type="button"
                className="flex flex-col items-center gap-1 p-2 text-pink-300 transition-colors hover:text-pink-500"
            >
                <Users className="size-5" />
                <span className="text-[10px] font-bold">Customer</span>
            </button>

            <button
                type="button"
                onClick={toggleSidebar}
                className="flex flex-col items-center gap-1 p-2 text-pink-300 transition-colors hover:text-pink-500"
            >
                <Menu className="size-5" />
                <span className="text-[10px] font-bold">Menu</span>
            </button>
        </nav>
    );
}

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="relative flex flex-col overflow-hidden bg-[#fff5f7]">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <main className="flex-1 overflow-y-auto bg-blue-50/20 p-6 pb-32 md:p-8 md:pb-10">
                    {children}
                </main>
                <MobileBottomNav />
            </AppContent>
        </AppShell>
    );
}

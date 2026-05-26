import { Link, usePage } from '@inertiajs/react';
import { BarChart3, ChevronDown, Eye, FileText, LayoutGrid, Package, PencilLine, Settings, ShoppingBag, ShoppingCart, Users, X } from 'lucide-react';
import { useState } from 'react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    useSidebar,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { analytics, dashboard } from '@/routes';
import { edit as profileEdit } from '@/routes/profile';
import type { Auth } from '@/types';

function NavLink({
    href,
    icon: Icon,
    label,
    active,
    prominent = false,
}: {
    href: string;
    icon: typeof LayoutGrid;
    label: string;
    active: boolean;
    prominent?: boolean;
}) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-all ${
                prominent
                    ? active
                        ? 'bg-amber-700 font-bold text-white shadow-md shadow-amber-300/50'
                        : 'font-semibold text-amber-800 hover:bg-amber-200/60 hover:text-amber-900'
                    : active
                      ? 'border border-amber-400/40 bg-amber-400/20 font-bold text-amber-950'
                      : 'border border-transparent font-medium text-amber-800 hover:bg-amber-200/50 hover:text-amber-950'
            }`}
        >
            <Icon className="size-5 shrink-0 opacity-75" />
            <span>{label}</span>
        </Link>
    );
}

export function AppSidebar() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const { isCurrentUrl, isCurrentOrParentUrl } = useCurrentUrl();
    const { isMobile, setOpenMobile } = useSidebar();
    const firstName = auth.user?.name?.split(' ')[0] ?? 'A';
    const katalogActive = isCurrentOrParentUrl('/admin/product') || isCurrentOrParentUrl('/admin/frame');
    const laporanActive = isCurrentOrParentUrl('/admin/laporan');
    const [katalogOpen, setKatalogOpen] = useState(katalogActive);
    const [laporanOpen, setLaporanOpen] = useState(laporanActive);

    return (
        <Sidebar collapsible="offcanvas" variant="sidebar" className="border-none">
            <div className="relative flex h-full flex-col overflow-hidden bg-[linear-gradient(160deg,#fefce8_0%,#fef9c3_35%,#fef08a_70%,#fde047_100%)] text-amber-900">
                {/* Subtle geometric blobs */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-yellow-300/30" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-amber-300/20" />
                    <div className="absolute right-0 top-[38%] h-36 w-36 rounded-full bg-amber-200/25" />
                </div>

                {/* Dot grid texture */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.055]"
                    style={{
                        backgroundImage:
                            "url(\"data:image/svg+xml,%3Csvg width='16' height='16' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1.2' fill='%23713f12'/%3E%3C/svg%3E\")",
                        backgroundSize: '16px 16px',
                    }}
                />

                {/* ── Header ── */}
                <SidebarHeader className="relative z-10 border-b border-amber-400/30 px-5 py-5">
                    <div className="flex items-center justify-between">
                        <img
                            src="https://mangrovecorp.id/assets/img/logo.png"
                            alt="Mangrove Corp"
                            className="h-8 w-auto object-contain"
                        />
                        {isMobile && (
                            <button
                                type="button"
                                onClick={() => setOpenMobile(false)}
                                className="rounded-lg p-1.5 text-amber-700 transition-colors hover:bg-amber-200/60 hover:text-amber-900"
                            >
                                <X className="size-5" />
                            </button>
                        )}
                    </div>
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.28em] text-amber-700">
                        Statistics Dashboard
                    </p>
                </SidebarHeader>

                {/* ── Navigation ── */}
                <SidebarContent className="relative z-10 overflow-y-auto px-3 py-5">
                    <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-amber-700/55">
                        Main Menu
                    </p>

                    <nav className="space-y-0.5">
                        <NavLink href={dashboard().url} icon={LayoutGrid} label="Dashboard" active={isCurrentUrl(dashboard())} />
                        <NavLink href={analytics().url} icon={BarChart3} label="IDPhotobook" active={isCurrentUrl(analytics())} />
                        {/* <NavLink href="/admin/order/create" icon={PencilLine} label="Input Order" active={isCurrentUrl('/admin/order/create')} prominent />
                        <NavLink href="/admin/order" icon={ShoppingCart} label="Orders" active={isCurrentOrParentUrl('/admin/order')} />

                        <div className="space-y-1">
                            <button
                                type="button"
                                onClick={() => setKatalogOpen((open) => !open)}
                                className="flex w-full items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-amber-800 transition-all hover:bg-amber-200/50 hover:text-amber-950"
                            >
                                <div className="flex items-center gap-3">
                                    <Package className="size-5 opacity-75" />
                                    <span>Katalog</span>
                                </div>
                                <ChevronDown className={`size-4 transition-transform ${katalogOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {katalogOpen && (
                                <div className="ml-4 space-y-0.5 border-l border-amber-400/40 px-3">
                                    <Link href="/admin/product" className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-all ${isCurrentOrParentUrl('/admin/product') ? 'font-bold text-amber-950' : 'font-medium text-amber-700 hover:text-amber-900'}`}>
                                        Produk
                                    </Link>
                                    <Link href="/admin/frame" className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-all ${isCurrentOrParentUrl('/admin/frame') ? 'font-bold text-amber-950' : 'font-medium text-amber-700 hover:text-amber-900'}`}>
                                        Frame
                                    </Link>
                                </div>
                            )}
                        </div>

                        <div className="space-y-1">
                            <button
                                type="button"
                                onClick={() => setLaporanOpen((open) => !open)}
                                className={`flex w-full items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-sm transition-all ${laporanActive ? 'border border-amber-400/40 bg-amber-400/20 font-bold text-amber-950' : 'font-medium text-amber-800 hover:bg-amber-200/50 hover:text-amber-950'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <FileText className="size-5 opacity-75" />
                                    <span>Laporan</span>
                                </div>
                                <ChevronDown className={`size-4 transition-transform ${laporanOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {laporanOpen && (
                                <div className="ml-4 space-y-0.5 border-l border-amber-400/40 px-3">
                                    <Link href="/admin/laporan/order-report" className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-all ${isCurrentUrl('/admin/laporan/order-report') ? 'font-bold text-amber-950' : 'font-medium text-amber-700 hover:text-amber-900'}`}>
                                        <span className={`size-1.5 rounded-full ${isCurrentUrl('/admin/laporan/order-report') ? 'bg-amber-700' : 'bg-amber-400'}`} />
                                        Order Report
                                    </Link>
                                    <Link href="/admin/laporan/resi-report" className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-all ${isCurrentUrl('/admin/laporan/resi-report') ? 'font-bold text-amber-950' : 'font-medium text-amber-700 hover:text-amber-900'}`}>
                                        <span className={`size-1.5 rounded-full ${isCurrentUrl('/admin/laporan/resi-report') ? 'bg-amber-700' : 'bg-amber-400'}`} />
                                        Resi Report
                                    </Link>
                                    <Link href="/admin/laporan/leads-report" className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-all ${isCurrentUrl('/admin/laporan/leads-report') ? 'font-bold text-amber-950' : 'font-medium text-amber-700 hover:text-amber-900'}`}>
                                        <span className={`size-1.5 rounded-full ${isCurrentUrl('/admin/laporan/leads-report') ? 'bg-amber-700' : 'bg-amber-400'}`} />
                                        Leads Report
                                    </Link>
                                </div>
                            )}
                        </div>

                        <NavLink href="/admin/pengguna" icon={Users} label="Pengguna" active={isCurrentOrParentUrl('/admin/pengguna')} />
                        <NavLink href="/admin/web-order" icon={ShoppingBag} label="Web Order" active={isCurrentOrParentUrl('/admin/web-order')} />
                        <NavLink href="/admin/visitor-tracking" icon={Eye} label="Visitor Tracking" active={isCurrentOrParentUrl('/admin/visitor-tracking')} />
                        <NavLink href={profileEdit().url} icon={Settings} label="Pengaturan" active={isCurrentOrParentUrl(profileEdit().url)} /> */}
                    </nav>
                </SidebarContent>

                {/* ── Footer ── */}
                <SidebarFooter className="relative z-10 border-t border-amber-400/30 bg-amber-300/25 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-lg border-2 border-amber-400/60 bg-amber-100 text-sm font-bold text-amber-800 shadow-sm">
                            {firstName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-amber-950">{firstName}</p>
                            <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                                Administrator
                            </p>
                        </div>
                    </div>
                </SidebarFooter>
            </div>
        </Sidebar>
    );
}



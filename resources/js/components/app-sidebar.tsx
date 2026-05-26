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
import { analytics, dashboard, makenliving } from '@/routes';
import { edit as profileEdit } from '@/routes/profile';
import type { Auth } from '@/types';

function SidebarBubble({ className, style }: { className?: string; style?: React.CSSProperties }) {
    return <span className={`absolute rounded-full bg-slate-400/12 ${className ?? ''}`} style={style} />;
}

function SidebarFish({ className, bodyColor, tailColor }: { className?: string; bodyColor: string; tailColor: string }) {
    return (
        <svg className={className} viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M30 10 Q40 0 40 10 Q40 20 30 10Z" fill={tailColor} />
            <ellipse cx="18" cy="10" rx="18" ry="7" fill={bodyColor} />
            <circle cx="6" cy="8" r="2" fill="white" />
            <circle cx="6" cy="8" r="1" fill="#475569" />
        </svg>
    );
}

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
            className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all ${
                prominent
                    ? active
                        ? 'bg-slate-800 font-bold text-white shadow-md shadow-slate-200'
                        : 'font-medium text-slate-600 hover:bg-slate-100/60 hover:text-slate-800'
                    : active
                      ? 'border border-slate-200/60 bg-slate-100 font-bold text-slate-800'
                      : 'border border-transparent font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
        >
            <Icon className="size-5" />
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
            <div className="relative flex h-full flex-col overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_50%,#f1f5f9_100%)] text-slate-700">
                <div
                    className="pointer-events-none absolute inset-0 bg-center bg-no-repeat"
                    style={{
                        backgroundImage:
                            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600'%3E%3Cellipse cx='60' cy='200' rx='120' ry='80' fill='rgba(100,116,139,0.04)'/%3E%3Cellipse cx='280' cy='400' rx='100' ry='60' fill='rgba(100,116,139,0.05)'/%3E%3C/svg%3E\")",
                    }}
                />
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <SidebarBubble className="left-[18%] top-[82%] size-1.5 animate-[rise_8s_linear_infinite]" />
                    <SidebarBubble className="left-[40%] top-[86%] size-1 animate-[rise_11s_linear_infinite]" />
                    <SidebarBubble className="left-[65%] top-[80%] size-2 animate-[rise_9s_linear_infinite]" />
                    <SidebarBubble className="left-[80%] top-[84%] size-1.5 animate-[rise_13s_linear_infinite]" />
                    <SidebarBubble className="left-[30%] top-[88%] size-1 animate-[rise_10s_linear_infinite]" />

                    <SidebarFish
                        className="absolute left-[-20px] top-[10%] w-7 opacity-40 animate-[swimRight_14s_linear_infinite]"
                        bodyColor="#94a3b8"
                        tailColor="#cbd5e1"
                    />
                    <SidebarFish
                        className="absolute right-[calc(100%-20px)] top-[30%] w-5 scale-x-[-1] opacity-30 animate-[swimLeft_18s_linear_infinite]"
                        bodyColor="#b0bec5"
                        tailColor="#cfd8dc"
                    />
                    <SidebarFish
                        className="absolute left-[-12px] top-[48%] w-4 opacity-35 animate-[swimRight_22s_linear_infinite]"
                        bodyColor="#a8b9c8"
                        tailColor="#d1dce5"
                    />

                    <div className="absolute bottom-14 left-0 flex w-full items-end gap-1 px-2 opacity-60">
                        <div className="size-4 rounded-full bg-slate-300/70" />
                        <div className="size-3 rounded-full bg-stone-300/70" />
                        <div className="size-5 rounded-full bg-slate-200/80" />
                        <div className="size-3 rounded-full bg-gray-300/70" />
                        <div className="size-4 rounded-full bg-slate-300/70" />
                        <div className="size-3 rounded-full bg-stone-200/70" />
                        <div className="size-4 rounded-full bg-gray-200/70" />
                    </div>

                    <div className="absolute bottom-14 left-[10%] h-12 w-[3px] origin-bottom rounded-full bg-slate-300 animate-[sway_3s_ease-in-out_infinite_alternate]" />
                    <div className="absolute bottom-14 left-[28%] h-10 w-[3px] origin-bottom rounded-full bg-slate-400 animate-[sway_4s_ease-in-out_infinite_alternate]" />
                    <div className="absolute bottom-14 left-[55%] h-14 w-[3px] origin-bottom rounded-full bg-slate-300 animate-[sway_3.5s_ease-in-out_infinite_alternate]" />
                    <div className="absolute bottom-14 left-[75%] h-9 w-[3px] origin-bottom rounded-full bg-slate-400 animate-[sway_2.8s_ease-in-out_infinite_alternate]" />
                </div>

                <SidebarHeader className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 px-6 py-5 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img
                                src="https://mangrovecorp.id/assets/img/logo.png"
                                alt="Mangrove Corp"
                                className="h-8 w-auto object-contain"
                            />
                        </div>

                        {isMobile && (
                            <button
                                type="button"
                                onClick={() => setOpenMobile(false)}
                                className="p-2 text-slate-400 transition-colors hover:text-slate-700"
                            >
                                <X className="size-6" />
                            </button>
                        )}
                    </div>
                </SidebarHeader>

                <SidebarContent className="relative z-10 overflow-y-auto px-4 py-4">
                    <p className="mb-2 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Main Menu</p>

                    <nav className="space-y-1">
                        <NavLink href={dashboard().url} icon={LayoutGrid} label="Dashboard" active={isCurrentUrl(dashboard())} />
                        <NavLink href={analytics().url} icon={BarChart3} label="IDPhotobook" active={isCurrentUrl(analytics())} />
                        <NavLink href={makenliving().url} icon={ShoppingCart} label="Makenliving" active={isCurrentUrl(makenliving())} />
                        {/* <NavLink href="/admin/order/create" icon={PencilLine} label="Input Order" active={isCurrentUrl('/admin/order/create')} prominent />
                        <NavLink href="/admin/order" icon={ShoppingCart} label="Orders" active={isCurrentOrParentUrl('/admin/order')} />

                        <div className="space-y-1">
                            <button
                                type="button"
                                onClick={() => setKatalogOpen((open) => !open)}
                                className="flex w-full items-center justify-between gap-3 rounded-lg px-4 py-3 font-medium text-pink-500 transition-all hover:bg-pink-50/50 hover:text-pink-700"
                            >
                                <div className="flex items-center gap-3">
                                    <Package className="size-5 opacity-60" />
                                    <span>Katalog</span>
                                </div>
                                <ChevronDown className={`size-4 transition-transform ${katalogOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {katalogOpen && (
                                <div className="ml-4 space-y-1 border-l border-pink-100 px-4">
                                    <Link href="/admin/product" className={`flex items-center gap-3 px-4 py-2 text-sm transition-all ${isCurrentOrParentUrl('/admin/product') ? 'font-bold text-pink-700' : 'font-medium text-pink-400 hover:text-pink-600'}`}>
                                        Produk
                                    </Link>
                                    <Link href="/admin/frame" className={`flex items-center gap-3 px-4 py-2 text-sm transition-all ${isCurrentOrParentUrl('/admin/frame') ? 'font-bold text-pink-700' : 'font-medium text-pink-400 hover:text-pink-600'}`}>
                                        Frame
                                    </Link>
                                </div>
                            )}
                        </div>

                        <div className="space-y-1">
                            <button
                                type="button"
                                onClick={() => setLaporanOpen((open) => !open)}
                                className={`flex w-full items-center justify-between gap-3 rounded-lg px-4 py-3 transition-all ${laporanActive ? 'bg-pink-50 font-bold text-pink-700' : 'font-medium text-pink-500 hover:bg-pink-50/50 hover:text-pink-700'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <FileText className="size-5 opacity-60" />
                                    <span>Laporan</span>
                                </div>
                                <ChevronDown className={`size-4 transition-transform ${laporanOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {laporanOpen && (
                                <div className="ml-4 space-y-1 border-l border-pink-100 px-4">
                                    <Link href="/admin/laporan/order-report" className={`flex items-center gap-2 px-4 py-2 text-sm transition-all ${isCurrentUrl('/admin/laporan/order-report') ? 'font-bold text-pink-700' : 'font-medium text-pink-400 hover:text-pink-600'}`}>
                                        <span className={`size-1.5 rounded-full ${isCurrentUrl('/admin/laporan/order-report') ? 'bg-pink-600' : 'bg-pink-200'}`} />
                                        Order Report
                                    </Link>
                                    <Link href="/admin/laporan/resi-report" className={`flex items-center gap-2 px-4 py-2 text-sm transition-all ${isCurrentUrl('/admin/laporan/resi-report') ? 'font-bold text-pink-700' : 'font-medium text-pink-400 hover:text-pink-600'}`}>
                                        <span className={`size-1.5 rounded-full ${isCurrentUrl('/admin/laporan/resi-report') ? 'bg-pink-600' : 'bg-pink-200'}`} />
                                        Resi Report
                                    </Link>
                                    <Link href="/admin/laporan/leads-report" className={`flex items-center gap-2 px-4 py-2 text-sm transition-all ${isCurrentUrl('/admin/laporan/leads-report') ? 'font-bold text-pink-700' : 'font-medium text-pink-400 hover:text-pink-600'}`}>
                                        <span className={`size-1.5 rounded-full ${isCurrentUrl('/admin/laporan/leads-report') ? 'bg-pink-600' : 'bg-pink-200'}`} />
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

                <SidebarFooter className="user-footer relative z-10 border-t border-slate-200/60 bg-white/70 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg border-2 border-slate-200 bg-slate-100 font-bold text-slate-600 shadow-sm">
                            {firstName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-slate-800">{firstName}</p>
                            <p className="truncate text-[10px] font-medium uppercase tracking-wider text-slate-400">
                                Administrator
                            </p>
                        </div>
                    </div>
                </SidebarFooter>
            </div>
        </Sidebar>
    );
}

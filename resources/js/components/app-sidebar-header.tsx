import { Link, usePage } from '@inertiajs/react';
import { LogOut, Search } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import type { Auth, BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { logout } from '@/routes';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const currentTitle = breadcrumbs[breadcrumbs.length - 1]?.title ?? 'Dashboard';
    const firstName = auth.user?.name?.split(' ')[0] ?? 'A';

    return (
        <>
            <header className="sticky top-0 z-20 hidden h-16 shrink-0 items-center justify-between border-b border-pink-100 bg-white/95 px-8 backdrop-blur-sm md:flex">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-bold text-pink-950">{currentTitle}</h2>
                </div>

                <div className="flex items-center gap-6">
                    <div className="relative hidden sm:block">
                        <Input
                            type="text"
                            placeholder="Cari data..."
                            className="w-64 rounded-lg border-pink-100 bg-pink-50/50 py-2 pr-4 pl-10 text-sm text-pink-900 placeholder:text-pink-300 focus-visible:ring-2 focus-visible:ring-pink-200"
                        />
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-pink-300" />
                    </div>

                    <div className="border-l border-pink-100 pl-6">
                        <Link
                            href={logout()}
                            as="button"
                            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-pink-600 transition-all hover:bg-pink-50"
                        >
                            <LogOut className="size-4" />
                            Keluar
                        </Link>
                    </div>
                </div>
            </header>

            <header className="sticky top-0 z-20 flex items-center justify-between border-b border-pink-100 bg-white/95 px-5 py-2 shadow-sm backdrop-blur-sm md:hidden">
                <div className="flex items-center gap-2.5 py-3">
                    <div className="flex size-7 items-center justify-center overflow-hidden rounded-[10px] shadow-sm shadow-pink-200">
                        <img src="/img/5cfb4353a02182a1292f91d7e7f6507c.webp" alt="Makenliving" className="size-full object-cover" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <span className="leading-none font-black tracking-tight text-pink-950">Makenliving</span>
                        <h2 className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.15em] text-pink-500">
                            {currentTitle}
                        </h2>
                    </div>
                </div>

                {auth.user && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className="flex size-10 items-center justify-center rounded-full border-2 border-white bg-pink-100 font-bold text-pink-700 shadow-sm"
                            >
                                {firstName.charAt(0).toUpperCase()}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-48 overflow-hidden rounded-2xl border border-pink-100 bg-white p-0 shadow-2xl shadow-pink-200/50"
                        >
                            <div className="border-b border-pink-50 bg-pink-50/30 px-4 py-3">
                                <p className="truncate text-sm font-bold text-pink-900">{firstName}</p>
                                <p className="mt-0.5 text-[10px] font-bold text-pink-400">Administrator</p>
                            </div>
                            <Link
                                href={logout()}
                                as="button"
                                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold text-pink-600 transition-colors hover:bg-pink-50"
                            >
                                <LogOut className="size-4" />
                                Keluar
                            </Link>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </header>
        </>
    );
}

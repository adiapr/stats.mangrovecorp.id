import { Head, router, usePage } from '@inertiajs/react';
import {
    Award,
    Box,
    Calendar,
    Crown,
    Layers,
    Package,
    ShoppingBag,
    Tag,
    TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import { dashboard, produk } from '@/routes';

// ── Types ──────────────────────────────────────────────────────────────────

interface ProductEntry {
    product_name: string;
    qty: number;
    orders: number;
    revenue: number;
    share: number;
}

interface CategoryEntry {
    category: string;
    qty: number;
    orders: number;
    revenue: number;
    share: number;
}

interface ProdukSection {
    products: ProductEntry[];
    categories: CategoryEntry[];
    totalQty: number;
    totalRevenue: number;
    totalOrders: number;
}

interface PageProps {
    period: string;
    periodStart: string;
    periodEnd: string;
    mkl: ProdukSection;
    idp: ProdukSection;
}

// ── Period Options ─────────────────────────────────────────────────────────

const PERIOD_OPTIONS = [
    { value: 'today', label: 'Hari Ini' },
    { value: 'yesterday', label: 'Kemarin' },
    { value: '7days', label: '7 Hari' },
    { value: '30days', label: '30 Hari' },
    { value: 'this_month', label: 'Bulan Ini' },
    { value: 'last_month', label: 'Bulan Lalu' },
    { value: '6months', label: '6 Bulan' },
    { value: 'this_year', label: 'Tahun Ini' },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function formatRupiah(value: number): string {
    if (value >= 1_000_000_000) return `Rp${(value / 1_000_000_000).toFixed(1)}M`;
    if (value >= 1_000_000) return `Rp${(value / 1_000_000).toFixed(1)}jt`;
    if (value >= 1_000) return `Rp${(value / 1_000).toFixed(0)}rb`;
    return `Rp${value}`;
}

function rankColor(rank: number) {
    if (rank === 1) return 'text-amber-500';
    if (rank === 2) return 'text-slate-400';
    if (rank === 3) return 'text-orange-400';
    return 'text-slate-300';
}

// ── Product Bar Row ────────────────────────────────────────────────────────

function ProductBar({
    rank,
    entry,
    maxQty,
    barClass,
    accentColor,
    showRevenue,
}: {
    rank: number;
    entry: ProductEntry;
    maxQty: number;
    barClass: string;
    accentColor: string;
    showRevenue: boolean;
}) {
    const widthPct = maxQty > 0 ? (entry.qty / maxQty) * 100 : 0;
    const isTop3 = rank <= 3;

    return (
        <div
            className={`group relative overflow-hidden rounded-xl border p-3.5 transition-all hover:shadow-sm ${
                rank === 1
                    ? 'border-amber-100 bg-amber-50/50'
                    : rank === 2
                      ? 'border-slate-100 bg-slate-50/50'
                      : rank === 3
                        ? 'border-orange-100 bg-orange-50/30'
                        : 'border-slate-50 bg-white'
            }`}
        >
            <div className="flex items-start justify-between gap-3">
                {/* Rank badge */}
                <div
                    className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                        rank === 1
                            ? 'bg-amber-100 text-amber-600'
                            : rank === 2
                              ? 'bg-slate-100 text-slate-500'
                              : rank === 3
                                ? 'bg-orange-100 text-orange-500'
                                : 'bg-slate-50 text-slate-400'
                    }`}
                >
                    {rank === 1 ? '👑' : rank}
                </div>

                {/* Name + details */}
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800" title={entry.product_name}>
                        {entry.product_name}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                        {entry.orders.toLocaleString('id-ID')} order
                        {showRevenue && entry.revenue > 0 && ` · ${formatRupiah(entry.revenue)}`}
                    </p>
                </div>

                {/* Qty + share */}
                <div className="shrink-0 text-right">
                    <p className={`text-sm font-black ${accentColor}`}>
                        {entry.qty.toLocaleString('id-ID')}
                        <span className="ml-0.5 text-[10px] font-medium text-slate-400"> unit</span>
                    </p>
                    <p className="text-[11px] text-slate-400">{entry.share}%</p>
                </div>
            </div>

            {/* Progress bar */}
            <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full transition-all duration-500 ${barClass}`} style={{ width: `${widthPct}%` }} />
            </div>
        </div>
    );
}

// ── Category Pills ─────────────────────────────────────────────────────────

const CATEGORY_COLORS = [
    { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700', bar: 'bg-pink-400' },
    { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', bar: 'bg-violet-400' },
    { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', bar: 'bg-blue-400' },
    { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', bar: 'bg-teal-400' },
    { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', bar: 'bg-amber-400' },
    { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', bar: 'bg-rose-400' },
    { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', bar: 'bg-indigo-400' },
    { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', bar: 'bg-green-400' },
];

function CategorySection({ categories }: { categories: CategoryEntry[] }) {
    const maxQty = categories[0]?.qty ?? 1;

    return (
        <div className="space-y-3">
            {categories.map((cat, i) => {
                const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
                const widthPct = maxQty > 0 ? (cat.qty / maxQty) * 100 : 0;
                return (
                    <div key={cat.category} className={`rounded-xl border p-4 ${color.bg} ${color.border}`}>
                        <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <p className={`truncate text-sm font-bold ${color.text}`}>{cat.category}</p>
                                <p className="text-[11px] text-slate-400">
                                    {cat.orders.toLocaleString('id-ID')} order · {formatRupiah(cat.revenue)}
                                </p>
                            </div>
                            <div className="shrink-0 text-right">
                                <p className={`text-sm font-black ${color.text}`}>
                                    {cat.qty.toLocaleString('id-ID')}
                                    <span className="ml-0.5 text-[10px] font-medium opacity-60"> unit</span>
                                </p>
                                <p className="text-[11px] text-slate-500">{cat.share}%</p>
                            </div>
                        </div>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/60">
                            <div className={`h-full rounded-full ${color.bar}`} style={{ width: `${widthPct}%` }} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ── Produk Tab (per-service content) ──────────────────────────────────────

function ProdukTab({ data, theme }: { data: ProdukSection; theme: 'mkl' | 'idp' }) {
    const [expanded, setExpanded] = useState(false);

    const isMkl = theme === 'mkl';
    const accentColor  = isMkl ? 'text-pink-600'   : 'text-amber-600';
    const accentBg     = isMkl ? 'bg-pink-500'     : 'bg-amber-400';
    const accentLight  = isMkl ? 'bg-pink-50'      : 'bg-amber-50';
    const accentBorder = isMkl ? 'border-pink-200' : 'border-amber-200';
    const barClass     = isMkl ? 'bg-pink-500'     : 'bg-amber-400';
    const iconBg       = isMkl ? 'bg-pink-100 text-pink-600' : 'bg-amber-100 text-amber-600';
    const expandBtn    = isMkl
        ? 'border-pink-200 text-pink-500 hover:border-pink-400 hover:text-pink-700'
        : 'border-amber-200 text-amber-500 hover:border-amber-400 hover:text-amber-700';
    const gradientOverlay = isMkl
        ? 'bg-[radial-gradient(circle_at_top_right,_rgba(236,72,153,0.06),_transparent_60%)]'
        : 'bg-[radial-gradient(circle_at_top_right,_rgba(251,191,36,0.08),_transparent_60%)]';

    const products    = data.products;
    const maxQty      = products[0]?.qty ?? 1;
    const topProduct  = products[0]?.product_name ?? '-';
    const visibleProducts = expanded ? products : products.slice(0, 10);

    return (
        <div className="space-y-8">

            {/* ── KPI Cards ──────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

                {/* Total Unit Terjual */}
                <div className={`relative overflow-hidden rounded-2xl border ${accentBorder} ${accentLight} p-5`}>
                    <div className={`absolute inset-0 ${gradientOverlay}`} />
                    <div className="relative">
                        <div className={`mb-3 inline-flex rounded-xl p-2.5 ${iconBg}`}>
                            <Box className="size-5" />
                        </div>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Unit Terjual</p>
                        <p className={`mt-1 text-3xl font-black ${accentColor}`}>
                            {data.totalQty.toLocaleString('id-ID')}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">dari {data.totalOrders.toLocaleString('id-ID')} order</p>
                    </div>
                </div>

                {/* Revenue — only meaningful for MKL */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5">
                    <div className="mb-3 inline-flex rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                        <TrendingUp className="size-5" />
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        {isMkl ? 'Revenue Produk' : 'Rata-rata / Order'}
                    </p>
                    <p className="mt-1 text-2xl font-black text-slate-800">
                        {isMkl
                            ? formatRupiah(data.totalRevenue)
                            : data.totalOrders > 0
                              ? `${(data.totalQty / data.totalOrders).toFixed(1)}`
                              : '0'}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                        {isMkl ? 'total dari semua produk' : 'unit per order'}
                    </p>
                </div>

                {/* Jenis Produk */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5">
                    <div className="mb-3 inline-flex rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                        <Layers className="size-5" />
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Jenis Produk</p>
                    <p className="mt-1 text-3xl font-black text-slate-800">{products.length}</p>
                    <p className="mt-1 text-xs text-slate-400">varian berbeda</p>
                </div>

                {/* Produk Terlaris */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5">
                    <div className="mb-3 inline-flex rounded-xl bg-amber-50 p-2.5 text-amber-600">
                        <Award className="size-5" />
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Terlaris</p>
                    <p className="mt-1 truncate text-base font-black text-slate-800" title={topProduct}>
                        {topProduct}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                        {products[0]?.qty.toLocaleString('id-ID') ?? '-'} unit · {products[0]?.share ?? 0}%
                    </p>
                </div>
            </div>

            {/* ── Top 3 Podium ───────────────────────────────────── */}
            {products.length >= 3 && (
                <div className="rounded-2xl border border-slate-100 bg-white p-6">
                    <div className="mb-5 flex items-center gap-2">
                        <Crown className={`size-4 ${accentColor}`} />
                        <h3 className="text-sm font-bold text-slate-700">Podium Produk Terlaris</h3>
                    </div>
                    <div className="flex items-end justify-center gap-4">
                        {/* 2nd */}
                        <div className="flex flex-1 flex-col items-center gap-2">
                            <div className="text-center">
                                <p className="line-clamp-2 text-xs font-semibold text-slate-600" title={products[1].product_name}>
                                    {products[1].product_name}
                                </p>
                                <p className={`text-xl font-black ${accentColor}`}>{products[1].qty.toLocaleString('id-ID')}</p>
                                <p className="text-[11px] text-slate-400">{products[1].share}%</p>
                            </div>
                            <div className={`w-full rounded-t-xl ${accentBg} opacity-60`} style={{ height: '72px' }} />
                            <div className="flex size-9 items-center justify-center rounded-full bg-slate-100 text-lg font-black text-slate-500">
                                2
                            </div>
                        </div>
                        {/* 1st */}
                        <div className="flex flex-1 flex-col items-center gap-2">
                            <div className="text-center">
                                <p className="line-clamp-2 text-xs font-semibold text-slate-700" title={products[0].product_name}>
                                    {products[0].product_name}
                                </p>
                                <p className={`text-2xl font-black ${accentColor}`}>{products[0].qty.toLocaleString('id-ID')}</p>
                                <p className="text-[11px] text-slate-400">{products[0].share}%</p>
                            </div>
                            <div className={`w-full rounded-t-xl ${accentBg}`} style={{ height: '112px' }} />
                            <div className="flex size-10 items-center justify-center rounded-full bg-amber-100 text-xl font-black text-amber-600">
                                👑
                            </div>
                        </div>
                        {/* 3rd */}
                        <div className="flex flex-1 flex-col items-center gap-2">
                            <div className="text-center">
                                <p className="line-clamp-2 text-xs font-semibold text-slate-600" title={products[2].product_name}>
                                    {products[2].product_name}
                                </p>
                                <p className={`text-xl font-black ${accentColor}`}>{products[2].qty.toLocaleString('id-ID')}</p>
                                <p className="text-[11px] text-slate-400">{products[2].share}%</p>
                            </div>
                            <div className={`w-full rounded-t-xl ${accentBg} opacity-40`} style={{ height: '48px' }} />
                            <div className="flex size-8 items-center justify-center rounded-full bg-orange-50 text-sm font-black text-orange-400">
                                3
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Product Ranking ─────────────────────────────────── */}
            <section className="rounded-2xl border border-slate-100 bg-white p-6">
                <div className="mb-5 flex items-center gap-2">
                    <ShoppingBag className={`size-4 ${accentColor}`} />
                    <h3 className="text-sm font-bold text-slate-700">Ranking Produk</h3>
                    <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500">
                        {products.length} produk
                    </span>
                </div>

                {products.length === 0 ? (
                    <div className="py-12 text-center">
                        <Package className="mx-auto mb-3 size-10 text-slate-200" />
                        <p className="text-sm text-slate-400">Belum ada data untuk periode ini</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {visibleProducts.map((entry, i) => (
                            <ProductBar
                                key={entry.product_name}
                                rank={i + 1}
                                entry={entry}
                                maxQty={maxQty}
                                barClass={barClass}
                                accentColor={accentColor}
                                showRevenue={isMkl}
                            />
                        ))}
                        {products.length > 10 && (
                            <button
                                type="button"
                                onClick={() => setExpanded((v) => !v)}
                                className={`w-full rounded-xl border border-dashed py-2.5 text-xs font-semibold transition-colors ${expandBtn}`}
                            >
                                {expanded
                                    ? 'Sembunyikan'
                                    : `Tampilkan ${products.length - 10} produk lainnya`}
                            </button>
                        )}
                    </div>
                )}
            </section>

            {/* ── Category Breakdown (MKL only) ────────────────────── */}
            {isMkl && data.categories.length > 0 && (
                <section className="rounded-2xl border border-slate-100 bg-white p-6">
                    <div className="mb-5 flex items-center gap-2">
                        <Tag className={`size-4 ${accentColor}`} />
                        <h3 className="text-sm font-bold text-slate-700">Breakdown per Kategori</h3>
                        <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500">
                            {data.categories.length} kategori
                        </span>
                    </div>
                    <CategorySection categories={data.categories} />
                </section>
            )}
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function Produk() {
    const { period, periodStart, periodEnd, mkl, idp } = usePage().props as unknown as PageProps;

    const [activeTab, setActiveTab]     = useState<'mkl' | 'idp'>('mkl');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd]     = useState('');
    const [showCustom, setShowCustom]   = useState(period === 'custom');

    function applyPeriod(p: string) {
        if (p === 'custom') {
            setShowCustom(true);
            return;
        }
        setShowCustom(false);
        router.get(produk(), { period: p });
    }

    function applyCustom() {
        if (!customStart || !customEnd) return;
        router.get(produk(), { period: 'custom', start: customStart, end: customEnd });
    }

    return (
        <>
            <Head title="Produk — Analitik Penjualan" />

            <div className="relative min-h-[calc(100vh-4rem)] bg-transparent p-4 lg:p-8">
                {/* Violet/indigo accent for products */}
                <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.07),_transparent_60%)]" />

                <div className="relative z-10 flex flex-col gap-6">

                    {/* ── Header ────────────────────────────────────── */}
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-violet-600">
                                <Tag className="size-3" />
                                Analitik Produk
                            </div>
                            <h1 className="mt-2 text-2xl font-black text-slate-800 lg:text-3xl">
                                Produk Terjual
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">
                                {periodStart} &ndash; {periodEnd}
                            </p>
                        </div>

                        {/* Period filter */}
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-wrap gap-1.5">
                                {PERIOD_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => applyPeriod(opt.value)}
                                        className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-all ${
                                            period === opt.value
                                                ? 'border-violet-500 bg-violet-500 text-white shadow-sm shadow-violet-100'
                                                : 'border-slate-200 bg-white text-slate-500 hover:border-violet-300 hover:text-violet-600'
                                        }`}
                                    >
                                        <Calendar className="size-3" />
                                        {opt.label}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => applyPeriod('custom')}
                                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-all ${
                                        period === 'custom'
                                            ? 'border-violet-500 bg-violet-500 text-white shadow-sm shadow-violet-100'
                                            : 'border-slate-200 bg-white text-slate-500 hover:border-violet-300 hover:text-violet-600'
                                    }`}
                                >
                                    <Calendar className="size-3" />
                                    Custom
                                </button>
                            </div>
                            {showCustom && (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="date"
                                        value={customStart}
                                        onChange={(e) => setCustomStart(e.target.value)}
                                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-400"
                                    />
                                    <span className="text-xs text-slate-400">s/d</span>
                                    <input
                                        type="date"
                                        value={customEnd}
                                        onChange={(e) => setCustomEnd(e.target.value)}
                                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={applyCustom}
                                        className="rounded-lg bg-violet-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-violet-600"
                                    >
                                        Terapkan
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Service Tabs ───────────────────────────────── */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setActiveTab('mkl')}
                            className={`relative flex items-center gap-2.5 rounded-2xl border px-5 py-3 text-sm font-bold transition-all ${
                                activeTab === 'mkl'
                                    ? 'border-pink-300 bg-white shadow-lg shadow-pink-100/50 text-pink-600'
                                    : 'border-slate-200 bg-white/60 text-slate-400 hover:border-pink-200 hover:text-pink-500'
                            }`}
                        >
                            {activeTab === 'mkl' && (
                                <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-pink-500 ring-2 ring-white" />
                            )}
                            <span className="size-3 rounded-full bg-pink-500" />
                            Makenliving
                            <span className="rounded-full bg-pink-50 px-2 py-0.5 text-[11px] font-black text-pink-500">
                                {mkl.totalQty.toLocaleString('id-ID')} unit
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('idp')}
                            className={`relative flex items-center gap-2.5 rounded-2xl border px-5 py-3 text-sm font-bold transition-all ${
                                activeTab === 'idp'
                                    ? 'border-amber-300 bg-white shadow-lg shadow-amber-100/50 text-amber-600'
                                    : 'border-slate-200 bg-white/60 text-slate-400 hover:border-amber-200 hover:text-amber-500'
                            }`}
                        >
                            {activeTab === 'idp' && (
                                <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-amber-500 ring-2 ring-white" />
                            )}
                            <span className="size-3 rounded-full bg-amber-400" />
                            IDPhotobook
                            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-black text-amber-600">
                                {idp.totalQty.toLocaleString('id-ID')} unit
                            </span>
                        </button>
                    </div>

                    {/* ── Tab Content ────────────────────────────────── */}
                    {activeTab === 'mkl' ? (
                        <ProdukTab data={mkl} theme="mkl" />
                    ) : (
                        <ProdukTab data={idp} theme="idp" />
                    )}
                </div>
            </div>
        </>
    );
}

Produk.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Produk', href: produk() },
    ],
};

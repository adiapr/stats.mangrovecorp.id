import { Head, router, usePage } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowUpRight,
    BarChart3,
    Calendar,
    CalendarDays,
    Crown,
    HandCoins,
    Headset,
    LayoutTemplate,
    Medal,
    Package,
    ShoppingBag,
    TrendingDown,
    TrendingUp,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { analytics, dashboard } from '@/routes';

// ── Types ──────────────────────────────────────────────────────────────────

interface KPI {
    total_orders: number;
    total_revenue: number;
    paid_orders: number;
    paid_rate: number;
    avg_order_value: number;
    order_growth: number;
    revenue_growth: number;
}

interface PlatformItem {
    platform: string;
    count: number;
}

interface DayItem {
    label: string;
    orders: number;
    revenue: number;
}

interface OrderItem {
    order_code: string;
    customer_name: string;
    total_payment: number;
    platform: string | null;
    is_paid: boolean;
    status: string | null;
    resi: string | null;
    created_at: string | null;
}

interface LeaderboardEntry {
    rank: number;
    name: string;
    count: number;
}

interface Leaderboards {
    cs: LeaderboardEntry[];
    cs_support: LeaderboardEntry[];
    layouter: LeaderboardEntry[];
}

interface PageProps {
    period: string;
    periodStart: string;
    periodEnd: string;
    trendType: 'hourly' | 'daily';
    kpi: KPI;
    platformData: PlatformItem[];
    dailyTrend: DayItem[];
    latestOrders: OrderItem[];
    leaderboards: Leaderboards;
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

function formatDate(iso: string | null): string {
    if (!iso) return '-';
    const d = new Date(iso);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function getInitial(name: string): string {
    return name.charAt(0).toUpperCase();
}

function relativeTime(iso: string | null): string {
    if (!iso) return '-';
    const now = Date.now();
    const diff = Math.floor((now - new Date(iso).getTime()) / 1000);
    if (diff < 60) return `${diff} dtk lalu`;
    if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    return `${Math.floor(diff / 86400)} hari lalu`;
}

function growthDisplay(value: number): { text: string; positive: boolean } {
    const positive = value >= 0;
    return {
        text: `${positive ? '+' : ''}${value}%`,
        positive,
    };
}

// ── Platform Color Map ─────────────────────────────────────────────────────

const PLATFORM_COLORS: Record<string, string> = {
    Shopee: 'bg-orange-400',
    Tokopedia: 'bg-green-500',
    Whatsapp: 'bg-emerald-500',
    Facebook: 'bg-blue-500',
    Instagram: 'bg-pink-500',
    Lazada: 'bg-violet-500',
    Website: 'bg-indigo-500',
    Lainnya: 'bg-gray-400',
};

function platformColor(name: string): string {
    return PLATFORM_COLORS[name] ?? 'bg-gray-400';
}

// ── Line Chart (Daily Trend) ───────────────────────────────────────────────

function DailyTrendChart({ data }: { data: DayItem[] }) {
    const [hovered, setHovered] = useState<number | null>(null);

    if (data.length === 0) {
        return (
            <div className="flex h-40 items-center justify-center text-sm text-amber-300">
                Tidak ada data pada periode ini
            </div>
        );
    }

    const width = 620;
    const height = 160;
    const padX = 10;
    const padY = 18;
    const innerW = width - padX * 2;
    const innerH = height - padY * 2;

    const maxOrders = Math.max(...data.map((d) => d.orders), 1);

    const points = data.map((d, i) => ({
        x: padX + (i / Math.max(data.length - 1, 1)) * innerW,
        y: padY + innerH - (d.orders / maxOrders) * innerH,
        ...d,
    }));

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const areaD = `${pathD} L${points[points.length - 1].x},${height} L${points[0].x},${height} Z`;

    // Show at most 8 labels evenly spaced
    const step = Math.max(1, Math.floor(data.length / 8));
    const labelPoints = points.filter((_, i) => i % step === 0 || i === points.length - 1);

    // Tooltip dimensions
    const TW = 80;
    const TH = 34;

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
            <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
                </linearGradient>
            </defs>

            {[0, 0.33, 0.66, 1].map((t) => (
                <line
                    key={t}
                    x1={padX}
                    y1={padY + innerH * (1 - t)}
                    x2={width - padX}
                    y2={padY + innerH * (1 - t)}
                    stroke="#fef3c7"
                    strokeWidth="1"
                />
            ))}

            <path d={areaD} fill="url(#trendGrad)" />
            <path d={pathD} fill="none" stroke="#f59e0b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />

            {/* Vertical hover line */}
            {hovered !== null && (
                <line
                    x1={points[hovered].x}
                    y1={padY}
                    x2={points[hovered].x}
                    y2={height - 12}
                    stroke="#f59e0b"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    opacity="0.5"
                />
            )}

            {/* Circles + invisible hit areas */}
            {points.map((p, i) => (
                <g key={i}>
                    <circle
                        cx={p.x}
                        cy={p.y}
                        r={hovered === i ? 5 : 3.5}
                        fill={hovered === i ? '#f59e0b' : 'white'}
                        stroke="#f59e0b"
                        strokeWidth="2"
                        style={{ transition: 'r 0.1s, fill 0.1s' }}
                    />
                    {/* Larger invisible hit area */}
                    <circle
                        cx={p.x}
                        cy={p.y}
                        r="12"
                        fill="transparent"
                        style={{ cursor: 'crosshair' }}
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(null)}
                    />
                </g>
            ))}

            {/* Tooltip */}
            {hovered !== null && (() => {
                const p = points[hovered];
                // Clamp tooltip so it doesn't overflow left/right
                const tx = Math.min(Math.max(p.x - TW / 2, padX), width - padX - TW);
                const ty = Math.max(p.y - TH - 8, padY);
                return (
                    <g style={{ pointerEvents: 'none' }}>
                        <rect
                            x={tx}
                            y={ty}
                            width={TW}
                            height={TH}
                            rx="6"
                            fill="#78350f"
                            opacity="0.93"
                        />
                        {/* small arrow */}
                        <polygon
                            points={`${p.x - 5},${ty + TH} ${p.x + 5},${ty + TH} ${p.x},${ty + TH + 6}`}
                            fill="#78350f"
                            opacity="0.93"
                        />
                        <text
                            x={tx + TW / 2}
                            y={ty + 13}
                            fill="#fef3c7"
                            fontSize="9"
                            fontWeight="600"
                            textAnchor="middle"
                        >
                            {p.label}
                        </text>
                        <text
                            x={tx + TW / 2}
                            y={ty + 26}
                            fill="white"
                            fontSize="10"
                            fontWeight="800"
                            textAnchor="middle"
                        >
                            {p.orders.toLocaleString('id-ID')} order
                        </text>
                    </g>
                );
            })()}

            {labelPoints.map((p, i) => (
                <text key={i} x={p.x} y={height - 2} fill="#fbbf24" fontSize="9" textAnchor="middle">
                    {p.label}
                </text>
            ))}
        </svg>
    );
}

// ── Platform Bar Chart ─────────────────────────────────────────────────────

function PlatformBars({ data }: { data: PlatformItem[] }) {
    if (data.length === 0) {
        return <div className="flex h-40 items-center justify-center text-sm text-amber-300">Tidak ada data</div>;
    }

    const maxCount = Math.max(...data.map((d) => d.count), 1);
    const totalOrders = data.reduce((s, d) => s + d.count, 0);

    return (
        <div className="space-y-3">
            {data.slice(0, 8).map((item) => {
                const pct = Math.round((item.count / totalOrders) * 100);
                const barWidth = Math.round((item.count / maxCount) * 100);
                return (
                    <div key={item.platform} className="flex items-center gap-3">
                        <div className="w-24 shrink-0 truncate text-right text-xs font-semibold text-[#78350f]">
                            {item.platform}
                        </div>
                        <div className="flex-1">
                            <div className="h-5 overflow-hidden rounded-full bg-amber-50">
                                <div
                                    className={`h-full rounded-full ${platformColor(item.platform)} transition-all duration-500`}
                                    style={{ width: `${barWidth}%` }}
                                />
                            </div>
                        </div>
                        <div className="w-12 shrink-0 text-right text-xs font-black text-[#111827]">
                            {item.count.toLocaleString('id-ID')}
                        </div>
                        <div className="w-10 shrink-0 text-right text-[10px] font-bold text-amber-400">{pct}%</div>
                    </div>
                );
            })}
        </div>
    );
}

// ── PIC Leaderboard ────────────────────────────────────────────────────────

const RANK_STYLES: Record<number, { badge: string; text: string; icon: typeof Crown }> = {
    1: { badge: 'bg-yellow-400 text-yellow-900', text: 'text-yellow-700', icon: Crown },
    2: { badge: 'bg-gray-200 text-gray-700',     text: 'text-gray-500',   icon: Medal },
    3: { badge: 'bg-orange-200 text-orange-700', text: 'text-orange-600', icon: Medal },
};

function LeaderColumn({
    title,
    subtitle,
    icon: Icon,
    iconBg,
    data,
}: {
    title: string;
    subtitle: string;
    icon: typeof Crown;
    iconBg: string;
    data: LeaderboardEntry[];
}) {
    const maxCount = Math.max(...(data.map((d) => d.count)), 1);

    return (
        <div className="flex flex-col rounded-[2rem] border border-amber-100/70 bg-white/95 p-6 shadow-sm">
            <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-amber-400">{subtitle}</p>
                    <h2 className="mt-1.5 text-xl font-black text-[#451a03]">{title}</h2>
                </div>
                <div className={`rounded-2xl p-3 ${iconBg}`}>
                    <Icon className="size-5" />
                </div>
            </div>

            {data.length === 0 ? (
                <div className="flex flex-1 items-center justify-center py-8 text-sm text-amber-300">
                    Belum ada data pada periode ini
                </div>
            ) : (
                <div className="space-y-2.5">
                    {data.map((entry) => {
                        const style = RANK_STYLES[entry.rank] ?? { badge: 'bg-amber-50 text-amber-600', text: 'text-amber-400', icon: Medal };
                        const RankIcon = style.icon;
                        const barW = Math.round((entry.count / maxCount) * 100);

                        return (
                            <div
                                key={entry.rank}
                                className={`flex items-center gap-3 rounded-2xl px-3.5 py-3 transition-all ${entry.rank === 1 ? 'bg-yellow-50 ring-1 ring-yellow-200' : 'bg-amber-50/50'}`}
                            >
                                {/* Rank badge */}
                                <div className={`flex size-7 shrink-0 items-center justify-center rounded-xl text-[11px] font-black ${style.badge}`}>
                                    {entry.rank <= 3 ? <RankIcon className="size-3.5" /> : entry.rank}
                                </div>

                                {/* Name + bar */}
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-black text-[#111827]">{entry.name}</p>
                                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-amber-100">
                                        <div
                                            className={`h-full rounded-full transition-all duration-700 ${entry.rank === 1 ? 'bg-yellow-400' : 'bg-amber-400'}`}
                                            style={{ width: `${barW}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Count */}
                                <div className="shrink-0 text-right">
                                    <span className="text-sm font-black text-[#111827]">
                                        {entry.count.toLocaleString('id-ID')}
                                    </span>
                                    <p className="text-[10px] text-amber-400">order</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function Analytics() {
    const { period, periodStart, periodEnd, trendType, kpi, platformData, dailyTrend, latestOrders, leaderboards } =
        usePage().props as unknown as PageProps;

    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [showCustom, setShowCustom] = useState(period === 'custom');

    function applyPeriod(p: string) {
        if (p === 'custom') {
            setShowCustom(true);
            return;
        }
        setShowCustom(false);
        router.get(analytics(), { period: p });
    }

    function applyCustom() {
        if (!customStart || !customEnd) return;
        router.get(analytics(), { period: 'custom', start: customStart, end: customEnd });
    }

    const orderGrowth = growthDisplay(kpi.order_growth);
    const revenueGrowth = growthDisplay(kpi.revenue_growth);

    const totalOrdersTrend = dailyTrend.reduce((s, d) => s + d.orders, 0);

    return (
        <>
            <Head title="Analytics — IDPhotobook" />

            <div className="relative min-h-[calc(100vh-4rem)] bg-transparent p-4 lg:p-8">
                <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.1),_transparent_60%)]" />

                <div className="relative z-10 flex flex-col gap-6">

                    {/* ── Header ──────────────────────────────────────────── */}
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-amber-100 bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-amber-500">
                                <BarChart3 className="size-3" />
                                IDPhotobook Analytics
                            </div>
                            <h1 className="mt-3 text-2xl font-black tracking-tight text-[#451a03] sm:text-3xl">
                                Dashboard Analitik Order
                            </h1>
                            <p className="mt-1 text-sm text-[#92400e]">
                                {periodStart} — {periodEnd} ·{' '}
                                <span className="font-semibold">{totalOrdersTrend.toLocaleString('id-ID')} orders</span>
                            </p>
                        </div>

                        {/* Period Filter */}
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-wrap gap-1.5">
                                {PERIOD_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => applyPeriod(opt.value)}
                                        className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                                            period === opt.value && !showCustom
                                                ? 'bg-[#b45309] text-white shadow-sm'
                                                : 'bg-amber-50 text-[#92400e] hover:bg-amber-100'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                                <button
                                    onClick={() => applyPeriod('custom')}
                                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                                        showCustom
                                            ? 'bg-[#b45309] text-white shadow-sm'
                                            : 'bg-amber-50 text-[#92400e] hover:bg-amber-100'
                                    }`}
                                >
                                    <CalendarDays className="size-3" />
                                    Custom
                                </button>
                            </div>
                            {showCustom && (
                                <div className="flex items-center gap-2 rounded-2xl border border-amber-100 bg-white/90 px-3 py-2 shadow-sm">
                                    <CalendarDays className="size-4 shrink-0 text-amber-400" />
                                    <input
                                        type="date"
                                        value={customStart}
                                        onChange={(e) => setCustomStart(e.target.value)}
                                        className="w-32 text-xs font-semibold text-[#451a03] outline-none"
                                    />
                                    <span className="text-xs text-amber-300">—</span>
                                    <input
                                        type="date"
                                        value={customEnd}
                                        onChange={(e) => setCustomEnd(e.target.value)}
                                        className="w-32 text-xs font-semibold text-[#451a03] outline-none"
                                    />
                                    <button
                                        onClick={applyCustom}
                                        className="rounded-xl bg-[#b45309] px-3 py-1 text-xs font-bold text-white transition-colors hover:bg-amber-700"
                                    >
                                        Terapkan
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── KPI Cards ────────────────────────────────────────── */}
                    <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
                        {/* Total Orders */}
                        <div className="col-span-1 rounded-[1.75rem] border border-amber-100/60 bg-white/95 p-5 shadow-sm">
                            <div className="flex items-start justify-between gap-2">
                                <div className="rounded-2xl bg-amber-100 p-2.5">
                                    <Package className="size-5 text-amber-600" />
                                </div>
                                <span
                                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                        orderGrowth.positive
                                            ? 'bg-emerald-50 text-emerald-600'
                                            : 'bg-red-50 text-red-500'
                                    }`}
                                >
                                    {orderGrowth.text}
                                </span>
                            </div>
                            <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-400">
                                Total Order
                            </p>
                            <p className="mt-1.5 text-2xl font-black text-[#111827]">
                                {kpi.total_orders.toLocaleString('id-ID')}
                            </p>
                            <p className="mt-1 text-xs text-[#92400e]">
                                {orderGrowth.positive ? (
                                    <span className="inline-flex items-center gap-1">
                                        <TrendingUp className="size-3 text-emerald-500" /> naik vs periode lalu
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1">
                                        <TrendingDown className="size-3 text-red-500" /> turun vs periode lalu
                                    </span>
                                )}
                            </p>
                        </div>

                        {/* Revenue */}
                        <div className="col-span-1 rounded-[1.75rem] border border-amber-100/60 bg-white/95 p-5 shadow-sm">
                            <div className="flex items-start justify-between gap-2">
                                <div className="rounded-2xl bg-yellow-100 p-2.5">
                                    <HandCoins className="size-5 text-yellow-600" />
                                </div>
                                <span
                                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                        revenueGrowth.positive
                                            ? 'bg-emerald-50 text-emerald-600'
                                            : 'bg-red-50 text-red-500'
                                    }`}
                                >
                                    {revenueGrowth.text}
                                </span>
                            </div>
                            <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-400">
                                Total Revenue
                            </p>
                            <p className="mt-1.5 text-2xl font-black text-[#111827]">
                                {formatRupiah(kpi.total_revenue)}
                            </p>
                            <p className="mt-1 text-xs text-[#92400e]">
                                {revenueGrowth.positive ? (
                                    <span className="inline-flex items-center gap-1">
                                        <TrendingUp className="size-3 text-emerald-500" /> naik vs periode lalu
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1">
                                        <TrendingDown className="size-3 text-red-500" /> turun vs periode lalu
                                    </span>
                                )}
                            </p>
                        </div>

                        {/* Avg Order Value */}
                        <div className="col-span-1 rounded-[1.75rem] border border-amber-100/60 bg-white/95 p-5 shadow-sm">
                            <div className="rounded-2xl bg-amber-50 p-2.5 w-fit">
                                <ShoppingBag className="size-5 text-amber-600" />
                            </div>
                            <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-400">
                                Avg Order Value
                            </p>
                            <p className="mt-1.5 text-2xl font-black text-[#111827]">
                                {formatRupiah(kpi.avg_order_value)}
                            </p>
                            <p className="mt-1 text-xs text-[#92400e]">per transaksi</p>
                        </div>

                        {/* Paid Orders */}
                        <div className="col-span-1 rounded-[1.75rem] border border-amber-100/60 bg-white/95 p-5 shadow-sm">
                            <div className="rounded-2xl bg-emerald-100 p-2.5 w-fit">
                                <Users className="size-5 text-emerald-600" />
                            </div>
                            <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-400">
                                Order Lunas
                            </p>
                            <p className="mt-1.5 text-2xl font-black text-[#111827]">
                                {kpi.paid_orders.toLocaleString('id-ID')}
                            </p>
                            <p className="mt-1 text-xs text-[#92400e]">
                                {kpi.paid_rate}% dari total order
                            </p>
                        </div>

                        {/* Paid Rate */}
                        <div className="col-span-2 sm:col-span-1 rounded-[1.75rem] border border-amber-100/60 bg-[linear-gradient(135deg,#fffbeb,#fef3c7)] p-5 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-400">
                                        Tingkat Bayar
                                    </p>
                                    <p className="mt-1.5 text-3xl font-black text-[#111827]">{kpi.paid_rate}%</p>
                                </div>
                                <div className="rounded-2xl bg-white/80 p-2.5">
                                    <Calendar className="size-5 text-amber-500" />
                                </div>
                            </div>
                            {/* Mini progress bar */}
                            <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-amber-100">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-700"
                                    style={{ width: `${kpi.paid_rate}%` }}
                                />
                            </div>
                            <p className="mt-2 text-xs text-[#92400e]">
                                {(kpi.total_orders - kpi.paid_orders).toLocaleString('id-ID')} belum lunas
                            </p>
                        </div>
                    </section>

                    {/* ── Charts Row ───────────────────────────────────────── */}
                    <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.7fr_1fr]">

                        {/* Daily / Hourly Trend Chart */}
                        <div className="rounded-[2rem] border border-amber-100/70 bg-white/95 p-6 shadow-sm">
                            <div className="mb-5 flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-amber-400">
                                        {trendType === 'hourly' ? 'Tren Per Jam' : 'Tren Harian'}
                                    </p>
                                    <h2 className="mt-1.5 text-xl font-black text-[#451a03]">
                                        {trendType === 'hourly' ? 'Order Per Jam' : 'Order Per Hari'}
                                    </h2>
                                </div>
                                <div className="rounded-2xl bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-600">
                                    {trendType === 'hourly'
                                        ? `${dailyTrend.filter((d) => d.orders > 0).length} jam aktif`
                                        : `${dailyTrend.length} hari`}
                                </div>
                            </div>
                            <div className="rounded-[1.5rem] bg-[linear-gradient(180deg,#fffbeb_0%,#ffffff_100%)] p-4">
                                <DailyTrendChart data={dailyTrend} />
                            </div>
                            <div className="mt-4 grid grid-cols-3 gap-3">
                                <div className="rounded-2xl bg-amber-50/60 px-3 py-2.5 text-center">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">Total</p>
                                    <p className="mt-1 text-base font-black text-[#111827]">
                                        {dailyTrend.reduce((s, d) => s + d.orders, 0).toLocaleString('id-ID')}
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-amber-50/60 px-3 py-2.5 text-center">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">Rata-rata</p>
                                    <p className="mt-1 text-base font-black text-[#111827]">
                                        {dailyTrend.length > 0
                                            ? Math.round(
                                                  dailyTrend.reduce((s, d) => s + d.orders, 0) /
                                                      (trendType === 'hourly'
                                                          ? Math.max(dailyTrend.filter((d) => d.orders > 0).length, 1)
                                                          : dailyTrend.length),
                                              ).toLocaleString('id-ID')
                                            : 0}{' '}
                                        <span className="text-xs font-semibold text-[#92400e]">
                                            / {trendType === 'hourly' ? 'jam' : 'hari'}
                                        </span>
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-amber-50/60 px-3 py-2.5 text-center">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">Maks</p>
                                    <p className="mt-1 text-base font-black text-[#111827]">
                                        {dailyTrend.length > 0
                                            ? Math.max(...dailyTrend.map((d) => d.orders)).toLocaleString('id-ID')
                                            : 0}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Platform Distribution */}
                        <div className="rounded-[2rem] border border-amber-100/70 bg-white/95 p-6 shadow-sm">
                            <div className="mb-5">
                                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-amber-400">
                                    Platform
                                </p>
                                <h2 className="mt-1.5 text-xl font-black text-[#451a03]">
                                    Distribusi Channel
                                </h2>
                            </div>
                            <PlatformBars data={platformData} />

                            {platformData.length > 0 && (
                                <div className="mt-5 rounded-2xl bg-amber-50/60 px-4 py-3">
                                    <p className="text-xs font-semibold text-[#78350f]">
                                        Channel terkuat:{' '}
                                        <span className="font-black text-[#451a03]">
                                            {platformData[0]?.platform ?? '-'}
                                        </span>
                                    </p>
                                    <p className="mt-1 text-xs text-[#92400e]">
                                        {platformData[0]?.count.toLocaleString('id-ID')} orders (
                                        {platformData.length > 0
                                            ? Math.round(
                                                  (platformData[0].count /
                                                      platformData.reduce((s, d) => s + d.count, 0)) *
                                                      100,
                                              )
                                            : 0}
                                        % share)
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* ── PIC Leaderboard ──────────────────────────────────── */}
                    <section>
                        <div className="mb-4">
                            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-amber-400">
                                Hall of Fame
                            </p>
                            <h2 className="mt-1 text-2xl font-black text-[#451a03]">Performa Tim per Periode</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                            <LeaderColumn
                                title="Si Paling CS"
                                subtitle="Customer Service"
                                icon={Headset}
                                iconBg="bg-amber-100 text-amber-600"
                                data={leaderboards?.cs ?? []}
                            />
                            <LeaderColumn
                                title="Top CS Support"
                                subtitle="CS Support"
                                icon={Users}
                                iconBg="bg-blue-100 text-blue-600"
                                data={leaderboards?.cs_support ?? []}
                            />
                            <LeaderColumn
                                title="Layouter Ter Rajin"
                                subtitle="Layouter"
                                icon={LayoutTemplate}
                                iconBg="bg-violet-100 text-violet-600"
                                data={leaderboards?.layouter ?? []}
                            />
                        </div>
                    </section>

                    {/* ── Recent Orders ────────────────────────────────────── */}
                    <section className="rounded-[2rem] border border-amber-100/70 bg-white/95 p-6 shadow-sm">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-amber-400">
                                    Transaksi
                                </p>
                                <h2 className="mt-1.5 text-2xl font-black text-[#451a03]">Order Terbaru</h2>
                            </div>
                        </div>

                        <div className="grid gap-3">
                            {latestOrders.map((order) => (
                                <div
                                    key={order.order_code}
                                    className="grid gap-3 rounded-[1.5rem] border border-amber-100/70 bg-[linear-gradient(180deg,#fefce8_0%,#fffbeb_100%)] p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center"
                                >
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 font-black text-[#b45309]">
                                        {getInitial(order.customer_name)}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="truncate text-sm font-black text-[#111827]">
                                                {order.customer_name}
                                            </p>
                                            {order.platform && (
                                                <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-yellow-700">
                                                    {order.platform}
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-0.5 text-xs font-semibold text-[#92400e]">
                                            #{order.order_code}
                                        </p>
                                        <p className="mt-0.5 text-[11px] text-amber-300">
                                            {relativeTime(order.created_at)}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-start gap-1.5 sm:items-end">
                                        <span className="text-sm font-black text-[#111827]">
                                            {formatRupiah(order.total_payment)}
                                        </span>
                                        {order.status ? (
                                            <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-600">
                                                {order.status}
                                            </span>
                                        ) : (
                                            <span
                                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] ${
                                                    order.is_paid
                                                        ? 'bg-emerald-50 text-emerald-600'
                                                        : 'bg-amber-50 text-amber-600'
                                                }`}
                                            >
                                                {order.is_paid ? 'Lunas' : 'Belum Bayar'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}

Analytics.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Analytics IDPhotobook', href: analytics() },
    ],
};

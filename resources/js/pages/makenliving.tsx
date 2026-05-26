import { Head, router, usePage } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowUpRight,
    Award,
    CalendarDays,
    Crown,
    HandCoins,
    ShoppingBag,
    ShoppingCart,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import { dashboard, makenliving } from '@/routes';

// ── Types ──────────────────────────────────────────────────────────────────

interface KPI {
    total_orders: number;
    total_revenue: number;
    avg_order_value: number;
    order_growth: number;
    revenue_growth: number;
}

interface StatusItem {
    status: string;
    count: number;
}

interface TrendItem {
    label: string;
    orders: number;
    revenue: number;
}

interface CsItem {
    rank: number;
    name: string;
    count: number;
    revenue: number;
    share: number;
}

interface OrderItem {
    order_code: string;
    customer_name: string;
    user_name: string;
    total_price: number;
    status: string;
    created_at: string | null;
}

interface PageProps {
    period: string;
    periodStart: string;
    periodEnd: string;
    trendType: 'hourly' | 'daily';
    kpi: KPI;
    statusData: StatusItem[];
    trend: TrendItem[];
    csLeaderboard: CsItem[];
    latestOrders: OrderItem[];
}

// ── Helpers ────────────────────────────────────────────────────────────────

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

function formatIdr(n: number) {
    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}M`;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}jt`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}rb`;
    return n.toString();
}

function statusColor(status: string): string {
    const s = status.toLowerCase();
    if (s.includes('selesai') || s.includes('done') || s.includes('complete')) return '#10b981';
    if (s.includes('batal') || s.includes('cancel')) return '#ef4444';
    if (s.includes('kirim') || s.includes('ship')) return '#3b82f6';
    if (s.includes('proses') || s.includes('process')) return '#f59e0b';
    return '#8b5cf6';
}

// ── Trend Chart ────────────────────────────────────────────────────────────

function TrendChart({ data }: { data: TrendItem[] }) {
    const [hovered, setHovered] = useState<number | null>(null);

    if (data.length === 0) {
        return (
            <div className="flex h-40 items-center justify-center text-sm text-pink-300">
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
    const step = Math.max(1, Math.floor(data.length / 8));
    const labelPoints = points.filter((_, i) => i % step === 0 || i === points.length - 1);
    const TW = 80;
    const TH = 34;

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
            <defs>
                <linearGradient id="mkGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ec4899" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity="0.02" />
                </linearGradient>
            </defs>

            {[0, 0.33, 0.66, 1].map((t) => (
                <line
                    key={t}
                    x1={padX}
                    y1={padY + innerH * (1 - t)}
                    x2={width - padX}
                    y2={padY + innerH * (1 - t)}
                    stroke="#fce7f3"
                    strokeWidth="1"
                />
            ))}

            <path d={areaD} fill="url(#mkGrad)" />
            <path d={pathD} fill="none" stroke="#ec4899" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />

            {hovered !== null && (
                <line
                    x1={points[hovered].x}
                    y1={padY}
                    x2={points[hovered].x}
                    y2={height - 12}
                    stroke="#ec4899"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    opacity="0.5"
                />
            )}

            {points.map((p, i) => (
                <g key={i}>
                    <circle
                        cx={p.x}
                        cy={p.y}
                        r={hovered === i ? 5 : 3.5}
                        fill={hovered === i ? '#ec4899' : 'white'}
                        stroke="#ec4899"
                        strokeWidth="2"
                        style={{ transition: 'r 0.1s, fill 0.1s' }}
                    />
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

            {hovered !== null &&
                (() => {
                    const p = points[hovered];
                    const tx = Math.min(Math.max(p.x - TW / 2, padX), width - padX - TW);
                    const ty = Math.max(p.y - TH - 8, padY);
                    return (
                        <g style={{ pointerEvents: 'none' }}>
                            <rect x={tx} y={ty} width={TW} height={TH} rx="6" fill="#831843" opacity="0.93" />
                            <polygon
                                points={`${p.x - 5},${ty + TH} ${p.x + 5},${ty + TH} ${p.x},${ty + TH + 6}`}
                                fill="#831843"
                                opacity="0.93"
                            />
                            <text x={tx + TW / 2} y={ty + 13} fill="#fbcfe8" fontSize="9" fontWeight="600" textAnchor="middle">
                                {p.label}
                            </text>
                            <text x={tx + TW / 2} y={ty + 26} fill="white" fontSize="10" fontWeight="800" textAnchor="middle">
                                {p.orders.toLocaleString('id-ID')} order
                            </text>
                        </g>
                    );
                })()}

            {labelPoints.map((p, i) => (
                <text key={i} x={p.x} y={height - 2} fill="#f9a8d4" fontSize="9" textAnchor="middle">
                    {p.label}
                </text>
            ))}
        </svg>
    );
}

// ── Status Bar Chart ───────────────────────────────────────────────────────

function StatusBars({ data }: { data: StatusItem[] }) {
    if (data.length === 0)
        return <div className="flex h-40 items-center justify-center text-sm text-pink-300">Tidak ada data</div>;

    const maxCount = Math.max(...data.map((d) => d.count), 1);
    const total = data.reduce((s, d) => s + d.count, 0);

    return (
        <div className="space-y-3">
            {data.slice(0, 8).map((d) => (
                <div key={d.status}>
                    <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="max-w-[140px] truncate text-xs font-semibold capitalize text-pink-900">
                            {d.status}
                        </span>
                        <span className="text-xs font-bold text-pink-700">
                            {d.count.toLocaleString('id-ID')}{' '}
                            <span className="font-normal text-pink-500">({((d.count / total) * 100).toFixed(1)}%)</span>
                        </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-pink-100">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                                width: `${(d.count / maxCount) * 100}%`,
                                backgroundColor: statusColor(d.status),
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function Makenliving() {
    const { period, periodStart, periodEnd, trendType, kpi, statusData, trend, csLeaderboard, latestOrders } =
        usePage().props as unknown as PageProps;

    function changePeriod(value: string) {
        router.get(makenliving().url, { period: value }, { preserveScroll: true });
    }

    const GrowthIcon = kpi.order_growth >= 0 ? TrendingUp : TrendingDown;
    const GrowthColor = kpi.order_growth >= 0 ? 'text-pink-600' : 'text-red-500';

    return (
        <>
            <Head title="Analytics Makenliving" />

            <div className="min-h-screen bg-transparent px-4 py-8 sm:px-8">
                {/* ── Header ── */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-pink-500">
                            Analytics
                        </p>
                        <h1 className="mt-1 text-3xl font-black tracking-tight text-[#831843]">Makenliving</h1>
                        <p className="mt-1 text-sm text-pink-600">
                            {periodStart} — {periodEnd}
                        </p>
                    </div>

                    {/* Period filter */}
                    <div className="flex flex-wrap gap-1.5">
                        {PERIOD_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => changePeriod(opt.value)}
                                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                                    period === opt.value
                                        ? 'bg-pink-600 text-white shadow-md shadow-pink-200'
                                        : 'bg-white/80 text-pink-700 hover:bg-pink-50 hover:text-pink-900'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                        <button className="flex items-center gap-1.5 rounded-xl border border-pink-200 bg-white px-3 py-1.5 text-xs font-bold text-pink-600 hover:bg-pink-50">
                            <CalendarDays className="size-3.5" />
                            Custom
                        </button>
                    </div>
                </div>

                {/* ── KPI Cards ── */}
                <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {/* Total Orders */}
                    <div className="rounded-2xl border border-pink-100/70 bg-white/95 p-5 shadow-sm">
                        <div className="mb-3 flex items-center justify-between">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-pink-100">
                                <ShoppingCart className="size-4.5 text-pink-600" />
                            </div>
                            <span
                                className={`flex items-center gap-0.5 text-xs font-bold ${kpi.order_growth >= 0 ? 'text-pink-600' : 'text-red-500'}`}
                            >
                                {kpi.order_growth >= 0 ? (
                                    <ArrowUpRight className="size-3.5" />
                                ) : (
                                    <ArrowDownRight className="size-3.5" />
                                )}
                                {Math.abs(kpi.order_growth)}%
                            </span>
                        </div>
                        <p className="text-2xl font-black text-[#831843]">{kpi.total_orders.toLocaleString('id-ID')}</p>
                        <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-pink-500">
                            Total Order
                        </p>
                    </div>

                    {/* Revenue */}
                    <div className="rounded-2xl border border-pink-100/70 bg-white/95 p-5 shadow-sm">
                        <div className="mb-3 flex items-center justify-between">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-rose-100">
                                <HandCoins className="size-4.5 text-rose-600" />
                            </div>
                            <span
                                className={`flex items-center gap-0.5 text-xs font-bold ${kpi.revenue_growth >= 0 ? 'text-pink-600' : 'text-red-500'}`}
                            >
                                {kpi.revenue_growth >= 0 ? (
                                    <ArrowUpRight className="size-3.5" />
                                ) : (
                                    <ArrowDownRight className="size-3.5" />
                                )}
                                {Math.abs(kpi.revenue_growth)}%
                            </span>
                        </div>
                        <p className="text-2xl font-black text-[#831843]">
                            Rp {formatIdr(kpi.total_revenue)}
                        </p>
                        <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-pink-500">
                            Total Revenue
                        </p>
                    </div>

                    {/* Avg Order Value */}
                    <div className="rounded-2xl border border-pink-100/70 bg-white/95 p-5 shadow-sm">
                        <div className="mb-3 flex items-center justify-between">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-pink-100">
                                <ShoppingBag className="size-4.5 text-pink-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-[#831843]">Rp {formatIdr(kpi.avg_order_value)}</p>
                        <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-pink-500">
                            Avg / Order
                        </p>
                    </div>

                    {/* Growth */}
                    <div className="rounded-2xl border border-pink-100/70 bg-white/95 p-5 shadow-sm">
                        <div className="mb-3 flex items-center justify-between">
                            <div
                                className={`flex size-9 items-center justify-center rounded-xl ${kpi.order_growth >= 0 ? 'bg-pink-100' : 'bg-red-100'}`}
                            >
                                <GrowthIcon className={`size-4.5 ${GrowthColor}`} />
                            </div>
                        </div>
                        <p className={`text-2xl font-black ${GrowthColor}`}>
                            {kpi.order_growth >= 0 ? '+' : ''}
                            {kpi.order_growth}%
                        </p>
                        <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-pink-500">
                            Pertumbuhan Order
                        </p>
                    </div>
                </div>

                {/* ── Charts Row ── */}
                <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
                    {/* Trend Chart (wider) */}
                    <div className="rounded-[2rem] border border-pink-100/70 bg-white/95 p-6 shadow-sm lg:col-span-3">
                        <div className="mb-5 flex items-start justify-between gap-3">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-pink-500">
                                    {trendType === 'hourly' ? 'Tren Per Jam' : 'Tren Harian'}
                                </p>
                                <h2 className="mt-1.5 text-xl font-black text-[#831843]">
                                    {trendType === 'hourly' ? 'Order Per Jam' : 'Order Per Hari'}
                                </h2>
                            </div>
                            <div className="rounded-2xl bg-pink-50 px-3 py-1.5 text-xs font-bold text-pink-600">
                                {trendType === 'hourly'
                                    ? `${trend.filter((d) => d.orders > 0).length} jam aktif`
                                    : `${trend.length} hari`}
                            </div>
                        </div>
                        <div className="rounded-[1.5rem] bg-[linear-gradient(180deg,#fdf2f8_0%,#ffffff_100%)] p-4">
                            <TrendChart data={trend} />
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-3">
                            <div className="rounded-2xl bg-pink-50/60 px-3 py-2.5 text-center">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-pink-500">Total</p>
                                <p className="mt-1 text-base font-black text-[#111827]">
                                    {trend.reduce((s, d) => s + d.orders, 0).toLocaleString('id-ID')}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-pink-50/60 px-3 py-2.5 text-center">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-pink-500">Rata-rata</p>
                                <p className="mt-1 text-base font-black text-[#111827]">
                                    {trend.length > 0
                                        ? Math.round(
                                              trend.reduce((s, d) => s + d.orders, 0) /
                                                  (trendType === 'hourly'
                                                      ? Math.max(trend.filter((d) => d.orders > 0).length, 1)
                                                      : trend.length),
                                          ).toLocaleString('id-ID')
                                        : 0}{' '}
                                    <span className="text-xs font-semibold text-pink-700">
                                        / {trendType === 'hourly' ? 'jam' : 'hari'}
                                    </span>
                                </p>
                            </div>
                            <div className="rounded-2xl bg-pink-50/60 px-3 py-2.5 text-center">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-pink-500">Maks</p>
                                <p className="mt-1 text-base font-black text-[#111827]">
                                    {trend.length > 0 ? Math.max(...trend.map((d) => d.orders)).toLocaleString('id-ID') : 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Status Distribution */}
                    <div className="rounded-[2rem] border border-pink-100/70 bg-white/95 p-6 shadow-sm lg:col-span-2">
                        <div className="mb-5">
                            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-pink-500">Status</p>
                            <h2 className="mt-1.5 text-xl font-black text-[#831843]">Distribusi Status</h2>
                        </div>
                        <StatusBars data={statusData} />
                    </div>
                </div>

                {/* ── Top CS + Recent Orders Row ── */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                        {/* CS Leaderboard */}
                    <div className="lg:col-span-2">
                        <div className="rounded-[2rem] border border-pink-100/70 bg-white/95 p-6 shadow-sm">
                            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-pink-500">
                                Leaderboard CS
                            </p>
                            <h2 className="mt-1.5 text-xl font-black text-[#831843]">Paling CS</h2>

                            {csLeaderboard.length > 0 ? (
                                <div className="mt-4">
                                    {/* Champion spotlight */}
                                    {(() => {
                                        const top = csLeaderboard[0];
                                        return (
                                            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 p-5 text-center shadow-lg shadow-amber-200">
                                                <div className="absolute left-0 top-0 h-full w-full opacity-10">
                                                    <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white" />
                                                    <div className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-white" />
                                                </div>
                                                <Crown className="mx-auto mb-1 size-8 text-amber-900/70 drop-shadow" />
                                                <div className="relative">
                                                    <div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-2xl bg-white/30 text-2xl font-black text-amber-900 backdrop-blur-sm">
                                                        {top.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <p className="text-base font-black text-amber-950">{top.name}</p>
                                                    <p className="text-[11px] font-bold text-amber-800">Customer Service #1</p>
                                                </div>
                                                <div className="mt-3 grid grid-cols-2 gap-2">
                                                    <div className="rounded-xl bg-white/30 p-2 backdrop-blur-sm">
                                                        <p className="text-lg font-black text-amber-950">{top.count.toLocaleString('id-ID')}</p>
                                                        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Order</p>
                                                    </div>
                                                    <div className="rounded-xl bg-white/30 p-2 backdrop-blur-sm">
                                                        <p className="text-lg font-black text-amber-950">{top.share}%</p>
                                                        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Share</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* Full ranking list */}
                                    <div className="mt-4 space-y-2 overflow-y-auto" style={{ maxHeight: '260px' }}>
                                        {csLeaderboard.map((cs) => (
                                            <div
                                                key={cs.rank}
                                                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
                                                    cs.rank === 1
                                                        ? 'bg-amber-50 ring-1 ring-amber-200'
                                                        : cs.rank === 2
                                                          ? 'bg-slate-50 ring-1 ring-slate-200'
                                                          : cs.rank === 3
                                                            ? 'bg-orange-50 ring-1 ring-orange-200'
                                                            : 'bg-pink-50/40'
                                                }`}
                                            >
                                                <span
                                                    className={`flex size-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-black ${
                                                        cs.rank === 1
                                                            ? 'bg-amber-400 text-amber-950'
                                                            : cs.rank === 2
                                                              ? 'bg-slate-300 text-slate-800'
                                                              : cs.rank === 3
                                                                ? 'bg-orange-300 text-orange-900'
                                                                : 'bg-pink-100 text-pink-700'
                                                    }`}
                                                >
                                                    {cs.rank}
                                                </span>
                                                <span className="min-w-0 flex-1 truncate text-sm font-bold text-[#831843]">{cs.name}</span>
                                                <div className="text-right">
                                                    <p className="text-sm font-black text-[#831843]">{cs.count.toLocaleString('id-ID')}</p>
                                                    <p className="text-[10px] font-semibold text-pink-500">{cs.share}%</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-8 flex flex-col items-center justify-center py-8 text-pink-300">
                                    <Award className="mb-2 size-10" />
                                    <p className="text-sm">Belum ada data CS</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="rounded-[2rem] border border-pink-100/70 bg-white/95 p-6 shadow-sm lg:col-span-3">
                        <div className="mb-5 flex items-start justify-between gap-3">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-pink-500">
                                    Terbaru
                                </p>
                                <h2 className="mt-1.5 text-xl font-black text-[#831843]">Order Terbaru</h2>
                            </div>
                            <div className="rounded-2xl bg-pink-50 px-3 py-1.5 text-xs font-bold text-pink-600">
                                {latestOrders.length} order
                            </div>
                        </div>

                        <div className="space-y-2 overflow-y-auto" style={{ maxHeight: '420px' }}>
                            {latestOrders.length === 0 ? (
                                <p className="py-8 text-center text-sm text-pink-300">Belum ada order</p>
                            ) : (
                                latestOrders.map((o, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-3 rounded-2xl bg-pink-50/50 px-4 py-3 transition-colors hover:bg-pink-50"
                                    >
                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-pink-100 text-xs font-bold text-pink-700">
                                            {i + 1}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="truncate text-sm font-bold text-[#831843]">
                                                    {o.order_code}
                                                </p>
                                                <span
                                                    className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold capitalize text-white"
                                                    style={{ backgroundColor: statusColor(o.status) }}
                                                >
                                                    {o.status}
                                                </span>
                                            </div>
                                            <p className="truncate text-xs text-pink-600">
                                                {o.customer_name}{' '}
                                                <span className="text-pink-400">· CS: {o.user_name}</span>
                                            </p>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <p className="text-sm font-black text-[#831843]">
                                                Rp {formatIdr(o.total_price)}
                                            </p>
                                            <p className="text-[10px] text-pink-500">
                                                {o.created_at ? new Date(o.created_at).toLocaleDateString('id-ID') : '-'}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Makenliving.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Analytics Makenliving', href: makenliving() },
    ],
};

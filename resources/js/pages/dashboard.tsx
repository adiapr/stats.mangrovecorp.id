import { Head, usePage } from '@inertiajs/react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { useRef, useState } from 'react';
import { dashboard } from '@/routes';

// ── Types ─────────────────────────────────────────────────────────────────

interface ServiceSummary {
    total_orders: number;
    total_revenue: number;
    today_orders: number;
    order_growth: number;
    revenue_growth: number;
}

interface ComparisonPoint {
    label: string;
    mkl_orders: number;
    mkl_revenue: number;
    idp_orders: number;
    idp_revenue: number;
}

interface PageProps {
    auth: { user: { name: string } };
    mkl: ServiceSummary;
    idp: ServiceSummary;
    comparisonDaily: ComparisonPoint[];
    comparisonHourly: ComparisonPoint[];
}

// ── Helpers ───────────────────────────────────────────────────────────────

function fmt(n: number): string {
    if (n >= 1_000_000_000) return `Rp${(n / 1_000_000_000).toFixed(1)}M`;
    if (n >= 1_000_000) return `Rp${(n / 1_000_000).toFixed(1)}jt`;
    if (n >= 1_000) return `Rp${Math.round(n / 1_000)}k`;
    return `Rp${n}`;
}

function GrowthBadge({ value }: { value: number }) {
    const pos = value >= 0;
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${pos ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}
        >
            {pos ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {pos ? '+' : ''}
            {value}%
        </span>
    );
}

// ── Dual Line Chart ────────────────────────────────────────────────────────

function DualLineChart({ data }: { data: ComparisonPoint[] }) {
    const [hovered, setHovered] = useState<number | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    if (data.length === 0) {
        return <div className="flex h-40 items-center justify-center text-sm text-slate-300">Tidak ada data</div>;
    }

    const W = 620, H = 168, PX = 12, PY = 16;
    const IW = W - PX * 2;
    const IH = H - PY * 2 - 14; // 14 px for x-axis labels

    const maxOrders = Math.max(...data.map((d) => Math.max(d.mkl_orders, d.idp_orders)), 1);
    const gx = (i: number) => PX + (i / Math.max(data.length - 1, 1)) * IW;
    const gy = (v: number) => PY + IH - (v / maxOrders) * IH;

    const mklPts = data.map((d, i) => ({ x: gx(i), y: gy(d.mkl_orders) }));
    const idpPts = data.map((d, i) => ({ x: gx(i), y: gy(d.idp_orders) }));

    const toPath = (pts: { x: number; y: number }[]) =>
        pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

    const floor = PY + IH;
    const mklPath = toPath(mklPts);
    const idpPath = toPath(idpPts);
    const mklArea = `${mklPath} L${mklPts.at(-1)!.x},${floor} L${mklPts[0].x},${floor} Z`;
    const idpArea = `${idpPath} L${idpPts.at(-1)!.x},${floor} L${idpPts[0].x},${floor} Z`;

    const step = Math.max(1, Math.floor(data.length / 7));
    const labelIdxs = data.reduce<number[]>((acc, _, i) => {
        if (i % step === 0 || i === data.length - 1) acc.push(i);
        return acc;
    }, []);

    const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
        if (!svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const relX = ((e.clientX - rect.left) / rect.width) * W;
        let best = 0,
            bestDx = Infinity;
        data.forEach((_, i) => {
            const dx = Math.abs(gx(i) - relX);
            if (dx < bestDx) {
                bestDx = dx;
                best = i;
            }
        });
        setHovered(best);
    };

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="w-full cursor-crosshair"
            onMouseMove={onMove}
            onMouseLeave={() => setHovered(null)}
        >
            <defs>
                <linearGradient id="dlMklGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ec4899" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="dlIdpGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </linearGradient>
            </defs>

            {/* Grid */}
            {[0, 0.25, 0.5, 0.75, 1].map((t) => (
                <line
                    key={t}
                    x1={PX}
                    y1={PY + IH * (1 - t)}
                    x2={W - PX}
                    y2={PY + IH * (1 - t)}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                />
            ))}

            {/* Area fills */}
            <path d={idpArea} fill="url(#dlIdpGrad)" />
            <path d={mklArea} fill="url(#dlMklGrad)" />

            {/* Lines */}
            <path d={idpPath} fill="none" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d={mklPath} fill="none" stroke="#ec4899" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

            {/* X-axis labels */}
            {labelIdxs.map((i) => (
                <text key={i} x={gx(i)} y={H - 2} fill="#94a3b8" fontSize="9" textAnchor="middle">
                    {data[i].label}
                </text>
            ))}

            {/* Hover elements */}
            {hovered !== null && (
                <>
                    <line
                        x1={gx(hovered)}
                        y1={PY}
                        x2={gx(hovered)}
                        y2={floor}
                        stroke="#e2e8f0"
                        strokeWidth="1"
                        strokeDasharray="4 3"
                    />
                    <circle cx={mklPts[hovered].x} cy={mklPts[hovered].y} r="4" fill="white" stroke="#ec4899" strokeWidth="2" />
                    <circle cx={idpPts[hovered].x} cy={idpPts[hovered].y} r="4" fill="white" stroke="#f59e0b" strokeWidth="2" />
                    {(() => {
                        const tx = Math.min(Math.max(gx(hovered) - 54, 4), W - 116);
                        const minY = Math.min(mklPts[hovered].y, idpPts[hovered].y);
                        const ty = Math.max(minY - 50, 4);
                        return (
                            <g pointerEvents="none">
                                <rect x={tx} y={ty} width="112" height="42" rx="6" fill="white" stroke="#e2e8f0" strokeWidth="1" />
                                <text x={tx + 8} y={ty + 14} fill="#94a3b8" fontSize="8.5">
                                    {data[hovered].label}
                                </text>
                                <circle cx={tx + 8} cy={ty + 26} r="3" fill="#ec4899" />
                                <text x={tx + 15} y={ty + 29} fill="#111827" fontSize="9" fontWeight="bold">
                                    MKL: {data[hovered].mkl_orders}
                                </text>
                                <circle cx={tx + 65} cy={ty + 26} r="3" fill="#f59e0b" />
                                <text x={tx + 72} y={ty + 29} fill="#111827" fontSize="9" fontWeight="bold">
                                    IDP: {data[hovered].idp_orders}
                                </text>
                            </g>
                        );
                    })()}
                </>
            )}
        </svg>
    );
}

// ── Hourly Dual Bar Chart ──────────────────────────────────────────────────

function HourlyChart({ data }: { data: ComparisonPoint[] }) {
    const [hovered, setHovered] = useState<number | null>(null);

    const W = 640, H = 128, PX = 10, PY = 10;
    const IW = W - PX * 2;
    const IH = H - PY * 2 - 16;
    const maxOrders = Math.max(...data.map((d) => Math.max(d.mkl_orders, d.idp_orders)), 1);

    const slotW = IW / 24;
    const barW = slotW * 0.38;
    const gap = slotW * 0.07;

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
            {/* Grid */}
            {[0, 0.5, 1].map((t) => (
                <line key={t} x1={PX} y1={PY + IH * (1 - t)} x2={W - PX} y2={PY + IH * (1 - t)} stroke="#f1f5f9" strokeWidth="1" />
            ))}

            {data.map((d, i) => {
                const slotX = PX + i * slotW;
                const mklH = (d.mkl_orders / maxOrders) * IH;
                const idpH = (d.idp_orders / maxOrders) * IH;
                const mklX = slotX + gap;
                const idpX = mklX + barW + gap * 0.5;
                const floor = PY + IH;
                const isHov = hovered === i;
                const dimmed = hovered !== null && !isHov;

                return (
                    <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
                        {/* Hover hit area */}
                        <rect x={slotX} y={PY} width={slotW} height={IH} fill="transparent" />

                        {mklH > 0 && (
                            <rect
                                x={mklX}
                                y={floor - mklH}
                                width={barW}
                                height={mklH}
                                rx="1.5"
                                fill={isHov ? '#db2777' : '#ec4899'}
                                opacity={dimmed ? 0.3 : 1}
                            />
                        )}
                        {idpH > 0 && (
                            <rect
                                x={idpX}
                                y={floor - idpH}
                                width={barW}
                                height={idpH}
                                rx="1.5"
                                fill={isHov ? '#d97706' : '#f59e0b'}
                                opacity={dimmed ? 0.3 : 1}
                            />
                        )}

                        {/* X-axis label every 4 hours */}
                        {i % 4 === 0 && (
                            <text x={slotX + slotW / 2} y={H - 2} fill="#94a3b8" fontSize="8.5" textAnchor="middle">
                                {d.label}
                            </text>
                        )}

                        {/* Tooltip */}
                        {isHov && (d.mkl_orders > 0 || d.idp_orders > 0) &&
                            (() => {
                                const tx = Math.min(Math.max(slotX - 44, 4), W - 100);
                                return (
                                    <g pointerEvents="none">
                                        <rect x={tx} y={4} width="96" height="40" rx="5" fill="white" stroke="#e2e8f0" strokeWidth="1" />
                                        <text x={tx + 6} y={16} fill="#94a3b8" fontSize="8.5">
                                            {d.label}
                                        </text>
                                        <circle cx={tx + 7} cy={26} r="3" fill="#ec4899" />
                                        <text x={tx + 13} y={29} fill="#111827" fontSize="9" fontWeight="bold">
                                            MKL: {d.mkl_orders}
                                        </text>
                                        <circle cx={tx + 55} cy={26} r="3" fill="#f59e0b" />
                                        <text x={tx + 61} y={29} fill="#111827" fontSize="9" fontWeight="bold">
                                            IDP: {d.idp_orders}
                                        </text>
                                    </g>
                                );
                            })()}
                    </g>
                );
            })}
        </svg>
    );
}

// ── Dashboard ──────────────────────────────────────────────────────────────

export default function Dashboard() {
    const { auth, mkl, idp, comparisonDaily, comparisonHourly } = usePage().props as unknown as PageProps;
    const firstName = (auth?.user?.name ?? '').split(' ')[0] || 'Admin';

    const combinedTodayOrders  = (mkl?.today_orders  ?? 0) + (idp?.today_orders  ?? 0);
    const combinedMonthOrders  = (mkl?.total_orders   ?? 0) + (idp?.total_orders   ?? 0);
    const combinedMonthRevenue = (mkl?.total_revenue  ?? 0) + (idp?.total_revenue  ?? 0);

    const chartTotalMkl = comparisonDaily?.reduce((s, d) => s + d.mkl_orders, 0) ?? 0;
    const chartTotalIdp = comparisonDaily?.reduce((s, d) => s + d.idp_orders, 0) ?? 0;

    const kpiCards = [
        {
            label: 'MKL — ORDER BULAN INI',
            value: (mkl?.total_orders ?? 0).toLocaleString(),
            sub: `Hari ini: ${mkl?.today_orders ?? 0} order`,
            growth: mkl?.order_growth ?? 0,
            accent: 'border-pink-100/70',
            blob: 'bg-pink-50/70',
        },
        {
            label: 'MKL — REVENUE BULAN INI',
            value: fmt(mkl?.total_revenue ?? 0),
            sub: `AOV: ${mkl?.total_orders ? fmt(Math.round((mkl.total_revenue ?? 0) / mkl.total_orders)) : '-'}`,
            growth: mkl?.revenue_growth ?? 0,
            accent: 'border-pink-100/70',
            blob: 'bg-pink-50/70',
        },
        {
            label: 'IDP — ORDER BULAN INI',
            value: (idp?.total_orders ?? 0).toLocaleString(),
            sub: `Hari ini: ${idp?.today_orders ?? 0} order`,
            growth: idp?.order_growth ?? 0,
            accent: 'border-amber-100/70',
            blob: 'bg-amber-50/60',
        },
        {
            label: 'IDP — REVENUE BULAN INI',
            value: fmt(idp?.total_revenue ?? 0),
            sub: `AOV: ${idp?.total_orders ? fmt(Math.round((idp.total_revenue ?? 0) / idp.total_orders)) : '-'}`,
            growth: idp?.revenue_growth ?? 0,
            accent: 'border-amber-100/70',
            blob: 'bg-amber-50/60',
        },
    ];

    return (
        <>
            <Head title="Dashboard" />

            <div className="relative min-h-[calc(100vh-4rem)] bg-transparent p-4 lg:p-8">
                <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,_rgba(244,114,182,0.10),_transparent_60%)]" />

                <div className="relative z-10 flex flex-col gap-6">

                    {/* ── Hero ── */}
                    <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
                        <div className="relative overflow-hidden rounded-[2rem] border border-pink-100/70 bg-[linear-gradient(135deg,#fffefe_0%,#fff4f7_45%,#fff8ef_100%)] p-7 shadow-[0_24px_80px_-45px_rgba(190,24,93,0.35)]">
                            <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,_rgba(250,204,21,0.20),_transparent_55%)]" />
                            <div className="relative">
                                <div className="inline-flex items-center gap-2 rounded-full border border-pink-100 bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-pink-500">
                                    Executive Dashboard
                                </div>
                                <h1 className="mt-4 text-3xl font-black tracking-tight text-[#4c0519] sm:text-4xl">
                                    Selamat datang, {firstName}.
                                </h1>
                                <p className="mt-2 text-sm leading-6 text-[#9d174d]">
                                    Data real-time dari Makenliving &amp; IDPhotobook.
                                </p>
                                <div className="mt-6 flex flex-wrap gap-3">
                                    <div className="rounded-2xl border border-pink-100 bg-white/80 px-5 py-3 shadow-sm">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-pink-400">
                                            Order Hari Ini
                                        </p>
                                        <p className="mt-1 text-2xl font-black text-[#111827]">{combinedTodayOrders}</p>
                                    </div>
                                    <div className="rounded-2xl border border-pink-100 bg-white/80 px-5 py-3 shadow-sm">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-pink-400">
                                            Order Bulan Ini
                                        </p>
                                        <p className="mt-1 text-2xl font-black text-[#111827]">
                                            {combinedMonthOrders.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-amber-100 bg-white/80 px-5 py-3 shadow-sm">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500">
                                            Revenue Bulan Ini
                                        </p>
                                        <p className="mt-1 text-2xl font-black text-[#111827]">
                                            {fmt(combinedMonthRevenue)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Service mini-summary */}
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                            <div className="rounded-[1.5rem] border border-pink-100/70 bg-white/90 p-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="h-3 w-3 rounded-full bg-pink-500" />
                                        <p className="text-[11px] font-bold uppercase tracking-widest text-pink-500">
                                            Makenliving
                                        </p>
                                    </div>
                                    <GrowthBadge value={mkl?.order_growth ?? 0} />
                                </div>
                                <p className="mt-3 text-2xl font-black text-[#111827]">
                                    {(mkl?.total_orders ?? 0).toLocaleString()}{' '}
                                    <span className="text-sm font-semibold text-[#9d174d]">order</span>
                                </p>
                                <p className="text-sm font-semibold text-[#9d174d]">{fmt(mkl?.total_revenue ?? 0)}</p>
                                <p className="mt-2 text-xs text-pink-400">Hari ini: {mkl?.today_orders ?? 0} order</p>
                            </div>
                            <div className="rounded-[1.5rem] border border-amber-100/70 bg-white/90 p-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="h-3 w-3 rounded-full bg-amber-400" />
                                        <p className="text-[11px] font-bold uppercase tracking-widest text-amber-600">
                                            IDPhotobook
                                        </p>
                                    </div>
                                    <GrowthBadge value={idp?.order_growth ?? 0} />
                                </div>
                                <p className="mt-3 text-2xl font-black text-[#111827]">
                                    {(idp?.total_orders ?? 0).toLocaleString()}{' '}
                                    <span className="text-sm font-semibold text-[#92400e]">order</span>
                                </p>
                                <p className="text-sm font-semibold text-[#92400e]">{fmt(idp?.total_revenue ?? 0)}</p>
                                <p className="mt-2 text-xs text-amber-400">Hari ini: {idp?.today_orders ?? 0} order</p>
                            </div>
                        </div>
                    </section>

                    {/* ── KPI Cards ── */}
                    <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                        {kpiCards.map((card) => (
                            <div
                                key={card.label}
                                className={`relative overflow-hidden rounded-[1.75rem] border ${card.accent} bg-white/95 p-6 shadow-[0_24px_60px_-50px_rgba(15,23,42,0.4)] transition-transform duration-200 hover:-translate-y-1`}
                            >
                                <div className={`absolute right-0 top-0 h-24 w-24 rounded-full ${card.blob} blur-2xl`} />
                                <div className="relative">
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-pink-400">
                                            {card.label}
                                        </p>
                                        <GrowthBadge value={card.growth} />
                                    </div>
                                    <p className="mt-4 text-3xl font-black tracking-tight text-[#111827]">{card.value}</p>
                                    <p className="mt-2 text-xs font-semibold text-[#9d174d]">{card.sub}</p>
                                </div>
                            </div>
                        ))}
                    </section>

                    {/* ── Daily Comparison Chart ── */}
                    <section className="rounded-[2rem] border border-pink-100/70 bg-white/95 p-6 shadow-[0_24px_70px_-55px_rgba(15,23,42,0.35)]">
                        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-pink-400">
                                    Perbandingan Order
                                </p>
                                <h2 className="mt-1 text-xl font-black text-[#4c0519]">30 Hari Terakhir</h2>
                            </div>
                            <div className="flex items-center gap-5 text-xs font-bold text-[#374151]">
                                <span className="flex items-center gap-2">
                                    <span className="inline-block h-2.5 w-6 rounded-full bg-pink-500" />
                                    Makenliving ({chartTotalMkl.toLocaleString()})
                                </span>
                                <span className="flex items-center gap-2">
                                    <span className="inline-block h-2.5 w-6 rounded-full bg-amber-400" />
                                    IDPhotobook ({chartTotalIdp.toLocaleString()})
                                </span>
                            </div>
                        </div>
                        <DualLineChart data={comparisonDaily ?? []} />
                    </section>

                    {/* ── Hourly Today Chart ── */}
                    <section className="rounded-[2rem] border border-pink-100/70 bg-white/95 p-6 shadow-[0_24px_70px_-55px_rgba(15,23,42,0.35)]">
                        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-pink-400">
                                    Distribusi Per Jam
                                </p>
                                <h2 className="mt-1 text-xl font-black text-[#4c0519]">Hari Ini</h2>
                            </div>
                            <div className="flex items-center gap-5 text-xs font-bold text-[#374151]">
                                <span className="flex items-center gap-2">
                                    <span className="inline-block h-2.5 w-5 rounded bg-pink-500" />
                                    Makenliving
                                </span>
                                <span className="flex items-center gap-2">
                                    <span className="inline-block h-2.5 w-5 rounded bg-amber-400" />
                                    IDPhotobook
                                </span>
                            </div>
                        </div>
                        <HourlyChart data={comparisonHourly ?? []} />
                    </section>

                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};

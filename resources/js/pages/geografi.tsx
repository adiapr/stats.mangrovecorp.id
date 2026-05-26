import { Head, router, usePage } from '@inertiajs/react';
import {
    Building2,
    Calendar,
    Globe,
    Map,
    MapPin,
    Medal,
    Package,
    TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import { dashboard, geografi } from '@/routes';

// ── Types ──────────────────────────────────────────────────────────────────

interface GeoProvince {
    province: string;
    orders: number;
    revenue: number;
    share: number;
}

interface GeoCity {
    province: string;
    city: string;
    orders: number;
    revenue: number;
    share: number;
}

interface GeoDistrict {
    province: string;
    city: string;
    district: string;
    orders: number;
    revenue: number;
    share: number;
}

interface GeoSection {
    provinces: GeoProvince[];
    cities: GeoCity[];
    districts: GeoDistrict[];
    totalOrders: number;
    totalRevenue: number;
}

interface PageProps {
    period: string;
    periodStart: string;
    periodEnd: string;
    mkl: GeoSection;
    idp: GeoSection;
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
    if (rank === 2) return 'text-slate-500';
    if (rank === 3) return 'text-orange-400';
    return 'text-slate-400';
}

function rankBg(rank: number) {
    if (rank === 1) return 'bg-amber-50 border-amber-200 text-amber-700';
    if (rank === 2) return 'bg-slate-50 border-slate-200 text-slate-600';
    if (rank === 3) return 'bg-orange-50 border-orange-200 text-orange-600';
    return 'bg-white border-slate-100 text-slate-500';
}

// ── Province Chart ─────────────────────────────────────────────────────────

function ProvinceChart({
    provinces,
    maxOrders,
    accent,
    barClass,
    textAccent,
}: {
    provinces: GeoProvince[];
    maxOrders: number;
    accent: string;
    barClass: string;
    textAccent: string;
}) {
    const [expanded, setExpanded] = useState(false);
    const visible = expanded ? provinces : provinces.slice(0, 12);

    return (
        <div className="space-y-2">
            {visible.map((p, i) => {
                const widthPct = maxOrders > 0 ? (p.orders / maxOrders) * 100 : 0;
                return (
                    <div
                        key={p.province}
                        className={`group relative overflow-hidden rounded-xl border p-3 transition-shadow hover:shadow-sm ${rankBg(i + 1)}`}
                    >
                        <div className="flex items-center justify-between gap-3">
                            {/* Rank + name */}
                            <div className="flex min-w-0 items-center gap-3">
                                <span
                                    className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                                        i < 3 ? rankBg(i + 1) : 'bg-slate-50 text-slate-400'
                                    }`}
                                >
                                    {i + 1}
                                </span>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-slate-800">{p.province}</p>
                                    <p className="text-xs text-slate-400">{formatRupiah(p.revenue)}</p>
                                </div>
                            </div>
                            {/* Orders + share */}
                            <div className="flex shrink-0 items-center gap-4 text-right">
                                <div>
                                    <p className={`text-sm font-bold ${textAccent}`}>
                                        {p.orders.toLocaleString('id-ID')}
                                    </p>
                                    <p className="text-[11px] text-slate-400">orders</p>
                                </div>
                                <div className="w-12 text-right">
                                    <p className="text-xs font-semibold text-slate-500">{p.share}%</p>
                                </div>
                            </div>
                        </div>
                        {/* Progress bar */}
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                                className={`h-full rounded-full transition-all ${barClass}`}
                                style={{ width: `${widthPct}%` }}
                            />
                        </div>
                    </div>
                );
            })}
            {provinces.length > 12 && (
                <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    className={`w-full rounded-xl border border-dashed py-2 text-xs font-semibold transition-colors ${accent}`}
                >
                    {expanded ? 'Sembunyikan' : `Tampilkan ${provinces.length - 12} provinsi lainnya`}
                </button>
            )}
        </div>
    );
}

// ── City Table ─────────────────────────────────────────────────────────────

function CityTable({
    cities,
    totalOrders,
    badgeClass,
    textAccent,
}: {
    cities: GeoCity[];
    totalOrders: number;
    badgeClass: string;
    textAccent: string;
}) {
    const [expanded, setExpanded] = useState(false);
    const visible = expanded ? cities : cities.slice(0, 10);

    return (
        <div>
            <div className="overflow-hidden rounded-xl border border-slate-100">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                            <th className="py-2.5 pl-4 pr-2 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                #
                            </th>
                            <th className="py-2.5 pr-2 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Kota / Kabupaten
                            </th>
                            <th className="hidden py-2.5 pr-2 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 sm:table-cell">
                                Provinsi
                            </th>
                            <th className="py-2.5 pr-2 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Orders
                            </th>
                            <th className="hidden py-2.5 pr-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400 md:table-cell">
                                Revenue
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {visible.map((c, i) => (
                            <tr key={`${c.province}-${c.city}`} className="group hover:bg-slate-50/60">
                                <td className="py-2.5 pl-4 pr-2">
                                    <span className={`text-xs font-bold ${rankColor(i + 1)}`}>{i + 1}</span>
                                </td>
                                <td className="py-2.5 pr-2">
                                    <p className="font-semibold text-slate-700">{c.city}</p>
                                    <p className="text-[11px] text-slate-400 sm:hidden">{c.province}</p>
                                </td>
                                <td className="hidden py-2.5 pr-2 sm:table-cell">
                                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${badgeClass}`}>
                                        {c.province}
                                    </span>
                                </td>
                                <td className="py-2.5 pr-2 text-right">
                                    <span className={`text-sm font-bold ${textAccent}`}>
                                        {c.orders.toLocaleString('id-ID')}
                                    </span>
                                    <p className="text-[11px] text-slate-400">{c.share}%</p>
                                </td>
                                <td className="hidden py-2.5 pr-4 text-right md:table-cell">
                                    <span className="text-sm font-semibold text-slate-600">{formatRupiah(c.revenue)}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {cities.length > 10 && (
                <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    className="mt-2 w-full rounded-xl border border-dashed border-slate-200 py-2 text-xs font-semibold text-slate-400 transition-colors hover:border-slate-300 hover:text-slate-600"
                >
                    {expanded ? 'Sembunyikan' : `Tampilkan ${cities.length - 10} kota lainnya`}
                </button>
            )}
        </div>
    );
}

// ── District List ──────────────────────────────────────────────────────────

function DistrictList({
    districts,
    badgeClass,
    textAccent,
}: {
    districts: GeoDistrict[];
    badgeClass: string;
    textAccent: string;
}) {
    return (
        <div className="grid gap-2 sm:grid-cols-2">
            {districts.map((d, i) => (
                <div
                    key={`${d.province}-${d.city}-${d.district}`}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 hover:border-slate-200"
                >
                    <div
                        className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            i < 3 ? rankBg(i + 1) : 'bg-slate-50 text-slate-400'
                        }`}
                    >
                        {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">{d.district}</p>
                        <p className="truncate text-[11px] text-slate-400">
                            {d.city} · {d.province}
                        </p>
                    </div>
                    <div className="shrink-0 text-right">
                        <p className={`text-sm font-bold ${textAccent}`}>{d.orders.toLocaleString('id-ID')}</p>
                        <p className="text-[11px] text-slate-400">{d.share}%</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ── GeoTab (per-service content) ───────────────────────────────────────────

function GeoTab({
    data,
    theme,
}: {
    data: GeoSection;
    theme: 'mkl' | 'idp';
}) {
    const isMkl = theme === 'mkl';

    const accentColor  = isMkl ? 'text-pink-600'  : 'text-amber-600';
    const accentBg     = isMkl ? 'bg-pink-600'    : 'bg-amber-500';
    const accentLight  = isMkl ? 'bg-pink-50'     : 'bg-amber-50';
    const accentBorder = isMkl ? 'border-pink-200' : 'border-amber-200';
    const barClass     = isMkl ? 'bg-pink-500'    : 'bg-amber-400';
    const badgeClass   = isMkl ? 'bg-pink-50 text-pink-700' : 'bg-amber-50 text-amber-700';
    const buttonAccent = isMkl
        ? 'border-pink-200 text-pink-500 hover:border-pink-400 hover:text-pink-700'
        : 'border-amber-200 text-amber-500 hover:border-amber-400 hover:text-amber-700';
    const iconBg       = isMkl ? 'bg-pink-100 text-pink-600' : 'bg-amber-100 text-amber-600';
    const gradientOverlay = isMkl
        ? 'bg-[radial-gradient(circle_at_top_right,_rgba(236,72,153,0.06),_transparent_60%)]'
        : 'bg-[radial-gradient(circle_at_top_right,_rgba(251,191,36,0.08),_transparent_60%)]';

    const maxProvOrders = data.provinces[0]?.orders ?? 1;
    const totalProvinces = data.provinces.length;
    const totalCities    = data.cities.length;
    const topProvince    = data.provinces[0]?.province ?? '-';
    const topCity        = data.cities[0]?.city ?? '-';

    return (
        <div className="space-y-8">
            {/* ── KPI Summary ─────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {/* Total Orders */}
                <div className={`relative overflow-hidden rounded-2xl border ${accentBorder} ${accentLight} p-5`}>
                    <div className={`absolute inset-0 ${gradientOverlay}`} />
                    <div className="relative">
                        <div className={`mb-3 inline-flex rounded-xl p-2.5 ${iconBg}`}>
                            <Package className="size-5" />
                        </div>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Total Orders</p>
                        <p className={`mt-1 text-3xl font-black ${accentColor}`}>
                            {data.totalOrders.toLocaleString('id-ID')}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">{formatRupiah(data.totalRevenue)} revenue</p>
                    </div>
                </div>

                {/* Provinsi Terjangkau */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5">
                    <div className="mb-3 inline-flex rounded-xl bg-teal-50 p-2.5 text-teal-600">
                        <Globe className="size-5" />
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Provinsi</p>
                    <p className="mt-1 text-3xl font-black text-slate-800">{totalProvinces}</p>
                    <p className="mt-1 text-xs text-slate-400">
                        dari 38 provinsi{' '}
                        <span className="font-semibold text-teal-600">
                            ({Math.round((totalProvinces / 38) * 100)}%)
                        </span>
                    </p>
                </div>

                {/* Kota Terjangkau */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5">
                    <div className="mb-3 inline-flex rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                        <Building2 className="size-5" />
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Kota / Kab</p>
                    <p className="mt-1 text-3xl font-black text-slate-800">{totalCities}</p>
                    <p className="mt-1 text-xs text-slate-400">kota terjangkau</p>
                </div>

                {/* Top Location */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5">
                    <div className="mb-3 inline-flex rounded-xl bg-amber-50 p-2.5 text-amber-600">
                        <Medal className="size-5" />
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Teratas</p>
                    <p className="mt-1 truncate text-lg font-black text-slate-800" title={topProvince}>
                        {topProvince}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-400" title={topCity}>
                        Kota: {topCity}
                    </p>
                </div>
            </div>

            {/* ── Top 3 Podium ─────────────────────────────────────── */}
            {data.provinces.length >= 3 && (
                <div className="rounded-2xl border border-slate-100 bg-white p-6">
                    <div className="mb-4 flex items-center gap-2">
                        <TrendingUp className={`size-4 ${accentColor}`} />
                        <h3 className="text-sm font-bold text-slate-700">Podium Provinsi</h3>
                    </div>
                    <div className="flex items-end justify-center gap-4">
                        {/* 2nd */}
                        <div className="flex flex-1 flex-col items-center gap-2">
                            <div className="text-center">
                                <p className="truncate text-xs font-semibold text-slate-600" title={data.provinces[1].province}>
                                    {data.provinces[1].province}
                                </p>
                                <p className={`text-lg font-black ${accentColor}`}>
                                    {data.provinces[1].orders.toLocaleString('id-ID')}
                                </p>
                                <p className="text-[11px] text-slate-400">{data.provinces[1].share}%</p>
                            </div>
                            <div className={`w-full rounded-t-xl ${accentBg} opacity-60`} style={{ height: '80px' }} />
                            <div className="flex size-9 items-center justify-center rounded-full bg-slate-100 text-lg font-black text-slate-500">
                                2
                            </div>
                        </div>
                        {/* 1st */}
                        <div className="flex flex-1 flex-col items-center gap-2">
                            <div className="text-center">
                                <p className="truncate text-xs font-semibold text-slate-700" title={data.provinces[0].province}>
                                    {data.provinces[0].province}
                                </p>
                                <p className={`text-2xl font-black ${accentColor}`}>
                                    {data.provinces[0].orders.toLocaleString('id-ID')}
                                </p>
                                <p className="text-[11px] text-slate-400">{data.provinces[0].share}%</p>
                            </div>
                            <div className={`w-full rounded-t-xl ${accentBg}`} style={{ height: '120px' }} />
                            <div className="flex size-10 items-center justify-center rounded-full bg-amber-100 text-xl font-black text-amber-600">
                                👑
                            </div>
                        </div>
                        {/* 3rd */}
                        <div className="flex flex-1 flex-col items-center gap-2">
                            <div className="text-center">
                                <p className="truncate text-xs font-semibold text-slate-600" title={data.provinces[2].province}>
                                    {data.provinces[2].province}
                                </p>
                                <p className={`text-lg font-black ${accentColor}`}>
                                    {data.provinces[2].orders.toLocaleString('id-ID')}
                                </p>
                                <p className="text-[11px] text-slate-400">{data.provinces[2].share}%</p>
                            </div>
                            <div className={`w-full rounded-t-xl ${accentBg} opacity-40`} style={{ height: '56px' }} />
                            <div className="flex size-8 items-center justify-center rounded-full bg-orange-50 text-base font-black text-orange-400">
                                3
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Province Ranking ─────────────────────────────────── */}
            <section className="rounded-2xl border border-slate-100 bg-white p-6">
                <div className="mb-5 flex items-center gap-2">
                    <Map className={`size-4 ${accentColor}`} />
                    <h3 className="text-sm font-bold text-slate-700">Sebaran per Provinsi</h3>
                    <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500">
                        {data.provinces.length} provinsi
                    </span>
                </div>
                {data.provinces.length === 0 ? (
                    <p className="py-8 text-center text-sm text-slate-400">Belum ada data untuk periode ini</p>
                ) : (
                    <ProvinceChart
                        provinces={data.provinces}
                        maxOrders={maxProvOrders}
                        accent={buttonAccent}
                        barClass={barClass}
                        textAccent={accentColor}
                    />
                )}
            </section>

            {/* ── City Ranking ─────────────────────────────────────── */}
            <section className="rounded-2xl border border-slate-100 bg-white p-6">
                <div className="mb-5 flex items-center gap-2">
                    <Building2 className={`size-4 ${accentColor}`} />
                    <h3 className="text-sm font-bold text-slate-700">Top Kota / Kabupaten</h3>
                    <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500">
                        {data.cities.length} kota
                    </span>
                </div>
                {data.cities.length === 0 ? (
                    <p className="py-8 text-center text-sm text-slate-400">Belum ada data untuk periode ini</p>
                ) : (
                    <CityTable
                        cities={data.cities}
                        totalOrders={data.totalOrders}
                        badgeClass={badgeClass}
                        textAccent={accentColor}
                    />
                )}
            </section>

            {/* ── District Ranking ─────────────────────────────────── */}
            {data.districts.length > 0 && (
                <section className="rounded-2xl border border-slate-100 bg-white p-6">
                    <div className="mb-5 flex items-center gap-2">
                        <MapPin className={`size-4 ${accentColor}`} />
                        <h3 className="text-sm font-bold text-slate-700">Kecamatan Teraktif</h3>
                        <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500">
                            Top {data.districts.length}
                        </span>
                    </div>
                    <DistrictList
                        districts={data.districts}
                        badgeClass={badgeClass}
                        textAccent={accentColor}
                    />
                </section>
            )}
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function Geografi() {
    const { period, periodStart, periodEnd, mkl, idp } = usePage().props as unknown as PageProps;

    const [activeTab, setActiveTab] = useState<'mkl' | 'idp'>('mkl');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [showCustom, setShowCustom] = useState(period === 'custom');

    function applyPeriod(p: string) {
        if (p === 'custom') {
            setShowCustom(true);
            return;
        }
        setShowCustom(false);
        router.get(geografi(), { period: p });
    }

    function applyCustom() {
        if (!customStart || !customEnd) return;
        router.get(geografi(), { period: 'custom', start: customStart, end: customEnd });
    }

    return (
        <>
            <Head title="Geografi — Analitik Wilayah" />

            <div className="relative min-h-[calc(100vh-4rem)] bg-transparent p-4 lg:p-8">
                {/* Teal/emerald accent gradient for geography */}
                <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.08),_transparent_60%)]" />

                <div className="relative z-10 flex flex-col gap-6">

                    {/* ── Header ────────────────────────────────────── */}
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-teal-600">
                                <MapPin className="size-3" />
                                Analitik Geografi
                            </div>
                            <h1 className="mt-2 text-2xl font-black text-slate-800 lg:text-3xl">
                                Sebaran Wilayah
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
                                                ? 'border-teal-500 bg-teal-500 text-white shadow-sm shadow-teal-100'
                                                : 'border-slate-200 bg-white text-slate-500 hover:border-teal-300 hover:text-teal-600'
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
                                            ? 'border-teal-500 bg-teal-500 text-white shadow-sm shadow-teal-100'
                                            : 'border-slate-200 bg-white text-slate-500 hover:border-teal-300 hover:text-teal-600'
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
                                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
                                    />
                                    <span className="text-xs text-slate-400">s/d</span>
                                    <input
                                        type="date"
                                        value={customEnd}
                                        onChange={(e) => setCustomEnd(e.target.value)}
                                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={applyCustom}
                                        className="rounded-lg bg-teal-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-600"
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
                                {mkl.totalOrders.toLocaleString('id-ID')}
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
                                {idp.totalOrders.toLocaleString('id-ID')}
                            </span>
                        </button>
                    </div>

                    {/* ── Tab Content ────────────────────────────────── */}
                    {activeTab === 'mkl' ? (
                        <GeoTab data={mkl} theme="mkl" />
                    ) : (
                        <GeoTab data={idp} theme="idp" />
                    )}

                </div>
            </div>
        </>
    );
}

Geografi.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Geografi', href: geografi() },
    ],
};

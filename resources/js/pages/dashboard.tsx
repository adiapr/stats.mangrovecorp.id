import { Head, usePage } from '@inertiajs/react';
import {
    ArrowUpRight,
    Calendar,
    CircleDollarSign,
    Clock3,
    HandCoins,
    PackageCheck,
    TrendingDown,
    TrendingUp,
    Users,
} from 'lucide-react';
import { dashboard } from '@/routes';

interface Auth {
    user: { name: string };
}

const stats = [
    {
        label: 'TOTAL CUSTOMER',
        value: '47,176',
        change: '+8.2%',
        note: 'Naik dibanding bulan lalu',
        icon: Users,
        bg: 'bg-pink-100',
        iconColor: 'text-pink-600',
    },
    {
        label: 'OMSET BULAN INI',
        value: 'Rp199.5M',
        change: '+12.4%',
        note: 'Target 92% tercapai',
        icon: HandCoins,
        bg: 'bg-yellow-100',
        iconColor: 'text-yellow-600',
    },
    {
        label: 'PESANAN BULAN INI',
        value: '913',
        change: '+4.9%',
        note: 'Rata-rata 31 order per hari',
        icon: Calendar,
        bg: 'bg-pink-100',
        iconColor: 'text-pink-600',
    },
    {
        label: 'GROWTH PESANAN',
        value: 'VS Last Month',
        badge: '-45.7%',
        badgeColor: 'bg-red-100 text-red-500',
        change: 'Perlu atensi',
        note: 'Konversi checkout melambat',
        icon: TrendingDown,
        bg: 'bg-yellow-100',
        iconColor: 'text-yellow-600',
    },
];

const insights = [
    {
        title: 'Conversion Rate',
        value: '68.4%',
        detail: 'Lead ke order naik 3.1% minggu ini',
        icon: TrendingUp,
        tone: 'bg-emerald-50 text-emerald-600',
    },
    {
        title: 'Average Order Value',
        value: 'Rp218k',
        detail: 'Stabil di segmen premium frame',
        icon: CircleDollarSign,
        tone: 'bg-amber-50 text-amber-600',
    },
    {
        title: 'On-time Fulfillment',
        value: '96.1%',
        detail: 'Mayoritas order terkirim kurang dari 24 jam',
        icon: PackageCheck,
        tone: 'bg-pink-50 text-pink-600',
    },
];

const agenda = [
    {
        title: 'Review performa campaign Shopee',
        time: '09:00',
    },
    {
        title: 'Sinkronisasi stok frame bestseller',
        time: '13:30',
    },
    {
        title: 'Validasi SLA pengiriman weekend',
        time: '16:00',
    },
];

const transactions = [
    {
        name: 'Santidelaaa',
        platform: 'SHOPEE',
        code: '#2026051203574952',
        time: '1 hari lalu',
        amount: 'Rp166k',
        status: 'KIRIM',
        statusColor: 'text-green-600',
        statusBg: 'bg-green-50',
    },
    {
        name: 'Niken Puspitasari',
        platform: '',
        code: '#MK250520260498',
        time: '29 menit lalu',
        amount: 'Rp150k',
        status: 'ORDER FOTO MENUNGGU',
        statusColor: 'text-pink-600',
        statusBg: 'bg-pink-50',
    },
    {
        name: 'Aan Rosiyanthi',
        platform: '',
        code: '#MK250520260497',
        time: '1 jam lalu',
        amount: 'Rp400k',
        status: 'ORDER FOTO MENUNGGU',
        statusColor: 'text-pink-600',
        statusBg: 'bg-pink-50',
    },
    {
        name: 'Safrianti Nainggo...',
        platform: '',
        code: '#MK250520260496',
        time: '1 jam lalu',
        amount: 'Rp270k',
        status: 'ORDER FOTO MENUNGGU',
        statusColor: 'text-pink-600',
        statusBg: 'bg-pink-50',
    },
    {
        name: 'Rina Oktaviani',
        platform: '',
        code: '#MK250520260495',
        time: '2 jam lalu',
        amount: 'Rp220k',
        status: 'KIRIM',
        statusColor: 'text-green-600',
        statusBg: 'bg-green-50',
    },
];

const chartData = [8.2, 13.5, 9.1, 11.8, 8.6, 10.2, 9.4, 12.7, 10.5, 11.2, 13.1, 12.4];
const chartMonths = ['Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei'];

function MiniLineChart() {
    const width = 560;
    const height = 180;
    const padX = 30;
    const padY = 20;
    const innerW = width - padX * 2;
    const innerH = height - padY * 2;
    const max = Math.max(...chartData);
    const min = Math.min(...chartData) - 1;

    const points = chartData.map((v, i) => {
        const x = padX + (i / (chartData.length - 1)) * innerW;
        const y = padY + innerH - ((v - min) / (max - min)) * innerH;
        return { x, y };
    });

    const pathD = points.map((point, i) => `${i === 0 ? 'M' : 'L'}${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ');
    const areaD = `${pathD} L${points[points.length - 1].x},${height} L${points[0].x},${height} Z`;

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
            <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ec4899" stopOpacity="0.24" />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity="0.02" />
                </linearGradient>
            </defs>

            {[0, 0.25, 0.5, 0.75, 1].map((t) => (
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

            <path d={areaD} fill="url(#areaGrad)" />
            <path d={pathD} fill="none" stroke="#ec4899" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />

            {points.map((point, i) => (
                <circle key={i} cx={point.x} cy={point.y} r="4" fill="white" stroke="#ec4899" strokeWidth="2" />
            ))}

            {points.map((point, i) => (
                <text key={i} x={point.x} y={height - 4} fill="#f472b6" fontSize="10" textAnchor="middle">
                    {chartMonths[i]}
                </text>
            ))}
        </svg>
    );
}

function getInitial(name: string) {
    return name.charAt(0).toUpperCase();
}

export default function Dashboard() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const userName = auth?.user?.name ?? '';
    const firstName = userName.split(' ')[0] || 'Admin';

    return (
        <>
            <Head title="Dashboard" />

            <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-transparent p-4 lg:p-8">
                <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,_rgba(244,114,182,0.12),_transparent_60%)]" />

                <div className="relative z-10 flex flex-col gap-6">
                    <section className="grid gap-6 xl:grid-cols-[1.55fr_0.95fr]">
                        <div className="relative overflow-hidden rounded-[2rem] border border-pink-100/70 bg-[linear-gradient(135deg,#fffefe_0%,#fff4f7_45%,#fff8ef_100%)] p-7 shadow-[0_24px_80px_-45px_rgba(190,24,93,0.45)]">
                            <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,_rgba(250,204,21,0.24),_transparent_55%)]" />

                            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                                <div className="max-w-2xl">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-pink-100 bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-pink-500">
                                        Daily Executive Overview
                                    </div>
                                    <h1 className="mt-4 text-3xl font-black tracking-tight text-[#4c0519] sm:text-4xl">
                                        Selamat datang, {firstName}. Fokus bisnis hari ini terlihat sehat dan terkendali.
                                    </h1>
                                    <p className="mt-3 max-w-xl text-sm leading-6 text-[#9d174d] sm:text-base">
                                        Omset, akuisisi customer, dan fulfillment bergerak positif. Ada sedikit tekanan di growth order yang perlu ditangani dari sisi conversion funnel.
                                    </p>
                                </div>

                                <div className="grid gap-3 rounded-[1.5rem] border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur sm:min-w-[280px]">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-pink-400">
                                                Monthly Revenue
                                            </p>
                                            <p className="mt-2 text-3xl font-black text-[#111827]">Rp199.5M</p>
                                        </div>
                                        <div className="rounded-2xl bg-pink-50 p-3 text-pink-600">
                                            <ArrowUpRight className="size-6" />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between rounded-2xl bg-pink-50/70 px-4 py-3">
                                        <span className="text-sm font-semibold text-[#831843]">Progress target</span>
                                        <span className="text-sm font-black text-pink-600">92%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
                            {insights.map((item) => (
                                <div
                                    key={item.title}
                                    className="rounded-[1.5rem] border border-pink-100/70 bg-white/90 p-5 shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-pink-400">
                                                {item.title}
                                            </p>
                                            <p className="mt-3 text-2xl font-black text-[#111827]">{item.value}</p>
                                        </div>
                                        <div className={`rounded-2xl p-3 ${item.tone}`}>
                                            <item.icon className="size-5" />
                                        </div>
                                    </div>
                                    <p className="mt-4 text-sm leading-6 text-[#9d174d]">{item.detail}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                        {stats.map((item) => (
                            <div
                                key={item.label}
                                className="group relative overflow-hidden rounded-[1.75rem] border border-pink-100/60 bg-white/95 p-6 shadow-[0_24px_60px_-50px_rgba(15,23,42,0.45)] transition-transform duration-200 hover:-translate-y-1"
                            >
                                <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-pink-50/70 blur-2xl" />

                                <div className="relative flex h-full flex-col justify-between gap-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${item.bg}`}>
                                            <item.icon className={`h-6 w-6 ${item.iconColor}`} />
                                        </div>

                                        {item.badge ? (
                                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${item.badgeColor}`}>
                                                {item.badge}
                                            </span>
                                        ) : (
                                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
                                                {item.change}
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-pink-400">
                                            {item.label}
                                        </p>
                                        <p className="mt-3 text-3xl font-black tracking-tight text-[#111827]">
                                            {item.value}
                                        </p>
                                        <p className="mt-2 text-sm text-[#9d174d]">{item.note}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </section>

                    <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_0.9fr]">
                        <div className="rounded-[2rem] border border-pink-100/70 bg-white/95 p-6 shadow-[0_24px_70px_-55px_rgba(15,23,42,0.4)]">
                            <div className="flex flex-col gap-4 border-b border-pink-100/70 pb-5 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-pink-400">
                                        Revenue Analytics
                                    </p>
                                    <h2 className="mt-2 text-2xl font-black text-[#4c0519]">
                                        Analisis penjualan bulanan
                                    </h2>
                                </div>

                                <div className="flex gap-2 rounded-full bg-pink-50 p-1">
                                    <button className="rounded-full bg-white px-5 py-2 text-xs font-bold text-[#6E1131] shadow-sm">
                                        Bulan Ini
                                    </button>
                                    <button className="rounded-full px-5 py-2 text-xs font-bold text-pink-300">
                                        Semester
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                                <div className="rounded-[1.5rem] bg-[linear-gradient(180deg,#fff7fa_0%,#ffffff_100%)] p-5">
                                    <div className="mb-5 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-[#831843]">Omset bersih</p>
                                            <p className="mt-1 text-3xl font-black text-[#111827]">Rp199.5M</p>
                                        </div>
                                        <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-600">
                                            +12.4%
                                        </div>
                                    </div>

                                    <div className="relative w-full">
                                        <div className="absolute bottom-6 left-0 top-0 flex flex-col justify-between text-[10px] font-bold text-gray-400">
                                            <span>14M</span>
                                            <span>12M</span>
                                            <span>10M</span>
                                            <span>8M</span>
                                            <span>6M</span>
                                            <span>4M</span>
                                        </div>
                                        <div className="pl-8 pt-2">
                                            <MiniLineChart />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-4">
                                    <div className="rounded-[1.5rem] border border-pink-100 bg-pink-50/60 p-5">
                                        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-pink-400">
                                            Best Channel
                                        </p>
                                        <p className="mt-3 text-xl font-black text-[#4c0519]">Shopee</p>
                                        <p className="mt-2 text-sm leading-6 text-[#9d174d]">
                                            Menyumbang 38% dari total order dengan peningkatan konversi paling baik minggu ini.
                                        </p>
                                    </div>

                                    <div className="rounded-[1.5rem] border border-pink-100 bg-white p-5">
                                        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-pink-400">
                                            Attention Needed
                                        </p>
                                        <p className="mt-3 text-xl font-black text-[#4c0519]">Growth Order</p>
                                        <p className="mt-2 text-sm leading-6 text-[#9d174d]">
                                            Retensi checkout menurun. Prioritaskan follow-up lead dan review funnel pembayaran sore ini.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-6">
                            <div className="rounded-[2rem] border border-pink-100/70 bg-white/95 p-6 shadow-[0_24px_70px_-55px_rgba(15,23,42,0.4)]">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-pink-400">
                                            Today Agenda
                                        </p>
                                        <h2 className="mt-2 text-xl font-black text-[#4c0519]">Prioritas hari ini</h2>
                                    </div>
                                    <div className="rounded-2xl bg-pink-50 p-3 text-pink-600">
                                        <Clock3 className="size-5" />
                                    </div>
                                </div>

                                <div className="mt-6 space-y-4">
                                    {agenda.map((item) => (
                                        <div
                                            key={item.title}
                                            className="flex items-start gap-4 rounded-[1.25rem] border border-pink-100/70 bg-pink-50/40 px-4 py-4"
                                        >
                                            <div className="rounded-xl bg-white px-3 py-2 text-sm font-black text-[#831843] shadow-sm">
                                                {item.time}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-bold text-[#111827]">{item.title}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-[2rem] border border-pink-100/70 bg-white/95 p-6 shadow-[0_24px_70px_-55px_rgba(15,23,42,0.4)]">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-pink-400">
                                            Status Ringkas
                                        </p>
                                        <h2 className="mt-2 text-xl font-black text-[#4c0519]">Operational health</h2>
                                    </div>
                                    <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-600">
                                        Good
                                    </div>
                                </div>

                                <div className="mt-6 space-y-4">
                                    <div className="flex items-center justify-between rounded-2xl bg-pink-50/60 px-4 py-3">
                                        <span className="text-sm font-semibold text-[#831843]">Fulfillment</span>
                                        <span className="text-sm font-black text-[#111827]">96.1%</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-2xl bg-pink-50/60 px-4 py-3">
                                        <span className="text-sm font-semibold text-[#831843]">Customer response</span>
                                        <span className="text-sm font-black text-[#111827]">14 min</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-2xl bg-pink-50/60 px-4 py-3">
                                        <span className="text-sm font-semibold text-[#831843]">Return rate</span>
                                        <span className="text-sm font-black text-[#111827]">1.8%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-[2rem] border border-pink-100/70 bg-white/95 p-6 shadow-[0_24px_70px_-55px_rgba(15,23,42,0.4)]">
                        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-pink-400">
                                    Transaction Feed
                                </p>
                                <h2 className="mt-2 text-2xl font-black text-[#4c0519]">Transaksi terbaru</h2>
                            </div>
                            <a
                                href="#"
                                className="inline-flex items-center gap-2 text-sm font-bold text-pink-500 transition-colors hover:text-pink-700"
                            >
                                Lihat semua
                                <ArrowUpRight className="size-4" />
                            </a>
                        </div>

                        <div className="grid gap-4">
                            {transactions.map((transaction, i) => (
                                <div
                                    key={i}
                                    className="grid gap-4 rounded-[1.5rem] border border-pink-100/70 bg-[linear-gradient(180deg,#fffefe_0%,#fff7fa_100%)] p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-100 font-bold text-[#6E1131]">
                                        {getInitial(transaction.name)}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="truncate text-sm font-black text-[#111827]">{transaction.name}</p>
                                            {transaction.platform && (
                                                <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-yellow-700">
                                                    {transaction.platform}
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-1 text-sm text-[#9d174d]">{transaction.code}</p>
                                        <p className="mt-1 text-xs font-semibold text-pink-300">{transaction.time}</p>
                                    </div>
                                    <div className="flex flex-col items-start gap-2 sm:items-end">
                                        <span className="text-base font-black text-[#111827]">{transaction.amount}</span>
                                        <span
                                            className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${transaction.statusBg} ${transaction.statusColor}`}
                                        >
                                            {transaction.status}
                                        </span>
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

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};

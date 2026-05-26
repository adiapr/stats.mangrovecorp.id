<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <title>@yield('title', config('app.name', 'Laravel'))</title>

    <link rel="icon" href="{{ asset('img/5cfb4353a02182a1292f91d7e7f6507c.webp') }}" type="image/webp">
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#ec4899">
    <link rel="apple-touch-icon" href="{{ asset('favicon.png') }}">

    {{-- Fonts --}}
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet">

    @vite(['resources/css/app.css'])

    <style>
        body {
            font-family: 'Instrument Sans', sans-serif;
        }

        /* Mobile safe area for bottom navigation on iOS */
        .pb-safe {
            padding-bottom: env(safe-area-inset-bottom);
        }

        /* Ocean Sidebar */
        #ocean-sidebar {
            background: linear-gradient(180deg, #fff0f6 0%, #ffe4f0 30%, #ffd6e8 65%, #ffbad6 100%);
            position: relative;
            overflow: hidden;
        }
        #ocean-sidebar::before {
            content: '';
            position: absolute;
            inset: 0;
            background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600'%3E%3Cellipse cx='60' cy='200' rx='120' ry='80' fill='rgba(236,72,153,0.05)'/%3E%3Cellipse cx='280' cy='400' rx='100' ry='60' fill='rgba(236,72,153,0.06)'/%3E%3C/svg%3E") no-repeat center;
            pointer-events: none;
        }
        /* Bubble particles */
        .bubble {
            position: absolute;
            border-radius: 50%;
            background: rgba(236,72,153,0.18);
            animation: rise linear infinite;
            pointer-events: none;
        }
        @keyframes rise {
            0%   { transform: translateY(100vh) scale(0.5); opacity: 0; }
            10%  { opacity: 1; }
            90%  { opacity: 0.6; }
            100% { transform: translateY(-60px) scale(1); opacity: 0; }
        }
        /* Fish */
        .fish {
            position: absolute;
            pointer-events: none;
            animation: swim linear infinite;
        }
        .fish.left { animation-name: swimRight; }
        .fish.right { animation-name: swimLeft; transform: scaleX(-1); }
        @keyframes swimRight {
            0%   { transform: translateX(-80px); }
            100% { transform: translateX(320px); }
        }
        @keyframes swimLeft {
            0%   { transform: scaleX(-1) translateX(-80px); }
            100% { transform: scaleX(-1) translateX(320px); }
        }
        /* Seaweed */
        .seaweed {
            position: absolute;
            bottom: 56px;
            transform-origin: bottom center;
            animation: sway ease-in-out infinite alternate;
            pointer-events: none;
        }
        @keyframes sway {
            0%   { transform: rotate(-12deg) scaleY(1); }
            100% { transform: rotate(12deg) scaleY(1.05); }
        }
        /* Shell row */
        .shell-row {
            position: absolute;
            bottom: 56px;
            left: 0;
            width: 100%;
            display: flex;
            align-items: flex-end;
            gap: 4px;
            padding: 0 8px;
            pointer-events: none;
            z-index: 2;
        }
        /* Sidebar text colors override */
        #ocean-sidebar .sidebar-label { color: #be185d; }
        #ocean-sidebar .sidebar-section { color: rgba(190,24,93,0.55); }
        #ocean-sidebar .nav-link {
            color: #9d174d;
            transition: background 0.2s, color 0.2s;
        }
        #ocean-sidebar .nav-link:hover {
            background: rgba(236,72,153,0.1);
            color: #be185d;
        }
        #ocean-sidebar .nav-link.active {
            background: rgba(236,72,153,0.15);
            color: #9d174d;
            font-weight: 700;
        }
        #ocean-sidebar .user-footer {
            background: rgba(255,182,220,0.3);
            border-top: 1px solid rgba(236,72,153,0.15);
        }
    </style>
</head>

<body class="font-sans antialiased text-pink-900 bg-[#fff5f7]">
    <div class="flex h-screen overflow-hidden relative">

        {{-- Mobile Sidebar Overlay --}}
        <div id="mobile-sidebar-overlay"
            class="fixed inset-0 bg-pink-950/20 backdrop-blur-sm z-40 hidden md:hidden transition-opacity duration-300 opacity-0"
            onclick="toggleMobileSidebar()"></div>

        {{-- Sidebar (Desktop & Mobile Off-canvas) --}}
        <aside id="mobile-sidebar"
            class="fixed inset-y-0 left-0 w-64 flex flex-col shrink-0 z-50 transform -translate-x-full md:relative md:translate-x-0 transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none ocean-sidebar-wrapper">
        <div id="ocean-sidebar" class="flex flex-col h-full w-full">
            {{-- Bubbles (more) --}}
            <span class="bubble" style="width:6px;height:6px;left:18%;animation-duration:8s;animation-delay:0s"></span>
            <span class="bubble" style="width:4px;height:4px;left:40%;animation-duration:11s;animation-delay:2s"></span>
            <span class="bubble" style="width:8px;height:8px;left:65%;animation-duration:9s;animation-delay:4s"></span>
            <span class="bubble" style="width:5px;height:5px;left:80%;animation-duration:13s;animation-delay:1s"></span>
            <span class="bubble" style="width:3px;height:3px;left:30%;animation-duration:10s;animation-delay:6s"></span>
            <span class="bubble" style="width:5px;height:5px;left:55%;animation-duration:7s;animation-delay:3s"></span>
            <span class="bubble" style="width:4px;height:4px;left:10%;animation-duration:12s;animation-delay:8s"></span>
            <span class="bubble" style="width:6px;height:6px;left:72%;animation-duration:15s;animation-delay:5s"></span>
            <span class="bubble" style="width:3px;height:3px;left:88%;animation-duration:9s;animation-delay:0.5s"></span>
            <span class="bubble" style="width:7px;height:7px;left:48%;animation-duration:16s;animation-delay:11s"></span>
            {{-- Fish 1 --}}
            <svg class="fish left" style="top:10%;width:28px;animation-duration:14s;animation-delay:0s;opacity:0.6" viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M30 10 Q40 0 40 10 Q40 20 30 10Z" fill="#f9a8d4"/><ellipse cx="18" cy="10" rx="18" ry="7" fill="#ec4899"/><circle cx="6" cy="8" r="2" fill="white"/><circle cx="6" cy="8" r="1" fill="#831843"/></svg>
            {{-- Fish 2 --}}
            <svg class="fish right" style="top:30%;width:20px;animation-duration:18s;animation-delay:5s;opacity:0.5" viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M30 10 Q40 0 40 10 Q40 20 30 10Z" fill="#fde68a"/><ellipse cx="18" cy="10" rx="18" ry="7" fill="#fbbf24"/><circle cx="6" cy="8" r="2" fill="white"/><circle cx="6" cy="8" r="1" fill="#78350f"/></svg>
            {{-- Fish 3 --}}
            <svg class="fish left" style="top:48%;width:16px;animation-duration:22s;animation-delay:9s;opacity:0.45" viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M30 10 Q40 0 40 10 Q40 20 30 10Z" fill="#fbcfe8"/><ellipse cx="18" cy="10" rx="18" ry="7" fill="#f472b6"/><circle cx="6" cy="8" r="2" fill="white"/><circle cx="6" cy="8" r="1" fill="#9d174d"/></svg>
            {{-- Fish 4 --}}
            <svg class="fish right" style="top:62%;width:24px;animation-duration:17s;animation-delay:2s;opacity:0.55" viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M30 10 Q40 0 40 10 Q40 20 30 10Z" fill="#fca5a5"/><ellipse cx="18" cy="10" rx="18" ry="7" fill="#f87171"/><circle cx="6" cy="8" r="2" fill="white"/><circle cx="6" cy="8" r="1" fill="#7f1d1d"/></svg>
            {{-- Fish 5 --}}
            <svg class="fish left" style="top:78%;width:18px;animation-duration:20s;animation-delay:7s;opacity:0.4" viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M30 10 Q40 0 40 10 Q40 20 30 10Z" fill="#d8b4fe"/><ellipse cx="18" cy="10" rx="18" ry="7" fill="#c084fc"/><circle cx="6" cy="8" r="2" fill="white"/><circle cx="6" cy="8" r="1" fill="#4c1d95"/></svg>
            {{-- Fish 6 small (near bottom) --}}
            <svg class="fish right" style="top:88%;width:13px;animation-duration:25s;animation-delay:13s;opacity:0.35" viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M30 10 Q40 0 40 10 Q40 20 30 10Z" fill="#fbcfe8"/><ellipse cx="18" cy="10" rx="18" ry="7" fill="#ec4899"/><circle cx="6" cy="8" r="2" fill="white"/><circle cx="6" cy="8" r="1" fill="#831843"/></svg>
            {{-- Shark --}}
            <svg class="fish left" style="top:17%;width:48px;animation-duration:11s;animation-delay:3s;opacity:0.55" viewBox="0 0 60 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                {{-- Body --}}
                <ellipse cx="28" cy="18" rx="26" ry="9" fill="#cbd5e1"/>
                {{-- Tail --}}
                <path d="M54 18 Q64 8 64 18 Q64 28 54 18Z" fill="#94a3b8"/>
                {{-- Dorsal fin --}}
                <path d="M30 9 L38 0 L44 9Z" fill="#94a3b8"/>
                {{-- Belly --}}
                <ellipse cx="26" cy="20" rx="18" ry="5" fill="#f1f5f9"/>
                {{-- Eye --}}
                <circle cx="8" cy="16" r="2" fill="white"/><circle cx="8" cy="16" r="1" fill="#1e293b"/>
                {{-- Mouth --}}
                <path d="M4 20 Q10 24 16 20" stroke="#64748b" stroke-width="1.5" fill="none"/>
            </svg>
            {{-- Turtle --}}
            <svg class="fish right" style="top:42%;width:38px;animation-duration:28s;animation-delay:6s;opacity:0.6" viewBox="0 0 50 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                {{-- Shell --}}
                <ellipse cx="25" cy="20" rx="18" ry="13" fill="#86efac"/>
                {{-- Shell pattern --}}
                <ellipse cx="25" cy="20" rx="11" ry="8" fill="#4ade80"/>
                <path d="M25 12 L25 28" stroke="#16a34a" stroke-width="1" fill="none"/>
                <path d="M14 17 L36 17" stroke="#16a34a" stroke-width="1" fill="none"/>
                <path d="M16 13 L34 27" stroke="#16a34a" stroke-width="0.7" fill="none"/>
                <path d="M34 13 L16 27" stroke="#16a34a" stroke-width="0.7" fill="none"/>
                {{-- Head --}}
                <ellipse cx="8" cy="20" rx="6" ry="5" fill="#86efac"/>
                <circle cx="6" cy="18" r="1.5" fill="white"/><circle cx="6" cy="18" r="0.8" fill="#1e293b"/>
                {{-- Flippers --}}
                <ellipse cx="22" cy="8" rx="5" ry="3" fill="#86efac" transform="rotate(-30 22 8)"/>
                <ellipse cx="28" cy="8" rx="5" ry="3" fill="#86efac" transform="rotate(30 28 8)"/>
                <ellipse cx="20" cy="32" rx="5" ry="3" fill="#86efac" transform="rotate(20 20 32)"/>
                <ellipse cx="30" cy="32" rx="5" ry="3" fill="#86efac" transform="rotate(-20 30 32)"/>
            </svg>
            {{-- Crocodile --}}
            <svg class="fish left" style="top:68%;width:64px;animation-duration:32s;animation-delay:10s;opacity:0.5" viewBox="0 0 80 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                {{-- Body --}}
                <rect x="12" y="10" width="52" height="12" rx="6" fill="#86efac"/>
                {{-- Tail --}}
                <path d="M64 16 Q80 8 80 16 Q80 24 64 16Z" fill="#4ade80"/>
                {{-- Head --}}
                <rect x="0" y="12" width="18" height="8" rx="3" fill="#4ade80"/>
                {{-- Snout / Teeth --}}
                <rect x="0" y="12" width="12" height="4" rx="2" fill="#4ade80"/>
                <path d="M2 16 L4 20 M6 16 L8 20 M10 16 L12 20" stroke="white" stroke-width="1.2"/>
                {{-- Scales bumps --}}
                <path d="M20 10 L23 6 L26 10 M30 10 L33 6 L36 10 M40 10 L43 6 L46 10 M50 10 L53 6 L56 10" stroke="#16a34a" stroke-width="1.5" fill="none"/>
                {{-- Eye --}}
                <circle cx="14" cy="13" r="2" fill="white"/><circle cx="14" cy="13" r="1" fill="#1e293b"/>
                {{-- Legs --}}
                <rect x="22" y="22" width="5" height="6" rx="2" fill="#4ade80"/>
                <rect x="38" y="22" width="5" height="6" rx="2" fill="#4ade80"/>
                <rect x="52" y="22" width="5" height="6" rx="2" fill="#4ade80"/>
            </svg>
            {{-- Seaweed --}}
            <svg class="seaweed" style="left:10%;animation-duration:3s;animation-delay:0s" width="14" height="52" viewBox="0 0 14 52" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 52 C7 40 14 36 14 28 C14 20 7 16 7 8 C7 0 7 0 7 0" stroke="#f9a8d4" stroke-width="3" stroke-linecap="round"/><path d="M7 40 C3 34 0 28 4 24" stroke="#fbcfe8" stroke-width="2" stroke-linecap="round"/><path d="M7 24 C11 18 14 12 10 8" stroke="#fbcfe8" stroke-width="2" stroke-linecap="round"/></svg>
            <svg class="seaweed" style="left:28%;animation-duration:4s;animation-delay:0.5s" width="12" height="44" viewBox="0 0 14 52" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 52 C7 40 14 36 14 28 C14 20 7 16 7 8 C7 0 7 0 7 0" stroke="#f472b6" stroke-width="3" stroke-linecap="round"/><path d="M7 40 C3 34 0 28 4 24" stroke="#fda4af" stroke-width="2" stroke-linecap="round"/></svg>
            <svg class="seaweed" style="left:55%;animation-duration:3.5s;animation-delay:1s" width="14" height="60" viewBox="0 0 14 52" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 52 C7 40 14 36 14 28 C14 20 7 16 7 8 C7 0 7 0 7 0" stroke="#ec4899" stroke-width="3" stroke-linecap="round"/><path d="M7 40 C3 34 0 28 4 24" stroke="#fbcfe8" stroke-width="2" stroke-linecap="round"/><path d="M7 24 C11 18 14 12 10 8" stroke="#fbcfe8" stroke-width="2" stroke-linecap="round"/></svg>
            <svg class="seaweed" style="left:75%;animation-duration:2.8s;animation-delay:1.8s" width="10" height="38" viewBox="0 0 14 52" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 52 C7 40 14 36 14 28 C14 20 7 16 7 8 C7 0 7 0 7 0" stroke="#f9a8d4" stroke-width="3" stroke-linecap="round"/></svg>
            <svg class="seaweed" style="left:88%;animation-duration:4.2s;animation-delay:0.3s" width="11" height="46" viewBox="0 0 14 52" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 52 C7 40 14 36 14 28 C14 20 7 16 7 8 C7 0 7 0 7 0" stroke="#f472b6" stroke-width="3" stroke-linecap="round"/><path d="M7 30 C3 24 0 18 4 14" stroke="#fbcfe8" stroke-width="2" stroke-linecap="round"/></svg>
            {{-- Shell row --}}
            <div class="shell-row">
                {{-- Shell 1 --}}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="opacity:0.7"><path d="M12 22C7 22 2 17.5 2 12C2 7 6 3 12 3C18 3 22 7 22 12C22 17.5 17 22 12 22Z" fill="#fbcfe8" stroke="#f9a8d4" stroke-width="1"/><path d="M12 3 Q8 8 6 12 Q8 18 12 22" stroke="#f472b6" stroke-width="1" fill="none"/><path d="M12 3 Q16 8 18 12 Q16 18 12 22" stroke="#f472b6" stroke-width="1" fill="none"/><path d="M2 12 Q7 10 12 11 Q17 10 22 12" stroke="#f472b6" stroke-width="1" fill="none"/></svg>
                {{-- Shell 2 --}}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="opacity:0.65"><path d="M12 22C7 22 2 17.5 2 12C2 7 6 3 12 3C18 3 22 7 22 12C22 17.5 17 22 12 22Z" fill="#fde68a" stroke="#fbbf24" stroke-width="1"/><path d="M12 3 Q8 8 6 12 Q8 18 12 22" stroke="#f59e0b" stroke-width="1" fill="none"/><path d="M12 3 Q16 8 18 12 Q16 18 12 22" stroke="#f59e0b" stroke-width="1" fill="none"/><path d="M2 12 Q7 10 12 11 Q17 10 22 12" stroke="#f59e0b" stroke-width="1" fill="none"/></svg>
                {{-- Shell 3 --}}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="opacity:0.8"><path d="M12 22C7 22 2 17.5 2 12C2 7 6 3 12 3C18 3 22 7 22 12C22 17.5 17 22 12 22Z" fill="#f9a8d4" stroke="#ec4899" stroke-width="1"/><path d="M12 3 Q8 8 6 12 Q8 18 12 22" stroke="#be185d" stroke-width="1" fill="none"/><path d="M12 3 Q16 8 18 12 Q16 18 12 22" stroke="#be185d" stroke-width="1" fill="none"/><path d="M2 12 Q7 10 12 11 Q17 10 22 12" stroke="#be185d" stroke-width="1" fill="none"/></svg>
                {{-- Shell 4 --}}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="opacity:0.6"><path d="M12 22C7 22 2 17.5 2 12C2 7 6 3 12 3C18 3 22 7 22 12C22 17.5 17 22 12 22Z" fill="#fca5a5" stroke="#f87171" stroke-width="1"/><path d="M12 3 Q8 8 6 12 Q8 18 12 22" stroke="#ef4444" stroke-width="1" fill="none"/><path d="M12 3 Q16 8 18 12 Q16 18 12 22" stroke="#ef4444" stroke-width="1" fill="none"/></svg>
                {{-- Shell 5 --}}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="opacity:0.75"><path d="M12 22C7 22 2 17.5 2 12C2 7 6 3 12 3C18 3 22 7 22 12C22 17.5 17 22 12 22Z" fill="#fbcfe8" stroke="#f9a8d4" stroke-width="1"/><path d="M12 3 Q8 8 6 12 Q8 18 12 22" stroke="#f472b6" stroke-width="1" fill="none"/><path d="M12 3 Q16 8 18 12 Q16 18 12 22" stroke="#f472b6" stroke-width="1" fill="none"/><path d="M2 12 Q7 10 12 11 Q17 10 22 12" stroke="#f472b6" stroke-width="1" fill="none"/></svg>
                {{-- Shell 6 --}}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="opacity:0.6"><path d="M12 22C7 22 2 17.5 2 12C2 7 6 3 12 3C18 3 22 7 22 12C22 17.5 17 22 12 22Z" fill="#d8b4fe" stroke="#c084fc" stroke-width="1"/><path d="M12 3 Q8 8 6 12 Q8 18 12 22" stroke="#a855f7" stroke-width="1" fill="none"/><path d="M12 3 Q16 8 18 12 Q16 18 12 22" stroke="#a855f7" stroke-width="1" fill="none"/></svg>
                {{-- Shell 7 --}}
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="opacity:0.7"><path d="M12 22C7 22 2 17.5 2 12C2 7 6 3 12 3C18 3 22 7 22 12C22 17.5 17 22 12 22Z" fill="#fde68a" stroke="#fbbf24" stroke-width="1"/><path d="M12 3 Q8 8 6 12 Q8 18 12 22" stroke="#f59e0b" stroke-width="1" fill="none"/><path d="M12 3 Q16 8 18 12 Q16 18 12 22" stroke="#f59e0b" stroke-width="1" fill="none"/><path d="M2 12 Q7 10 12 11 Q17 10 22 12" stroke="#f59e0b" stroke-width="1" fill="none"/></svg>
                {{-- Shell 8 small --}}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="opacity:0.55"><path d="M12 22C7 22 2 17.5 2 12C2 7 6 3 12 3C18 3 22 7 22 12C22 17.5 17 22 12 22Z" fill="#f9a8d4" stroke="#ec4899" stroke-width="1"/><path d="M12 3 Q8 8 6 12 Q8 18 12 22" stroke="#be185d" stroke-width="1" fill="none"/><path d="M12 3 Q16 8 18 12 Q16 18 12 22" stroke="#be185d" stroke-width="1" fill="none"/></svg>
            </div>
            <div class="p-6 flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div
                        class="size-10 rounded-lg flex items-center justify-center text-white shadow-lg shadow-pink-200">
                        {{-- <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg> --}}
                        <img src={{ asset('img/5cfb4353a02182a1292f91d7e7f6507c.webp') }} alt="">
                    </div>
                    <span class="font-bold text-xl tracking-tight text-pink-950">Makenliving</span>
                </div>
                {{-- Close Button for Mobile --}}
                <button onclick="toggleMobileSidebar()" class="md:hidden text-pink-300 hover:text-pink-600 p-2">
                    <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <nav class="flex-1 px-4 space-y-1 py-4 overflow-y-auto relative z-10">
                <p class="px-4 text-[10px] font-bold uppercase tracking-widest sidebar-section mb-2">Main Menu</p>
                <a href="{{ route('admin.dashboard') }}"
                    class="flex items-center gap-3 px-4 py-3 {{ request()->routeIs('admin.dashboard') ? 'bg-pink-50 text-pink-700 font-bold' : 'text-pink-500 hover:bg-pink-50/50 hover:text-pink-700 font-medium' }} rounded-lg transition-all border {{ request()->routeIs('admin.dashboard') ? 'border-pink-100/50' : 'border-transparent' }}">
                    <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v12a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                    </svg>
                    Dashboard
                </a>

                {{-- Input Order --}}
                <a href="{{ route('admin.order.create') }}"
                    class="flex items-center gap-3 px-4 py-3 {{ request()->routeIs('admin.order.create') ? 'bg-pink-600 text-white font-bold shadow-md shadow-pink-200' : 'text-pink-500 hover:bg-pink-50/50 hover:text-pink-700 font-medium' }} rounded-lg transition-all">
                    <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Input Order
                </a>

                {{-- Orders --}}
                <a href="{{ route('admin.order.index') }}"
                    class="flex items-center gap-3 px-4 py-3 {{ request()->routeIs('admin.order.index') || request()->routeIs('admin.order.show') ? 'bg-pink-100 text-pink-700 font-bold' : 'text-pink-500 hover:bg-pink-50/50 hover:text-pink-700 font-medium' }} rounded-lg transition-all group">
                    <svg class="size-5 opacity-60 group-hover:opacity-100" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Orders
                </a>

                {{-- Katalog Menu --}}
                <div class="space-y-1">
                    <button type="button" onclick="toggleSubmenu('submenu-katalog')"
                        class="w-full flex items-center justify-between gap-3 px-4 py-3 text-pink-500 hover:bg-pink-50/50 hover:text-pink-700 rounded-lg font-medium transition-all group">
                        <div class="flex items-center gap-3">
                            <svg class="size-5 opacity-60 group-hover:opacity-100" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            Katalog
                        </div>
                        <svg id="arrow-katalog"
                            class="size-4 transition-transform duration-200 {{ request()->routeIs('admin.product.*') || request()->routeIs('admin.frame.*') ? 'rotate-180' : '' }}"
                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div id="submenu-katalog"
                        class="{{ request()->routeIs('admin.product.*') || request()->routeIs('admin.frame.*') ? '' : 'hidden' }} px-4 space-y-1 ml-4 border-l border-pink-100">
                        <a href="{{ route('admin.product.index') }}"
                            class="flex items-center gap-3 px-4 py-2 {{ request()->routeIs('admin.product.*') ? 'text-pink-700 font-bold' : 'text-pink-400 hover:text-pink-600 font-medium' }} text-sm transition-all">
                            Produk
                        </a>
                        <a href="{{ route('admin.frame.index') }}"
                            class="flex items-center gap-3 px-4 py-2 {{ request()->routeIs('admin.frame.*') ? 'text-pink-700 font-bold' : 'text-pink-400 hover:text-pink-600 font-medium' }} text-sm transition-all">
                            Frame
                        </a>
                    </div>
                </div>


                {{-- Laporan Menu --}}
                <div class="space-y-1">
                    <button type="button" onclick="toggleSubmenu('submenu-laporan')"
                        class="w-full flex items-center justify-between gap-3 px-4 py-3 {{ request()->routeIs('admin.laporan.*') ? 'bg-pink-50 text-pink-700 font-bold' : 'text-pink-500 hover:bg-pink-50/50 hover:text-pink-700 font-medium' }} rounded-lg transition-all group">
                        <div class="flex items-center gap-3">
                            <svg class="size-5 opacity-60 group-hover:opacity-100" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Laporan
                        </div>
                        <svg id="arrow-laporan"
                            class="size-4 transition-transform duration-200 {{ request()->routeIs('admin.laporan.*') ? 'rotate-180' : '' }}"
                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div id="submenu-laporan"
                        class="{{ request()->routeIs('admin.laporan.*') ? '' : 'hidden' }} px-4 space-y-1 ml-4 border-l border-pink-100">
                        <a href="{{ route('admin.laporan.order-report') }}"
                            class="flex items-center gap-2 px-4 py-2 {{ request()->routeIs('admin.laporan.order-report') ? 'text-pink-700 font-bold' : 'text-pink-400 hover:text-pink-600 font-medium' }} text-sm transition-all">
                            <span
                                class="size-1.5 rounded-full {{ request()->routeIs('admin.laporan.order-report') ? 'bg-pink-600' : 'bg-pink-200' }}"></span>
                            Order Report
                        </a>
                        <a href="{{ route('admin.laporan.resi-report') }}"
                            class="flex items-center gap-2 px-4 py-2 {{ request()->routeIs('admin.laporan.resi-report') ? 'text-pink-700 font-bold' : 'text-pink-400 hover:text-pink-600 font-medium' }} text-sm transition-all">
                            <span
                                class="size-1.5 rounded-full {{ request()->routeIs('admin.laporan.resi-report') ? 'bg-pink-600' : 'bg-pink-200' }}"></span>
                            Resi Report
                        </a>
                        <a href="{{ route('admin.laporan.leads-report') }}"
                            class="flex items-center gap-2 px-4 py-2 {{ request()->routeIs('admin.laporan.leads-report') ? 'text-pink-700 font-bold' : 'text-pink-400 hover:text-pink-600 font-medium' }} text-sm transition-all">
                            <span
                                class="size-1.5 rounded-full {{ request()->routeIs('admin.laporan.leads-report') ? 'bg-pink-600' : 'bg-pink-200' }}"></span>
                            Leads Report
                        </a>
                    </div>
                </div>

                {{-- Pengguna --}}
                <a href="{{ route('admin.pengguna.index') }}"
                    class="flex items-center gap-3 px-4 py-3 {{ request()->routeIs('admin.pengguna.*') ? 'bg-pink-50 text-pink-700 font-bold' : 'text-pink-500 hover:bg-pink-50/50 hover:text-pink-700 font-medium' }} rounded-lg transition-all group">
                    <svg class="size-5 opacity-60 group-hover:opacity-100" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Pengguna
                </a>
                {{-- Web Order --}}
                <a href="{{ route('admin.web-order.index') }}"
                    class="flex items-center gap-3 px-4 py-3 {{ request()->routeIs('admin.web-order.*') ? 'bg-pink-50 text-pink-700 font-bold' : 'text-pink-500 hover:bg-pink-50/50 hover:text-pink-700 font-medium' }} rounded-lg transition-all group">
                    <svg class="size-5 opacity-60 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Web Order
                </a>

                {{-- Visitor Tracking --}}
                <a href="{{ route('admin.visitor-tracking.index') }}"
                    class="flex items-center gap-3 px-4 py-3 {{ request()->routeIs('admin.visitor-tracking.*') ? 'bg-pink-50 text-pink-700 font-bold' : 'text-pink-500 hover:bg-pink-50/50 hover:text-pink-700 font-medium' }} rounded-lg transition-all group">
                    <svg class="size-5 opacity-60 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Visitor Tracking
                </a>

                {{-- Pengaturan --}}
                <a href="{{ route('profile.edit') }}"
                    class="flex items-center gap-3 px-4 py-3 text-pink-500 hover:bg-pink-50/50 hover:text-pink-700 rounded-lg font-medium transition-all group">
                    <svg class="size-5 opacity-60 group-hover:opacity-100" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Pengaturan
                </a>
            </nav>

            <div class="user-footer p-4 relative z-10">
                <div class="flex items-center gap-3">
                    <div
                        class="size-10 rounded-lg bg-pink-100 border-2 border-pink-200 shadow-sm flex items-center justify-center font-bold text-pink-600">
                        {{ substr(auth()->user()->first_name, 0, 1) }}
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-bold text-pink-900 truncate">{{ auth()->user()->first_name }}</p>
                        <p class="text-[10px] font-medium text-pink-400 truncate uppercase tracking-wider">
                            Administrator
                        </p>
                    </div>
                </div>
            </div>
        </div>
        </aside>

        {{-- Content Area --}}
        <div class="flex-1 flex flex-col overflow-hidden relative">
            {{-- Desktop Header --}}
            <header
                class="hidden md:flex h-16 bg-white border-b border-pink-100 items-center justify-between px-8 shrink-0">
                <div class="flex items-center gap-4">
                    <h2 class="text-pink-950 font-bold text-lg">@yield('breadcrumb', 'Dashboard')</h2>
                </div>

                <div class="flex items-center gap-6">
                    <div class="relative hidden sm:block">
                        <input type="text" placeholder="Cari data..."
                            class="pl-10 pr-4 py-2 bg-pink-50/50 border border-pink-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all w-64 text-pink-900 placeholder-pink-300">
                        <svg class="size-4 absolute left-3 top-3 text-pink-300" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    <div class="flex items-center gap-3 border-l border-pink-100 pl-6">
                        <form method="POST" action="{{ route('logout') }}">
                            @csrf
                            <button type="submit"
                                class="flex items-center gap-2 px-4 py-2 text-sm font-bold text-pink-600 hover:bg-pink-50 rounded-lg transition-all">
                                <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Keluar
                            </button>
                        </form>
                    </div>
                </div>
            </header>

            {{-- Mobile Header --}}
            <header
                class="md:hidden bg-white border-b border-pink-100 flex items-center justify-between py-2 px-5 shrink-0 shadow-sm relative z-20">
                {{-- Logo & Title (Left) --}}
                <div class="flex items-center py-3   gap-2.5">
                    <div
                        class="size-7 rounded-[10px] flex items-center justify-center text-white shadow-sm shadow-pink-200 shrink-0">
                        <img src={{ asset('img/5cfb4353a02182a1292f91d7e7f6507c.webp') }} alt="">
                    </div>
                    <div class="flex flex-col justify-center">
                        <span class="font-black text-base tracking-tight text-pink-950 leading-none">Makenliving</span>
                        <h2 class="text-pink-500 font-bold text-[8px] tracking-[0.15em] uppercase mt-0.5">
                            @yield('breadcrumb', 'Dashboard')</h2>
                    </div>
                </div>

                {{-- Avatar (Right) --}}
                <div class="relative">
                    <button type="button" onclick="toggleMobileDropdown()"
                        class="size-10 rounded-full bg-pink-100 border-2 border-white shadow-sm flex items-center justify-center font-bold text-pink-600 focus:outline-none hover:bg-pink-200 transition-colors">
                        {{ substr(auth()->user()->first_name, 0, 1) }}
                    </button>

                    {{-- Dropdown Menu --}}
                    <div id="mobile-profile-dropdown"
                        class="hidden absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl shadow-pink-200/50 border border-pink-100 z-50 overflow-hidden transform origin-top-right transition-all">
                        <div class="px-4 py-3 border-b border-pink-50 bg-pink-50/30">
                            <p class="text-sm font-bold text-pink-900 truncate">{{ auth()->user()->first_name }}</p>
                            <p class="text-[10px] font-bold text-pink-400 mt-0.5">Administrator</p>
                        </div>
                        <form method="POST" action="{{ route('logout') }}">
                            @csrf
                            <button type="submit"
                                class="w-full text-left flex items-center gap-3 px-4 py-3 text-sm font-bold text-pink-600 hover:bg-pink-50 transition-colors">
                                <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Keluar
                            </button>
                        </form>
                    </div>
                </div>
            </header>

            {{-- Main Scrollable Area --}}
            <main class="flex-1 overflow-y-auto p-6 md:p-8 bg-blue-50/20 pb-32 md:pb-10">
                @yield('content')
            </main>

            {{-- Mobile Bottom Navigation --}}
            <nav
                class="md:hidden fixed bottom-0 w-full bg-white border-t border-pink-100 flex items-center justify-around pb-safe pt-2 px-2 z-30 shadow-[0_-10px_40px_-10px_rgba(236,72,153,0.15)] rounded-t-3xl">
                {{-- Dashboard --}}
                <a href="{{ route('admin.dashboard') }}"
                    class="flex flex-col items-center gap-1 p-2 {{ request()->routeIs('admin.dashboard') ? 'text-pink-600' : 'text-pink-300 hover:text-pink-500' }} transition-colors">
                    <svg class="size-6" fill="{{ request()->routeIs('admin.dashboard') ? 'currentColor' : 'none' }}"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v12a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                    </svg>
                    <span class="text-[10px] font-bold">Dashboard</span>
                </a>

                {{-- Order --}}
                <a href="/admin/order"
                    class="flex flex-col items-center gap-1 p-2 text-pink-300 hover:text-pink-500 transition-colors">
                    <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    <span class="text-[10px] font-bold">Order</span>
                </a>

                {{-- Input Order (Prominent) --}}
                <div class="relative -top-7">
                    <a href="/admin/order/create"
                        class="flex flex-col items-center justify-center size-[68px] bg-pink-600 text-white rounded-full shadow-xl shadow-pink-400/40 hover:-translate-y-1 transition-transform border-[6px] border-[#fffbfc]">
                        <svg class="size-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                d="M12 4v16m8-8H4" />
                        </svg>
                    </a>
                </div>

                {{-- Customer --}}
                <a href="#"
                    class="flex flex-col items-center gap-1 p-2 text-pink-300 hover:text-pink-500 transition-colors">
                    <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span class="text-[10px] font-bold">Customer</span>
                </a>

                {{-- Menu Toggle --}}
                <button type="button" onclick="toggleMobileSidebar()"
                    class="flex flex-col items-center gap-1 p-2 text-pink-300 hover:text-pink-500 transition-colors">
                    <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <span class="text-[10px] font-bold">Menu</span>
                </button>
            </nav>
        </div>
    </div>

    {{-- Script for Mobile Sidebar --}}
    <script>
        function toggleMobileSidebar() {
            const sidebar = document.getElementById('mobile-sidebar');
            const overlay = document.getElementById('mobile-sidebar-overlay');

            if (sidebar.classList.contains('-translate-x-full')) {
                // Open Sidebar
                sidebar.classList.remove('-translate-x-full');
                overlay.classList.remove('hidden');

                // Trigger fade in
                setTimeout(() => {
                    overlay.classList.remove('opacity-0');
                    overlay.classList.add('opacity-100');
                }, 10);
            } else {
                // Close Sidebar
                sidebar.classList.add('-translate-x-full');
                overlay.classList.remove('opacity-100');
                overlay.classList.add('opacity-0');

                // Hide overlay after animation
                setTimeout(() => {
                    overlay.classList.add('hidden');
                }, 300);
            }
        }

        function toggleMobileDropdown() {
            const dropdown = document.getElementById('mobile-profile-dropdown');
            dropdown.classList.toggle('hidden');
        }

        // Close dropdown when clicking outside
        window.addEventListener('click', function(e) {
            const dropdown = document.getElementById('mobile-profile-dropdown');
            if (dropdown) {
                const button = dropdown.previousElementSibling;
                if (!button.contains(e.target) && !dropdown.contains(e.target)) {
                    dropdown.classList.add('hidden');
                }
            }
        });

        function toggleSubmenu(id) {
            const submenu = document.getElementById(id);
            const arrow = document.getElementById('arrow-' + id.split('-')[1]);

            if (submenu.classList.contains('hidden')) {
                submenu.classList.remove('hidden');
                arrow.classList.add('rotate-180');
            } else {
                submenu.classList.add('hidden');
                arrow.classList.remove('rotate-180');
            }
        }
    </script>
    {{-- Global Toast Notifications --}}
    @if(session('success') || session('error'))
    <div class="fixed top-5 right-5 z-[100] space-y-3">
        @if(session('success'))
        <div id="toast-success" class="flex items-center w-full max-w-xs p-4 text-emerald-600 bg-white rounded-2xl shadow-2xl shadow-emerald-200 border border-emerald-50 animate-in fade-in slide-in-from-right-10 duration-500" role="alert">
            <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-white bg-emerald-500 rounded-xl">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <div class="ml-3 text-sm font-bold">{{ session('success') }}</div>
            <button type="button" class="ml-4 -mx-1.5 -my-1.5 text-emerald-300 hover:text-emerald-500 p-1.5" onclick="this.parentElement.remove()">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
            </button>
        </div>
        @endif

        @if(session('error'))
        <div id="toast-error" class="flex items-center w-full max-w-xs p-4 text-red-600 bg-white rounded-2xl shadow-2xl shadow-red-100 border border-red-50 animate-in fade-in slide-in-from-right-10 duration-500" role="alert">
            <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-white bg-red-500 rounded-xl">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>
            </div>
            <div class="ml-3 text-sm font-bold">{{ session('error') }}</div>
            <button type="button" class="ml-4 -mx-1.5 -my-1.5 text-red-300 hover:text-red-500 p-1.5" onclick="this.parentElement.remove()">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
            </button>
        </div>
        @endif
    </div>
    <script>
        setTimeout(() => {
            document.querySelectorAll('[role="alert"]').forEach(el => {
                el.classList.add('opacity-0', 'translate-x-full');
                el.style.transition = 'all 0.5s ease-in-out';
                setTimeout(() => el.remove(), 500);
            });
        }, 5000);
    </script>
    @endif

    @stack('scripts')
    <script>
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js');
            });
        }
    </script>
</body>

</html>

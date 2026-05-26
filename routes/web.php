<?php

use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\TestController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');
Route::get('/test', [TestController::class, 'index'])->name('test');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::get('/analytics', [AnalyticsController::class, 'index'])->name('analytics');
});

require __DIR__.'/settings.php';

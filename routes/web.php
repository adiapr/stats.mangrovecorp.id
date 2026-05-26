<?php

use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MakenlivingController;
use App\Http\Controllers\TestController;
use Illuminate\Support\Facades\Route;

// Route::inertia('/', 'welcome')->name('home');
Route::get('/', function () {
    return redirect()->route('dashboard');
})->name('home');
Route::get('/test', [TestController::class, 'index'])->name('test');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/analytics', [AnalyticsController::class, 'index'])->name('analytics');
    Route::get('/makenliving', [MakenlivingController::class, 'index'])->name('makenliving');
});

require __DIR__.'/settings.php';

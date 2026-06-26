<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

Route::get('/', function () {
    return view('welcome');
});

// ── Google OAuth Debug Routes (web, bukan api) ──────────────
// Berguna untuk test langsung dari browser tanpa prefix /api/v1
Route::get('/auth/google',          [AuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallbackDebug']);

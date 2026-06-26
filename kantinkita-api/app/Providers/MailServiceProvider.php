<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Mail;
use App\Mail\GmailTransport;

class MailServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Mail::extend('gmail-api', function () {
            $refreshToken = config('services.google.refresh_token');
            $fromAddress = config('mail.from.address');

            if (!$refreshToken) {
                throw new \Exception('Gmail refresh token not configured');
            }

            return new GmailTransport($refreshToken, $fromAddress);
        });
    }
}

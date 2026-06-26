<?php

namespace App\Mail;

use Illuminate\Mail\Transport\Transport;
use Swift_Mime_SimpleMessage;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GmailTransport extends Transport
{
    protected string $refreshToken;
    protected string $fromAddress;

    public function __construct(string $refreshToken, string $fromAddress)
    {
        $this->refreshToken = $refreshToken;
        $this->fromAddress = $fromAddress;
    }

    /**
     * Send the given message.
     */
    public function send(Swift_Mime_SimpleMessage $message, ?string &$failedRecipients = null): int
    {
        $message->generateId();

        $to = $this->getRecipients($message);
        $subject = $message->getSubject();
        $body = $message->getBody();

        // Get access token from refresh token
        $accessToken = $this->getAccessToken();

        // Build email
        $email = $this->buildEmail($message, $to, $subject);

        // Send via Gmail API
        try {
            $response = Http::withToken($accessToken)
                ->post('https://www.googleapis.com/upload/gmail/v1/users/me/messages/send', [
                    'raw' => $email,
                ]);

            if ($response->failed()) {
                Log::error('Gmail API Send Failed', [
                    'status' => $response->status(),
                    'body' => $response->json(),
                ]);
                throw new \Exception('Gmail API: ' . $response->json('error.message', 'Unknown error'));
            }

            return 1;
        } catch (\Exception $e) {
            Log::error('Failed to send email via Gmail API: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get access token from refresh token.
     */
    protected function getAccessToken(): string
    {
        $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'client_id' => config('services.google.client_id'),
            'client_secret' => config('services.google.client_secret'),
            'refresh_token' => $this->refreshToken,
            'grant_type' => 'refresh_token',
        ]);

        if ($response->failed()) {
            throw new \Exception('Failed to refresh access token: ' . $response->status());
        }

        return $response->json('access_token');
    }

    /**
     * Build the email message.
     */
    protected function buildEmail(Swift_Mime_SimpleMessage $message, string $to, string $subject): string
    {
        $fromName = config('mail.from.name', 'KantinKita');
        $fromAddress = config('mail.from.address', $this->fromAddress);

        $headers = [
            "From: {$fromName} <{$fromAddress}>",
            "To: {$to}",
            "Subject: {$subject}",
            "MIME-Version: 1.0",
            "Content-Type: text/html; charset=UTF-8",
        ];

        $body = $message->getBody();
        $email = implode("\r\n", $headers) . "\r\n\r\n" . $body;

        return base64_encode($email);
    }

    /**
     * Get recipients list.
     */
    protected function getRecipients(Swift_Mime_SimpleMessage $message): string
    {
        $to = [];
        foreach ($message->getTo() as $email => $name) {
            if (is_string($name)) {
                $to[] = "$name <$email>";
            } else {
                $to[] = $email;
            }
        }

        return implode(', ', $to);
    }
}

<?php

return [
    'paths'                    => ['api/*', 'storage/*', 'sanctum/csrf-cookie', 'broadcasting/auth'],
    'allowed_methods'          => ['*'],
    'allowed_origins'          => [rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/')],
    'allowed_origins_patterns' => [],
    'allowed_headers'          => ['*'],
    'exposed_headers'          => ['Content-Disposition'],
    'max_age'                  => 0,
    'supports_credentials'     => true,
];

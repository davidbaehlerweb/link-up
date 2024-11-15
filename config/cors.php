<?php

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'auth/google', 'auth/google/callback'],
'allowed_methods' => ['*'],
'allowed_origins' => ['http://localhost:5173'], // Remplacez ceci par votre domaine front-end
'allowed_origins_patterns' => [],
'allowed_headers' => ['*'],
'exposed_headers' => [],
'max_age' => 0,
'supports_credentials' => true, // Doit être true pour les cookies

];

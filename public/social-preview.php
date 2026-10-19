<?php

declare(strict_types=1);

$uri = $_SERVER['REQUEST_URI'] ?? '/';
$path = parse_url($uri, PHP_URL_PATH) ?: '/';

if (! preg_match('#^/(clanak|fk-posavina|prekidi-struje|vrijeme|kontakt|omilosevcu|kategorija)(/|$)#i', $path)) {
    http_response_code(404);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Not found';
    exit;
}

$agent = str_replace(["\r", "\n"], '', (string) ($_SERVER['HTTP_USER_AGENT'] ?? 'facebookexternalhit/1.1'));
$target = 'https://api.milosevac.com'.$uri;
$context = stream_context_create([
    'http' => [
        'method' => 'GET',
        'header' => "User-Agent: {$agent}\r\nX-Social-Preview: 1\r\nAccept: text/html\r\n",
        'timeout' => 12,
        'ignore_errors' => true,
        'max_redirects' => 0,
    ],
]);

$body = @file_get_contents($target, false, $context);
$status = 502;
if (isset($http_response_header[0]) && preg_match('#\s(\d{3})\s#', $http_response_header[0], $match)) {
    $status = (int) $match[1];
}

if (! is_string($body) || $body === '' || $status < 200 || $status >= 400) {
    $canonical = 'https://milosevac.com'.$path;
    http_response_code(200);
    header('Content-Type: text/html; charset=utf-8');
    $safeCanonical = htmlspecialchars($canonical, ENT_QUOTES, 'UTF-8');
    echo '<!doctype html><html lang="bs"><head><meta charset="utf-8">';
    echo '<title>Miloševac</title>';
    echo '<meta property="og:site_name" content="Miloševac">';
    echo '<meta property="og:title" content="Miloševac">';
    echo '<meta property="og:url" content="'.$safeCanonical.'">';
    echo '<meta property="og:image" content="https://milosevac.com/og.jpg">';
    echo '<meta property="og:image:type" content="image/jpeg">';
    echo '<link rel="canonical" href="'.$safeCanonical.'">';
    echo '</head><body><a href="'.$safeCanonical.'">Miloševac</a></body></html>';
    exit;
}

http_response_code($status);
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: public, max-age=300');
echo $body;

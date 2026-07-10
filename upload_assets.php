<?php
require_once __DIR__ . '/backend/includes/SupabaseStorage.php';

$supabase = new SupabaseStorage();

$assetsDir = __DIR__ . '/frontend/src/assets/';
$filesToUpload = [
    'Autumn Haze.jpg',
    'Insta-Escape.jpg',
    'Ethereal Girl.png',
    'homepicture(4).jpg',
    'canvas and character.jpg'
];

$urls = [];

foreach ($filesToUpload as $file) {
    $path = $assetsDir . $file;
    if (!file_exists($path)) {
        echo "Missing $path\n";
        continue;
    }

    $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
    $mime = 'image/jpeg';
    if ($ext === 'png') {
        $mime = 'image/png';
    }

    $destPath = 'assets/' . $file;
    
    echo "Uploading $file...\n";
    $url = $supabase->upload($path, $destPath, $mime);
    
    if ($url) {
        echo "Success: $url\n";
        $urls[$file] = $url;
        unlink($path); // Delete local file after upload
    } else {
        echo "Failed to upload $file\n";
    }
}

file_put_contents('uploaded_urls.json', json_encode($urls, JSON_PRETTY_PRINT));
echo "Done!\n";

<?php
$assetsDir = __DIR__ . '/frontend/src/assets/';
$filesToCompress = [
    'Autumn Haze.jpg',
    'Insta-Escape.jpg',
    'Ethereal Girl.png',
    'homepicture(4).jpg',
    'canvas and character.jpg'
];

foreach ($filesToCompress as $file) {
    $path = $assetsDir . $file;
    if (!file_exists($path)) {
        echo "Missing $path\n";
        continue;
    }
    
    $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
    if ($ext === 'png') {
        $img = @imagecreatefrompng($path);
    } else {
        $img = @imagecreatefromjpeg($path);
    }
    
    if ($img) {
        $width = imagesx($img);
        $height = imagesy($img);
        
        // Scale down if it's very large to save even more space (Hero images don't need to be 4K)
        if ($width > 1200) {
            $newWidth = 1200;
            $newHeight = (int)($height * ($newWidth / $width));
            $resized = imagecreatetruecolor($newWidth, $newHeight);
            
            // Handle transparency for PNGs being converted to WebP
            imagepalettetotruecolor($img);
            imagealphablending($resized, false);
            imagesavealpha($resized, true);
            $transparent = imagecolorallocatealpha($resized, 255, 255, 255, 127);
            imagefilledrectangle($resized, 0, 0, $newWidth, $newHeight, $transparent);
            
            imagecopyresampled($resized, $img, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
            imagedestroy($img);
            $img = $resized;
        } else {
            imagepalettetotruecolor($img);
        }

        $newName = pathinfo($path, PATHINFO_FILENAME) . '.webp';
        $newPath = $assetsDir . $newName;
        
        imagewebp($img, $newPath, 75); // compress to webp with 75% quality
        imagedestroy($img);
        
        // Don't delete original if it's the exact same name (which it won't be, since it's .webp now)
        if ($newName !== $file) {
            unlink($path); // remove old large file
        }
        echo "Compressed $file -> $newName (" . filesize($newPath) . " bytes)\n";
    } else {
        echo "Failed to load $file\n";
    }
}

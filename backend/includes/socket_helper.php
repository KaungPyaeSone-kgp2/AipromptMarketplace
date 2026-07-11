<?php

function emitSocketEvent($event, $data, $room = null) {
    $url = getenv('SOCKET_SERVER_INTERNAL_URL') ?: 'http://127.0.0.1:3001/emit';
    
    $payload = [
        'event' => $event,
        'data' => $data,
        'room' => $room
    ];
    
    $ch = curl_init($url);
    
    $jsonData = json_encode($payload);
    
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Content-Length: ' . strlen($jsonData)
    ]);
    
    // Non-blocking trick: Timeout after 1 second so PHP doesn't wait long
    curl_setopt($ch, CURLOPT_TIMEOUT, 1);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $result = curl_exec($ch);
    
    // Optional error logging
    if (curl_errno($ch)) {
        // error_log("Socket Emit Error: " . curl_error($ch));
    }
    
    curl_close($ch);
    
    return $result;
}

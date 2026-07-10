<?php
// backend/includes/mail.php

// 1. Use Composer's autoloader instead of manual file paths
require_once __DIR__ . '/../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
// use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

function send_otp_email($to_email, $otp_code) {
    try {
        // Use Resend API Key from environment or config
        $resend_api_key = getenv('RESEND_API_KEY');
        $from_email = getenv('EMAIL_USERNAME'); 
        
        if (!$resend_api_key) {
            $config = @parse_ini_file(__DIR__ . '/../config.ini');
            if ($config) {
                $resend_api_key = $config['RESEND_API_KEY'] ?? '';
                if (!$from_email) {
                    $from_email = $config['EMAIL_USERNAME'] ?? 'support@dreamkey.site';
                }
            }
        }

        if (empty($resend_api_key)) {
            return "Missing RESEND_API_KEY. Please add it to your Railway variables.";
        }

        // If from_email is still Gmail, force a default domain email to avoid Resend errors
        if (empty($from_email) || strpos($from_email, '@gmail.com') !== false) {
            $from_email = 'support@dreamkey.site'; 
        }

        $html_body = "
            <div style='font-family: Arial, sans-serif; padding: 40px 20px; background-color: #000000; color: #ffffff;'>
                <div style='background-color: #1a1a1a; padding: 40px; border-radius: 20px; max-width: 500px; margin: auto; text-align: center; border: 1px solid #333;'>
                    <h2 style='color: #ffffff; letter-spacing: 2px; margin-bottom: 10px;'>DREAM KEY</h2>
                    <p style='color: #aaaaaa; margin-bottom: 30px;'>Identity Verification Required</p>
                    <h1 style='letter-spacing: 8px; color: #000000; background: #ffffff; padding: 20px; border-radius: 12px; display: inline-block; font-family: monospace; font-size: 32px;'>{$otp_code}</h1>
                    <p style='color: #666666; font-size: 13px; margin-top: 40px;'>This secure code will expire in exactly 3 minutes. Do not share it with anyone.</p>
                </div>
            </div>
        ";

        $post_data = json_encode([
            'from'    => 'Dream Key Security <' . $from_email . '>',
            'to'      => [$to_email],
            'subject' => 'Your Dream Key Verification Code',
            'html'    => $html_body
        ]);

        $ch = curl_init('https://api.resend.com/emails');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $resend_api_key,
            'Content-Type: application/json'
        ]);

        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curl_error = curl_error($ch);
        curl_close($ch);

        if ($curl_error) {
            return "cURL Error: " . $curl_error;
        }

        $response_data = json_decode($response, true);

        if ($http_code >= 200 && $http_code < 300) {
            return "SUCCESS";
        } else {
            return "Resend API Error: " . ($response_data['message'] ?? $response);
        }

    } catch (Exception $e) {
        return "System Error: " . $e->getMessage();
    }
}
?>
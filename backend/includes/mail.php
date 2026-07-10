<?php
// backend/includes/mail.php

// 1. Use Composer's autoloader instead of manual file paths
require_once __DIR__ . '/../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
// use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

function send_otp_email($to_email, $otp_code) {
    $mail = new PHPMailer(true);

    try {
        // Load credentials dynamically
        $email_username = getenv('EMAIL_USERNAME');
        $email_password = getenv('EMAIL_PASSWORD');

        if (!$email_username || !$email_password) {
            $config = @parse_ini_file(__DIR__ . '/../config.ini');
            if ($config) {
                $email_username = $config['EMAIL_USERNAME'] ?? '';
                $email_password = $config['EMAIL_PASSWORD'] ?? '';
            }
        }
        
        $mail->isSMTP();
        // Force IPv4 to fix Railway / Docker IPv6 routing timeouts
        $mail->Host       = gethostbyname('smtp.gmail.com');
        $mail->SMTPAuth   = true;
        
        $mail->Username   = $email_username; 
        $mail->Password   = $email_password; 
        
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; 
        $mail->Port       = 587;
        $mail->Timeout    = 30; // Increased timeout for cloud providers

        // Bypasses local SSL certificate issues during development
        $mail->SMTPOptions = array(
            'ssl' => array(
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            )
        );

        // Uses the config email dynamically
        $mail->setFrom($email_username, 'Dream Key Security');
        $mail->addAddress($to_email);

        $mail->isHTML(true);
        $mail->Subject = 'Your Dream Key Verification Code';
        
        // Clean, modern glass-like aesthetic for the email layout
        $mail->Body = "
            <div style='font-family: Arial, sans-serif; padding: 40px 20px; background-color: #000000; color: #ffffff;'>
                <div style='background-color: #1a1a1a; padding: 40px; border-radius: 20px; max-width: 500px; margin: auto; text-align: center; border: 1px solid #333;'>
                    <h2 style='color: #ffffff; letter-spacing: 2px; margin-bottom: 10px;'>DREAM KEY</h2>
                    <p style='color: #aaaaaa; margin-bottom: 30px;'>Identity Verification Required</p>
                    <h1 style='letter-spacing: 8px; color: #000000; background: #ffffff; padding: 20px; border-radius: 12px; display: inline-block; font-family: monospace; font-size: 32px;'>{$otp_code}</h1>
                    <p style='color: #666666; font-size: 13px; margin-top: 40px;'>This secure code will expire in exactly 3 minutes. Do not share it with anyone.</p>
                </div>
            </div>
        ";

        $mail->send();
        return "SUCCESS"; 
    } catch (Exception $e) {
        return $mail->ErrorInfo; 
    }
}
?>
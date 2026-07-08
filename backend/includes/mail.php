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
        $emailUser = getenv('EMAIL_USERNAME');
        $emailPass = getenv('EMAIL_PASSWORD');

        $ini_path = __DIR__ . '/../config.ini';
        if ((!$emailUser || !$emailPass) && file_exists($ini_path)) {
            $config = parse_ini_file($ini_path);
            if ($config) {
                $emailUser = $emailUser ?: $config['EMAIL_USERNAME'];
                $emailPass = $emailPass ?: $config['EMAIL_PASSWORD'];
            }
        }
        
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        
        $mail->Username   = $emailUser; 
        $mail->Password   = $emailPass; 
        
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; 
        $mail->Port       = 587;
        $mail->Timeout    = 5; // Fail fast if network is blocking SMTP

        // Bypasses local SSL certificate issues during development
        $mail->SMTPOptions = array(
            'ssl' => array(
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            )
        );

        // Uses the config email dynamically
        $mail->setFrom($emailUser, 'Dream Key Security');
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
<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . "/../../database/Database.php";

try {
    $db = new Database();
    $pdo = $db->connect();

    $query = "SELECT id, account_name, account_phone_number, account_qr_image FROM payment_method_info";
    $stmt = $pdo->prepare($query);
    $stmt->execute();

    $payment_methods = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        array_push($payment_methods, $row);
    }
    echo json_encode(array("success" => true, "data" => $payment_methods));
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(array("success" => false, "message" => "Database error: " . $e->getMessage()));
}
?>

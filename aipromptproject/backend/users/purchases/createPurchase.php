<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Only POST method is allowed"]);
    exit;
}

require_once __DIR__ . "/../../database/Database.php";
require_once __DIR__ . "/../../dao/BaseDAO.php";

$data = json_decode(file_get_contents("php://input"), true);

$userId = filter_var($data["user_id"] ?? null, FILTER_VALIDATE_INT);
$totalCoinPaid = filter_var($data["total_coin_paid"] ?? 0, FILTER_VALIDATE_FLOAT);
$items = $data["items"] ?? [];

if (!$userId || $userId <= 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "A valid user_id is required"]);
    exit;
}

if (!is_array($items) || count($items) === 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "At least one item is required in the cart"]);
    exit;
}

try {
    $db = new Database();
    $pdo = $db->connect();
    
    // Start transaction
    $pdo->beginTransaction();

    // Check if buyer has already purchased any of the prompts
    $checkStmt = $pdo->prepare("
        SELECT COUNT(*) FROM purchases p
        JOIN purchases_items pi ON p.id = pi.purchase_id
        WHERE p.buyer_id = ? AND pi.prompt_id = ?
    ");
    foreach ($items as $item) {
        $checkStmt->execute([$userId, $item['prompt_id']]);
        if ($checkStmt->fetchColumn() > 0) {
            throw new Exception("You have already purchased the prompt with ID: " . $item['prompt_id']);
        }
    }

    // Deduct from buyer
    $buyerStmt = $pdo->prepare("SELECT coin_balance FROM users WHERE id = ? FOR UPDATE");
    $buyerStmt->execute([$userId]);
    $buyer = $buyerStmt->fetch();
    if (!$buyer || $buyer['coin_balance'] < $totalCoinPaid) {
        throw new Exception("Insufficient coin balance.");
    }
    $pdo->prepare("UPDATE users SET coin_balance = coin_balance - ? WHERE id = ?")->execute([$totalCoinPaid, $userId]);

    // 1. Insert into purchases table (one row for the entire cart)
    $purchaseSql = "INSERT INTO purchases (buyer_id, total_coin_paid, purchased_at) VALUES (:buyer_id, :total_coin_paid, NOW())";
    $purchaseStmt = $pdo->prepare($purchaseSql);
    $purchaseStmt->execute([
        ':buyer_id' => $userId,
        ':total_coin_paid' => $totalCoinPaid
    ]);
    
    $purchaseId = $pdo->lastInsertId();

    // 2. Insert into purchases_items table (multiple rows if multiple items)
    $itemSql = "INSERT INTO purchases_items (purchase_id, prompt_id, prompt_sale_coin, purchased_at) VALUES (:purchase_id, :prompt_id, :prompt_sale_coin, NOW())";
    $itemStmt = $pdo->prepare($itemSql);
    
    $creatorTotals = [];
    foreach ($items as $item) {
        $itemStmt->execute([
            ':purchase_id' => $purchaseId,
            ':prompt_id' => $item['prompt_id'],
            ':prompt_sale_coin' => $item['price']
        ]);
        
        // Update sales count on the prompt
        $pdo->prepare("UPDATE prompts SET sales_count = sales_count + 1 WHERE id = ?")->execute([$item['prompt_id']]);

        // Get creator
        $promptStmt = $pdo->prepare("SELECT creator_id, title FROM prompts WHERE id = ?");
        $promptStmt->execute([$item['prompt_id']]);
        $promptRow = $promptStmt->fetch();
        if ($promptRow) {
            $cId = $promptRow['creator_id'];
            if (!isset($creatorTotals[$cId])) {
                $creatorTotals[$cId] = ['gross' => 0, 'titles' => []];
            }
            $creatorTotals[$cId]['gross'] += floatval($item['price']);
            $creatorTotals[$cId]['titles'][] = $promptRow['title'];
        }
    }

    foreach ($creatorTotals as $cId => $data) {
        $gross = $data['gross'];
        $platformFee = $gross * 0.10; // 10% platform fee
        $net = $gross - $platformFee;

        // Add to creator's coin_balance in users table
        $pdo->prepare("UPDATE users SET coin_balance = coin_balance + ? WHERE id = ?")->execute([$net, $cId]);
        
        // Add to creator_data table for earnings and sales count
        $pdo->prepare("UPDATE creator_data SET total_earning_coins = total_earning_coins + ?, total_sales_count = total_sales_count + ? WHERE user_id = ?")->execute([$net, count($data['titles']), $cId]);
        
        // Insert earning record
        $pdo->prepare("INSERT INTO creator_earnings (creator_id, purchase_id, gross_coin, platform_fee_coin, net_coin) VALUES (?, ?, ?, ?, ?)")->execute([$cId, $purchaseId, $gross, $platformFee, $net]);

        // Notify creator
        $titlesStr = implode(", ", $data['titles']);
        $msgCreator = "Someone purchased your prompt(s): $titlesStr for $gross coins. You earned $net coins.";
        $pdo->prepare("INSERT INTO notifications (user_id, type, title, message) VALUES (?, 'purchased', 'Sale Successful!', ?)")->execute([$cId, $msgCreator]);
    }

    // Notify buyer
    $msgBuyer = "You successfully purchased " . count($items) . " items for a total of $totalCoinPaid coins.";
    $pdo->prepare("INSERT INTO notifications (user_id, type, title, message) VALUES (?, 'purchased', 'Purchase Successful!', ?)")->execute([$userId, $msgBuyer]);

    // Commit transaction
    $pdo->commit();

    echo json_encode([
        "success" => true,
        "message" => "Purchase completed successfully",
        "purchase_id" => $purchaseId
    ]);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>

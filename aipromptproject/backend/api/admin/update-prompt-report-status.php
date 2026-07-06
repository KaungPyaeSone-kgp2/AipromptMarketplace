<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

date_default_timezone_set("Asia/Yangon");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../dao/BaseDAO.php";

try {
    // 1. Get the posted JSON data
    $data = json_decode(file_get_contents("php://input"));

    // 2. Validate input
    if (empty($data->id) || empty($data->status)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Incomplete data. Both report ID and status are required."
        ]);
        exit();
    }

    $allowed_statuses = ['pending', 'reviewed', 'resolved', 'rejected'];
    $new_status = strtolower(htmlspecialchars(strip_tags($data->status)));
    $report_id = htmlspecialchars(strip_tags($data->id));

    if (!in_array($new_status, $allowed_statuses)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Invalid status provided."
        ]);
        exit();
    }

    // 3. Initialize Database and DAO
    $db = new Database();
    $pdo = $db->connect();
    $dao = new BaseDAO($pdo);

    // 4. Execute the update using BaseDAO
    // Note: Assuming your table name is 'prompt_reports'. Adjust if necessary.
    $sql = "UPDATE prompt_reports SET status = :status WHERE id = :id";
    $queryData = [
        ':status' => $new_status,
        ':id' => $report_id
    ];

    $rowCount = $dao->update($sql, $queryData);

    // 5. Respond
    if ($rowCount > 0) {

        $cacheFile = __DIR__ . "/../../cache/prompt-reports.json";
        if (file_exists($cacheFile)) {
            unlink($cacheFile);
        }

        if ($new_status === "reviewed") {

            require_once __DIR__ . '/../../includes/ensure_daily_stats.php';
            ensureTodayStatsRow($pdo);

            $update_dashboard = "UPDATE dashboard_daily_stats SET total_pending_reports = total_pending_reports - 1 WHERE stat_date = CURDATE()";

            if ($dao->update($update_dashboard, []) > 0) {

                $cacheFile = __DIR__ . "/../../cache/dahboard-top-cards.json";
                if (file_exists($cacheFile)) {
                    unlink($cacheFile);
                }
            } else {
                http_response_code(503);
                echo json_encode([
                    "success" => false,
                    "message" => "Unable to update total pending report in the database."
                ]);
            }
        }
        else if ($new_status === "resolved" || $new_status === "rejected") {
            $get_info = "
                SELECT pr.reporter_id, pr.prompt_id, p.creator_id, p.title as prompt_title 
                FROM prompt_reports pr
                LEFT JOIN prompts p ON pr.prompt_id = p.id
                WHERE pr.id = :id
            ";
            $info_result = $dao->select($get_info, [':id' => $report_id]);

            if (!empty($info_result)) {
                $reporter_id = $info_result[0]['reporter_id'];
                $target_id = $info_result[0]['prompt_id'];
                $creator_id = $info_result[0]['creator_id'];
                $prompt_title = $info_result[0]['prompt_title'] ?? "Unknown Prompt";

                if ($new_status === "resolved" && !empty($target_id)) {
                    $update_prompt_status = "UPDATE prompts SET is_banned = 1 WHERE id = :id";
                    $dao->update($update_prompt_status,[":id" => $target_id]);

                    // Update dashboard statistics for banned prompt
                    require_once __DIR__ . '/../../includes/ensure_daily_stats.php';
                    ensureTodayStatsRow($pdo);

                    $update_dashboard_banned = "UPDATE dashboard_daily_stats SET total_banned_prompt = total_banned_prompt + 1, new_banned_prompts_count = new_banned_prompts_count + 1 WHERE stat_date = CURDATE()";
                    $dao->update($update_dashboard_banned, []);

                    // Clear dashboard cache
                    $cacheFile = __DIR__ . "/../../cache/dashboard-top-cards.json";
                    if (file_exists($cacheFile)) {
                        unlink($cacheFile);
                    }
                }

                require_once __DIR__ . "/../../../websocket/socket_helper.php";
                $title = $new_status === "resolved" ? "Prompt Report Resolved" : "Prompt Report Rejected";
                
                $reporter_msg = $new_status === "resolved" 
                    ? "Your report against the prompt '{$prompt_title}' has been reviewed and resolved. The prompt has been banned." 
                    : "Your report against the prompt '{$prompt_title}' has been reviewed and rejected.";
                
                $creator_msg = $new_status === "resolved"
                    ? "Your prompt '{$prompt_title}' has been banned due to a violation of our terms."
                    : "A report against your prompt '{$prompt_title}' was reviewed and rejected. No action was taken.";

                try {
                    $stmt = $pdo->prepare("INSERT INTO notifications (sender_id, receiver_id, type, title, message, reference_id, reference_type) VALUES (?, ?, 'report_reviewed', ?, ?, ?, 'prompt_report')");
                    // Notify reporter
                    $stmt->execute([$reporter_id, $reporter_id, $title, $reporter_msg, $report_id]);
                    emitSocketEvent('report_notification', ['title' => $title, 'message' => $reporter_msg], "user_" . $reporter_id);

                    // Notify prompt creator
                    if (!empty($creator_id)) {
                        $stmt->execute([$reporter_id, $creator_id, $title, $creator_msg, $report_id]);
                        emitSocketEvent('report_notification', ['title' => $title, 'message' => $creator_msg], "user_" . $creator_id);
                    }
                } catch (Exception $e) {
                    error_log("Failed to insert notification: " . $e->getMessage());
                }
            }
        }

        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Prompt report status updated to " . $new_status . " successfully."
        ]);
    } else {
        // If rowCount is 0, the record might not exist or the status was already set to that value
        http_response_code(200); // Using 200 since no db error occurred, but no rows changed
        echo json_encode([
            "success" => true,
            "message" => "No changes made. Status may already be set or ID not found."
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Server Error: " . $e->getMessage()
    ]);
}

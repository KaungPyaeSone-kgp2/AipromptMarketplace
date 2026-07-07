<?php
header("Content-Type: application/json");
require_once __DIR__ . '/../../includes/cors_headers.php';
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
    // 2. Get the posted JSON data
    $data = json_decode(file_get_contents("php://input"));

    // 3. Validate input
    if (!empty($data->id) && !empty($data->status)) {

        // Whitelist allowed statuses just to be safe
        $allowed_statuses = ['pending', 'reviewed', 'resolved', 'rejected'];
        $new_status = strtolower(htmlspecialchars(strip_tags($data->status)));
        $report_id = htmlspecialchars(strip_tags($data->id));

        if (in_array($new_status, $allowed_statuses)) {

            $database = new Database();
            $pdo = $database->connect();
            $baseDAO = new BaseDAO($pdo);

            // 4. Prepare the SQL query
            // IMPORTANT: Ensure 'user_reports' matches your actual table name
            $query = "UPDATE user_reports 
                  SET status = :status 
                  WHERE id = :id";

            $param = [
                ":status" => $new_status,
                ":id" => $report_id
            ];

            // 5. Execute and respond
            if ($baseDAO->update($query, $param) > 0) {

                $cacheFile = __DIR__ . "/../../cache/user-reports.json";
                if (file_exists($cacheFile)) {
                    unlink($cacheFile);
                }

                if ($new_status === "reviewed") {

                    require_once __DIR__ . '/../../includes/ensure_daily_stats.php';
                    ensureTodayStatsRow($pdo);

                    $update_dashboard = "UPDATE dashboard_daily_stats SET total_pending_reports = total_pending_reports - 1 WHERE stat_date = CURDATE()";

                    if ($baseDAO->update($update_dashboard, []) > 0) {

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
                    $get_info = "SELECT reporter_id, reported_user_id FROM user_reports WHERE id = :id";
                    $info_result = $baseDAO->select($get_info, [':id' => $report_id]);

                    if (!empty($info_result)) {
                        $reporter_id = $info_result[0]['reporter_id'];
                        $target_id = $info_result[0]['reported_user_id'];

                        if ($new_status === "resolved" && !empty($target_id)) {
                            $update_user_status = "UPDATE users SET is_banned = 1 WHERE id = :id";
                            $baseDAO->update($update_user_status,[":id" => $target_id]);
                        }

                        require_once __DIR__ . "/../../../websocket/socket_helper.php";
                        $title = $new_status === "resolved" ? "Account Report Resolved" : "Account Report Rejected";
                        $reporter_msg = $new_status === "resolved" 
                            ? "Your report against a user has been reviewed and resolved. The user has been banned." 
                            : "Your report against a user has been reviewed and rejected.";
                        $target_msg = $new_status === "resolved"
                            ? "Your account has been banned due to a violation of our terms."
                            : "A report against your account was reviewed and rejected. No action was taken.";

                        try {
                            $stmt = $pdo->prepare("INSERT INTO notifications (sender_id, receiver_id, type, title, message, reference_id, reference_type) VALUES (?, ?, 'report_reviewed', ?, ?, ?, 'user_report')");
                            // Notify reporter
                            $stmt->execute([$reporter_id, $reporter_id, $title, $reporter_msg, $report_id]);
                            emitSocketEvent('report_notification', ['title' => $title, 'message' => $reporter_msg], "user_" . $reporter_id);

                            // Notify reported user
                            if (!empty($target_id)) {
                                $stmt->execute([$reporter_id, $target_id, $title, $target_msg, $report_id]);
                                emitSocketEvent('report_notification', ['title' => $title, 'message' => $target_msg], "user_" . $target_id);
                            }
                        } catch (Exception $e) {
                            error_log("Failed to insert notification: " . $e->getMessage());
                        }
                    }
                }
                
                http_response_code(200);
                echo json_encode([
                    "success" => true,
                    "message" => "Report status updated to " . $new_status . " successfully."
                ]);
            } else {
                http_response_code(503);
                echo json_encode([
                    "success" => false,
                    "message" => "Unable to update report status in the database."
                ]);
            }
        } else {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "Invalid status provided. Nice try!"
            ]);
        }
    } else {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Incomplete data. Both report ID and status are required."
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Server Error: " . $e->getMessage()
    ]);
}

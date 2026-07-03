<?php
/**
 * Ensures a row for today exists in the `dashboard_daily_stats` table.
 *
 * This must be called BEFORE any UPDATE on dashboard_daily_stats.
 * It uses INSERT IGNORE so that if the row already exists (keyed on stat_date),
 * the INSERT is silently skipped, and it initializes today's cumulative totals
 * by copying them from yesterday's row.
 *
 * IMPORTANT: The `stat_date` column MUST be a PRIMARY KEY or have a UNIQUE index.
 */
function ensureTodayStatsRow(PDO $pdo): void
{
    // Use a static flag so we only run this once per request, even if called multiple times
    static $done = false;
    if ($done) return;

    $today = date('Y-m-d');
    $yesterday = date('Y-m-d', strtotime('-1 day'));

    // First check if today's row already exists (fast path)
    $check = $pdo->prepare("SELECT 1 FROM dashboard_daily_stats WHERE stat_date = ?");
    $check->execute([$today]);
    if ($check->fetchColumn()) {
        $done = true;
        return;
    }

    // Today's row doesn't exist — seed it from yesterday's cumulative totals.
    // If yesterday also doesn't exist, everything defaults to 0.
    $seed = $pdo->prepare(
        "SELECT total_users, total_prompts, total_banned_users, total_banned_prompt, total_pending_reports
         FROM dashboard_daily_stats WHERE stat_date = ?"
    );
    $seed->execute([$yesterday]);
    $prev = $seed->fetch(PDO::FETCH_ASSOC);

    $totalUsers          = $prev['total_users']           ?? 0;
    $totalPrompts        = $prev['total_prompts']         ?? 0;
    $totalBannedUsers    = $prev['total_banned_users']    ?? 0;
    $totalBannedPrompt   = $prev['total_banned_prompt']   ?? 0;
    $totalPendingReports = $prev['total_pending_reports'] ?? 0;

    // INSERT IGNORE so a race condition between two requests won't cause a duplicate-key error
    $insert = $pdo->prepare(
        "INSERT IGNORE INTO dashboard_daily_stats 
            (stat_date, total_users, total_prompts, total_banned_users, total_banned_prompt, total_pending_reports,
             new_users_count, new_prompts_count, new_banned_users_count, new_banned_prompts_count, new_pending_reports)
         VALUES 
            (:stat_date, :total_users, :total_prompts, :total_banned_users, :total_banned_prompt, :total_pending_reports,
             0, 0, 0, 0, 0)"
    );
    $insert->execute([
        ':stat_date'              => $today,
        ':total_users'            => $totalUsers,
        ':total_prompts'          => $totalPrompts,
        ':total_banned_users'     => $totalBannedUsers,
        ':total_banned_prompt'    => $totalBannedPrompt,
        ':total_pending_reports'  => $totalPendingReports,
    ]);

    $done = true;
}
?>

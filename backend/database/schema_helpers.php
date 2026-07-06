<?php
function db_has_table(PDO $pdo, string $table): bool
{
    static $cache = [];
    $key = $table;

    if (!array_key_exists($key, $cache)) {
        $stmt = $pdo->prepare(
            "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?"
        );
        $stmt->execute([$table]);
        $cache[$key] = (int)$stmt->fetchColumn() > 0;
    }

    return $cache[$key];
}

function db_has_column(PDO $pdo, string $table, string $column): bool
{
    static $cache = [];
    $key = $table . "." . $column;

    if (!array_key_exists($key, $cache)) {
        $stmt = $pdo->prepare(
            "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?"
        );
        $stmt->execute([$table, $column]);
        $cache[$key] = (int)$stmt->fetchColumn() > 0;
    }

    return $cache[$key];
}

function db_column_expr(PDO $pdo, string $table, string $column, string $qualifiedColumn, string $fallbackExpr): string
{
    return db_has_column($pdo, $table, $column) ? $qualifiedColumn : $fallbackExpr;
}

function db_first_existing_column(PDO $pdo, string $table, array $columns): ?string
{
    foreach ($columns as $column) {
        if (db_has_column($pdo, $table, $column)) {
            return $column;
        }
    }

    return null;
}

function prompt_permission_column(PDO $pdo): ?string
{
    return db_first_existing_column($pdo, 'prompts', ['permission', 'visibility']);
}

function prompt_permission_value(?string $value, ?string $column): string
{
    $normalized = strtolower(trim((string)$value));
    $normalized = str_replace(['_', ' '], '-', $normalized);

    if (in_array($normalized, ['only-followers', 'followers-only', 'following-only', 'only-follower'], true)) {
        return $column === 'permission' ? 'Only Follower' : 'followers_only';
    }

    if ($normalized === 'draft') {
        return $column === 'permission' ? 'Draft' : 'draft';
    }

    return $column === 'permission' ? 'Public' : 'public';
}

function prompt_public_value(?string $column): string
{
    return $column === 'permission' ? 'Public' : 'public';
}

function prompt_draft_value(?string $column): string
{
    return $column === 'permission' ? 'Draft' : 'draft';
}
?>
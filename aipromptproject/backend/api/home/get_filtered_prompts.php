<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

// 1. Point directly to the cache file created by the home page
$cacheFile = __DIR__ . "/../../cache/home-data.json";

if (!file_exists($cacheFile)) {
    echo json_encode(["success" => false, "message" => "Cache not found. Please load the home page first."]);
    exit;
}

// 2. Load and decode the cached data
$cacheData = json_decode(file_get_contents($cacheFile), true);
$allPrompts = isset($cacheData['prompts']) ? $cacheData['prompts'] : [];
$allCategories = isset($cacheData['categories']) ? $cacheData['categories'] : [];

// 3. Get the frontend filtering parameters
$input = json_decode(file_get_contents("php://input"), true);
$searchQuery = isset($input['search']) ? strtolower(trim($input['search'])) : '';
$modelFilter = isset($input['model']) ? $input['model'] : 'All';
$categoryFilter = isset($input['category']) ? $input['category'] : 'All';

// 4. Map the requested Category Name to its Category ID (because prompts table uses category_id)
$targetCategoryId = null;
if ($categoryFilter !== 'All') {
    foreach ($allCategories as $cat) {
        if ($cat['category_name'] === $categoryFilter) {
            $targetCategoryId = $cat['id'];
            break;
        }
    }
}

// 5. Run the in-memory array filter
$filteredPrompts = array_filter($allPrompts, function($prompt) use ($searchQuery, $modelFilter, $targetCategoryId) {
    
    // Check Model Match
    if ($modelFilter !== 'All' && $prompt['model_type'] !== $modelFilter) {
        return false;
    }
    
    // Check Category Match
    if ($targetCategoryId !== null && $prompt['category_id'] !== $targetCategoryId) {
        return false;
    }
    
    // Check Text Search (Matches against Title OR Description)
    if ($searchQuery !== '') {
        $titleMatch = strpos(strtolower($prompt['title']), $searchQuery) !== false;
        $descMatch = strpos(strtolower($prompt['prompt_description']), $searchQuery) !== false;
        
        if (!$titleMatch && !$descMatch) {
            return false;
        }
    }
    
    return true;
});

// Reset array keys so it encodes as a clean JSON array instead of an object
$filteredPrompts = array_values($filteredPrompts);

// 6. Return the filtered prompts AND the category list (so React can build the dropdown menu)
echo json_encode([
    "success" => true,
    "prompts" => $filteredPrompts,
    "categories" => $allCategories,
    "total_results" => count($filteredPrompts)
]);

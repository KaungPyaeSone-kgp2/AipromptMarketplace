<?php
  header("Content-Type: application/json; charset=UTF-8");
  header("Access-Control-Allow-Origin: *");
  header("Access-Control-Allow-Methods: GET, OPTIONS");
  header("Access-Control-Allow-Headers: Content-Type");

  if($_SERVER["REQUEST_METHOD"] === "OPTIONS"){
    http_response_code(204);
    exit;
  }
  require_once __DIR__ . "/../../config/Database.php";
  require_once __DIR__ . "/../../dao/BaseDAO.php";

  try{
    $db = new Database();
    $pdo = $db->connect();
  }catch(Exception $e){
    http_response_code(500);
    echo json_encode([
      "success" => false,
      "message" => "Database connection failed"
    ]);
    exit;
  }
    $dao = new BaseDAO($pdo);
    try{
      $select_query = "SELECT id, category_name FROM categories";
      $categories = $dao->select($select_query);
      echo json_encode([
        "success" => true,
        "data" => $categories,
      ]);
    }catch(Exception $e){
      http_response_code(500);
      echo json_encode([
        "success" => false,
        "message" => "Failed to retrieve categories"
      ]);
    }
?>


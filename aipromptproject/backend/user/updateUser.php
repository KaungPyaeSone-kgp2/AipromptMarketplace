<?php
  header("Content-Type: application/json : charset=UTF-8");
  header("Access-Control-Allow-Origin: *");
  header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
  header("Access-Control-Allow-Headers: Content-Type");

  if($_SERVER["REQUEST_METHOD"] === "OPTIONS"){
    http_response_code(204);
    exit;
  }
  require_once __DIR__ . "/../database/Database.php";
  require_once __DIR__ . "/../dao/BaseDAO.php";

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
    $data = json_decode(file_get_contents("php://input"), true);
    $update_query = "UPDATE users SET user_name = :user_name, user_email = :user_email, user_password = :user_password,  profile_image = :profile_image WHERE id = :user_id";
    $update_data = [
      ":user_name" => $data["user_name"],
      ":user_email" => $data["user_email"],
      ":user_password" => password_hash($data["user_password"], PASSWORD_DEFAULT),
      ":profile_image" => $data["profile_image"],
      ":user_id" => $data["id"]
    ];
    $dao->update($update_query, $update_data);
    echo json_encode([
        "success"=>true,
        "message"=>"User updated successfully"
    ]);
  } catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage(),
    ]);
  } 
?>
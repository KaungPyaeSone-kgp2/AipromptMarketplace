<?php

class Database {

    private $host;
    private $dbname;
    private $username;
    private $password;

    private $pdo;

    public function __construct() {
        $this->host     = getenv('DB_HOST')     ?: 'localhost';
        $this->dbname   = getenv('DB_NAME')     ?: 'image_prompt_db';
        $this->username = getenv('DB_USER')     ?: 'root';
        $this->password = getenv('DB_PASSWORD') ?: 'kmd123!@#';
    }

    public function connect() {

        try {

            $this->pdo = new PDO(
                "mysql:host={$this->host};dbname={$this->dbname};charset=utf8mb4",
                $this->username,
                $this->password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
                ]
            );

            return $this->pdo;

        } catch(PDOException $e) {

            die("Connection Failed : " . $e->getMessage());

        }

    }

}

?>
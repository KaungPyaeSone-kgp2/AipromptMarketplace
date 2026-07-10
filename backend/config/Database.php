<?php

class Database {

    private $host;
    private $dbname;
    private $username;
    private $password;
    private $port;

    public function __construct() {
        // Use Railway environment variables if available, otherwise fallback to local defaults
        $this->host = getenv('MYSQLHOST') ?: "localhost";
        $this->dbname = getenv('MYSQLDATABASE') ?: "image_prompt_db";
        $this->username = getenv('MYSQLUSER') ?: "root";
        $this->password = getenv('MYSQLPASSWORD') !== false ? getenv('MYSQLPASSWORD') : "kmd123!@#";
        $this->port = getenv('MYSQLPORT') ?: "3306";
    }

    private $pdo;

    public function connect() {

        try {
            $dsn = "mysql:host={$this->host};port={$this->port};dbname={$this->dbname};charset=utf8mb4";
            $this->pdo = new PDO(
                $dsn,
                $this->username,
                $this->password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
                ]
            );

            return $this->pdo;

        } catch(PDOException $e) {
            // Throw exception instead of die() so APIs can catch it and return JSON errors
            throw new Exception("Connection Failed : " . $e->getMessage());
        }

    }

}

?>
<?php

class Database {

    private $host;
    private $dbname;
    private $username;
    private $password;

    private $pdo;

    private $port;

    public function __construct() {
        // Support custom env vars OR Railway's default MySQL plugin vars
        $this->host     = getenv('DB_HOST')     ?: getenv('MYSQLHOST') ?: getenv('MYSQL_HOST') ?: 'localhost';
        $this->dbname   = getenv('DB_NAME')     ?: getenv('MYSQLDATABASE') ?: getenv('MYSQL_DATABASE') ?: 'image_prompt_db';
        $this->username = getenv('DB_USER')     ?: getenv('MYSQLUSER') ?: getenv('MYSQL_USER') ?: 'root';
        $this->password = getenv('DB_PASSWORD') ?: getenv('MYSQLPASSWORD') ?: getenv('MYSQL_PASSWORD') ?: 'kmd123!@#';
        $this->port     = getenv('DB_PORT')     ?: getenv('MYSQLPORT') ?: getenv('MYSQL_PORT') ?: '3306';
    }

    public function connect() {

        try {

            $this->pdo = new PDO(
                "mysql:host={$this->host};port={$this->port};dbname={$this->dbname};charset=utf8mb4",
                $this->username,
                $this->password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
                ]
            );

            return $this->pdo;

        } catch(PDOException $e) {
            throw new Exception("Connection Failed : " . $e->getMessage());
        }

    }

}

?>
<?php

class Database {

    private $host = "localhost";
    private $dbname = "image_prompt_db";
    private $username = "root";
    private $password = "kmd123!@#";

    private $pdo;

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
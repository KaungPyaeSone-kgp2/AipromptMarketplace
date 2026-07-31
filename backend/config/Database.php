<?php

class Database {

    private $host;
    private $dbname;
    private $username;
    private $password;
    private $port;

    public function __construct() {
        // Use Railway environment variables if available, otherwise fallback to local defaults
        $this->host = getenv('DB_HOST') ?: "localhost";
        $this->dbname = getenv('DB_NAME') ?: "image_prompt_db";
        $this->username = getenv('DB_USER') ?: "root";
        $this->password = getenv('DB_PASSWORD') !== false ? getenv('DB_PASSWORD') : "kmd123!@#";
        $this->port = getenv('DB_PORT') ?: "3306";
    }

    private $pdo;

    public function connect() {

        try {
            $dsn = "mysql:host={$this->host};port={$this->port};dbname={$this->dbname};charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET time_zone = '+06:30'"
            ];
            if (defined('PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT')) {
                $options[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = false;
            }

            $this->pdo = new PDO(
                $dsn,
                $this->username,
                $this->password,
                $options
            );

            return $this->pdo;

        } catch(PDOException $e) {
            // Throw exception instead of die() so APIs can catch it and return JSON errors
            $debug = " [Debug: Host=" . ($this->host ?: 'empty') . ", User=" . ($this->username ?: 'empty') . ", DB=" . ($this->dbname ?: 'empty') . "]";
            throw new Exception("Connection Failed : " . $e->getMessage() . $debug);
        }

    }

}

?>
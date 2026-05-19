<?php

class BaseDAO {

    private $pdo;

    public function __construct($pdo) {

        $this->pdo = $pdo;

    }

    /*
    |--------------------------------------------------------------------------
    | CORE QUERY RUNNER
    |--------------------------------------------------------------------------
    */

    private function run($sql, $data = []) {

        try {

            $stmt = $this->pdo->prepare($sql);

            $stmt->execute($data);

            return $stmt;

        } catch(PDOException $e) {

            error_log($e->getMessage());

            throw new Exception(
                "Database Operation Failed"
            );

        }

    }

    /*
    |--------------------------------------------------------------------------
    | SELECT
    |--------------------------------------------------------------------------
    */

    public function select($sql, $data = []) {

        $stmt = $this->run($sql, $data);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);

    }

    /*
    |--------------------------------------------------------------------------
    | INSERT
    |--------------------------------------------------------------------------
    */

    public function insert($sql, $data = []) {

        $this->run($sql, $data);

        return $this->pdo->lastInsertId();

    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE
    |--------------------------------------------------------------------------
    */

    public function update($sql, $data = []) {

        $stmt = $this->run($sql, $data);

        return $stmt->rowCount();

    }

    /*
    |--------------------------------------------------------------------------
    | DELETE
    |--------------------------------------------------------------------------
    */

    public function delete($sql, $data = []) {

        $stmt = $this->run($sql, $data);

        return $stmt->rowCount();

    }

    /*
    |--------------------------------------------------------------------------
    | TRANSACTION
    |--------------------------------------------------------------------------
    */

    public function transaction($queries = []) {

        try {

            $this->pdo->beginTransaction();

            $results = [];

            foreach($queries as $query) {

                $sql = $query['sql'];

                $data = $query['data'] ?? [];

                $stmt = $this->run($sql, $data);

                /*
                |--------------------------------------------------------------------------
                | STORE RESULT
                |--------------------------------------------------------------------------
                */

                $results[] = [
                    'rowCount' => $stmt->rowCount(),
                    'lastInsertId' => $this->pdo->lastInsertId()
                ];

            }

            $this->pdo->commit();

            return $results;

        } catch(Exception $e) {

            $this->pdo->rollBack();

            error_log($e->getMessage());

            throw new Exception(
                "Transaction Failed"
            );

        }

    }

}

?>
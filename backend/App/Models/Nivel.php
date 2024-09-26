<?php

namespace App\Models;

use App\Util\DB;
use Exception;
use PDO;
use Throwable;

class Nivel
{
    private $db;

    public function __construct()
    {
        $this->db = (new DB())->getConnection();
    }

    public function getAll($limit = 20, $offset = 0, $id = null)
    {
        // Consulta para contar o total de itens
        $countSql = "SELECT COUNT(*) AS total FROM niveis";
        
        $conditions = [];
        if ($id) {
            $conditions[] = "id = :id";
        }
    
        if ($conditions) {
            $countSql .= " WHERE " . implode(" AND ", $conditions);
        }
    
        $stmtCount = $this->db->prepare($countSql);
    
        if ($id) {
            $stmtCount->bindParam(':id', $id, PDO::PARAM_INT);
        }

    
        $stmtCount->execute();
        $totalItems = $stmtCount->fetchColumn();
    
        // Consulta para recuperar os dados paginados
        $sql = "SELECT * FROM niveis";
        
        if ($conditions) {
            $sql .= " WHERE " . implode(" AND ", $conditions);
        }
    
        $sql .= " ORDER BY id ASC LIMIT :limit OFFSET :offset";
        
        $stmt = $this->db->prepare($sql);
    
        if ($id) {
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        }

        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
    
        $this->executeStatement($stmt, 200, $totalItems, $limit, $offset);
    }

    public function save($body, $id = null)
    {
        if (empty($body['nivel'])) {
            $this->sendErrorResponse(400, "Favor informar nível na requisição");
        }

        if ($id) {
            $sql = "UPDATE niveis SET nivel = :nivel WHERE id = :id RETURNING *";
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        } else {
            $sql = "INSERT INTO niveis (nivel) VALUES (:nivel) RETURNING *";
            $stmt = $this->db->prepare($sql);
        }

        $stmt->bindParam(':nivel', $body['nivel'], PDO::PARAM_STR);
        $this->executeStatement($stmt, $id ? 200 : 201);
    }

    public function delete($id = null)
    {
        if (!$id) {
            $this->sendErrorResponse(400, "Favor informar identificador na requisição");
        }

        $sql = "DELETE FROM niveis WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);

        try {
            $this->executeStatement($stmt, 204);
        } catch (Throwable $e) {
            $this->handleDeletionException($e);
        }
    }

    private function executeStatement($stmt, $successStatus = 200, $totalItems = 1, $limit = 1, $offset = 1)
    {
        if (!$stmt->execute()) {
            $this->sendErrorResponse(500, $stmt->errorInfo()[2]);
        }
    
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if (empty($result)) {
            $this->sendErrorResponse(404, "Nenhum dado encontrado.");
        }
    
        echo json_encode([
            'status' => $successStatus,
            'data' => $result,
            'meta' => [
                'total' => $totalItems,
                'per_page' => $limit, // Número de itens por página
                'current_page' => ($offset / $limit) + 1,
                'last_page' => ceil($totalItems / $limit)
            ]
        ]);
        exit;
    }

    private function sendErrorResponse($statusCode, $message)
    {
        http_response_code($statusCode);
        echo json_encode(['status' => $statusCode, 'data' => ['mensagem' => $message]]);
        exit;
    }

    private function handleDeletionException(Throwable $e)
    {
        if (str_contains($e->getMessage(), 'desenvolvedores')) {
            $this->sendErrorResponse(500, "Não é possível excluir um nível referenciado na tabela de desenvolvedores");
        }
        $this->sendErrorResponse(500, $e->getMessage());
    }
}
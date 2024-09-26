<?php

namespace App\Models;

use App\Util\DB;
use DateTime;
use PDO;
use Throwable;

class Developer
{
    private $db;

    public function __construct()
    {
        $this->db = (new DB())->getConnection();
    }

    public function getAll($limit = 20, $offset = 0, $id = null)
    {
        // Consulta para contar o total de itens
        $countSql = "SELECT COUNT(*) AS total FROM desenvolvedores d";
        
        $conditions = [];
        if ($id) {
            $conditions[] = "d.id = :id";
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
        $sql = "SELECT d.id, nivel_id, nome, sexo, data_nascimento, 
                       DATE_PART('year', AGE(CURRENT_DATE, d.data_nascimento)) AS idade, 
                       hobby, n.nivel 
                FROM desenvolvedores d
                INNER JOIN niveis n ON nivel_id = n.id";
        
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
        $this->validateAll($body);

        if (!$id) {
            $sql = "INSERT INTO desenvolvedores (nivel_id, nome, sexo, data_nascimento, hobby) 
                    VALUES (:nivel_id, :nome, :sexo, :data_nascimento, :hobby) RETURNING *";
            $stmt = $this->db->prepare($sql);
            http_response_code(201);
        } else {
            $sql = "UPDATE desenvolvedores 
                    SET nivel_id = :nivel_id, nome = :nome, sexo = :sexo, data_nascimento = :data_nascimento, hobby = :hobby 
                    WHERE id = :id RETURNING *";
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            http_response_code(200);
        }

        $stmt->bindParam(':nivel_id', $body['nivel_id'], PDO::PARAM_INT);
        $stmt->bindParam(':nome', $body['nome'], PDO::PARAM_STR);
        $stmt->bindParam(':sexo', $body['sexo'], PDO::PARAM_STR);
        $stmt->bindParam(':data_nascimento', $body['data_nascimento'], PDO::PARAM_STR);
        $stmt->bindParam(':hobby', $body['hobby'], PDO::PARAM_STR);

        $this->executeStatement($stmt, $id ? 200 : 201);
    }

    public function delete($id = null)
    {
        if (!$id) {
            $this->sendErrorResponse(400, "Favor informar id na requisição");
        }

        $sql = "DELETE FROM desenvolvedores WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);

        $this->executeStatement($stmt, 204);
    }


    private function executeStatement($stmt, $successStatus = 200, $totalItems = 1, $limit = 1, $offset = 1)
    {
        try {
        if (!$stmt->execute()) {
            $this->sendErrorResponse(500, $stmt->errorInfo()[2]);
        }
    
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if (empty($result)) {
            $this->sendErrorResponse(404, "Nenhum dado encontrado.");
        }

        foreach ($result as $key => $item) {
            if ($result[$key]['nivel'] ?? null) {
                $result[$key]['nivel'] = ["id" => $item['nivel_id'], "nivel" => $item['nivel']];
            }
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
    } catch (Throwable $e) {
        $this->handleException($e);
    }
        exit;
}

    private function sendErrorResponse($statusCode, $message)
    {
        http_response_code($statusCode);
        echo json_encode(['status' => $statusCode, 'data' => ['mensagem' => $message]]);
        exit;
    }

    private function handleException(Throwable $e)
    {
        if (str_contains($e->getMessage(), 'nivel_id')) {
            $this->sendErrorResponse(500, "Nível informado não existe na tabela de níveis.");
        }
        $this->sendErrorResponse(500, $e->getMessage());
    }

    private function validateAll($body)
    {
        $validation = [];

        if (empty($body['nivel_id']) || intval($body['nivel_id']) <= 0) {
            $validation['nivel_id'] = "Preencha o campo nivel_id na requisição";
        }
        if (empty($body['nome']) || strlen($body['nome']) <= 0) {
            $validation['nome'] = "Preencha o campo nome na requisição";
        }
        if (empty($body['sexo']) || strlen($body['sexo']) != 1) {
            $validation['sexo'] = "Preencha o campo sexo do indivíduo na requisição, M (Masculino), F (Feminino) ou Outro, apenas 1 (um) caractere";
        }
        $this->validateAge($body, $validation);
        if (empty($body['hobby']) || strlen($body['hobby']) <= 0) {
            $validation['hobby'] = "Preencha o campo hobby na requisição";
        }
        if (!empty($validation)) {
            $this->sendErrorResponse(400, $validation);
        }
    }

    private function validateAge($body, array &$validation)
    {
        if (empty($body['data_nascimento'])) {
            $validation['data_nascimento'] = "Preencha o campo data de nascimento na requisição";
            return;
        }

        $date = new DateTime($body['data_nascimento']);
        $today = new DateTime();
        $age = $date->diff($today)->y;

        if ($age < 16) {
            $validation['data_nascimento'] = "Indivíduo precisa ter mais de 16 anos.";
        }
    }
}
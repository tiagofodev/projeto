<?php

namespace App\Controllers;

use App\Models\Developer;
use App\Models\Nivel;

class Controller
{
    public function __construct()
    {
        $this->manageMethod($_SERVER['REQUEST_METHOD']);
    }

    public function getAll()
    {
        $uri = explode('/', $_SERVER['REDIRECT_URL']);
        $limit = $_GET['limit'] ?? 20;
        $offset = $_GET['offset'] ?? 0;

        if (($uri[2] ?? "") == 'niveis') {
            $nivelModel = new Nivel();
            $nivelModel->getAll($limit, $offset, intval($uri[3] ?? null));
        }

        if (($uri[2] ?? "") == 'desenvolvedores') {
            $nivelModel = new Developer();
            $nivelModel->getAll($limit, $offset, intval($uri[3] ?? null));
        } else {
            echo json_encode(array("status" => 404, "data" => array("mensagem" => "Rota não encontrada.")));
            exit;
        }
    }


    public function save($isPost = true)
    {
        $body = file_get_contents('php://input');
        $body = json_decode($body, true);

        $uri = explode('/', $_SERVER['REDIRECT_URL']);
        if (!$isPost && intval($uri[3] ?? 0) <= 0) {
            http_response_code(400);
            echo json_encode(array("status" => 400, "data" => array("mensagem" => "Por favor, informar id na requisição.")));
            exit;
        }
        if (($uri[2] ?? "") == 'niveis') {
            $nivelModel = new Nivel();
            $nivelModel->save( $body, $isPost ? null : intval($uri[3] ?? null));
        }
        if (($uri[2] ?? "") == 'desenvolvedores') {
            $developerModel = new Developer();
            $developerModel->save( $body, $isPost ? null : intval($uri[3] ?? null));
        } else {
            echo json_encode(array("status" => 404, "data" => array("mensagem" => "Rota não encontrada.")));
            exit;
        }
    }

    public function delete()
    {
        $uri = explode('/', $_SERVER['REDIRECT_URL']);
        // print_r(intval($uri[3] ?? 0));die();
        if (intval($uri[3] ?? 0) <= 0) {
            http_response_code(400);
            echo json_encode(array("status" => 400, "data" => array("mensagem" => "Por favor, informar id na requisição.")));
            exit;
        }
        if (($uri[2] ?? "") == 'niveis') {
            $nivelModel = new Nivel();
            $nivelModel->delete(intval($uri[3] ?? 0));
        }
        if (($uri[2] ?? "") == 'desenvolvedores') {
            $nivelModel = new Developer();
            $nivelModel->delete(intval($uri[3] ?? 0));
        } else {
            echo json_encode(array("status" => 404, "data" => array("mensagem" => "Rota não encontrada.")));
            exit;
        }
    }

    public function manageMethod(string $method)
    {
        $method = strtoupper($method);
        switch ($method) {
            case 'GET':
                $this->getAll();
                break;
            case 'POST':
                $this->save(true);
                break;
            case 'PUT':
                $this->save(false);
                break;
            case 'DELETE':
                $this->delete();
                break;
            default:
                echo json_encode(array("status" => 404, "data" => array("mensagem" => "Método não encontrado.")));
                break;
        }
        exit;
    }
}
<?php

namespace App\Util;
use PDO;

class DB
{

    public function getConnection(): PDO|null
    {
        if (file_exists("./../.env")) {
            $env = parse_ini_file("./../.env");
            $db_name = $env['POSTGRES_DB'];
            $db_host = $env['POSTGRES_HOST'];
            $db_user = $env['POSTGRES_USER'];
            $db_pass = $env['POSTGRES_PASSWORD'];
            $db_port = $env['POSTGRES_DOCKER_PORT'];
            //Executando a Conexao com o Banco de dados
            $conn = new PDO("pgsql:dbname=" . $db_name . ";host=" . $db_host.';port='.$db_port, $db_user, $db_pass);
            //Habilitar erros PDO
            $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
            return $conn;
        }
        return null;
    }

}
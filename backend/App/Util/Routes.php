<?php
namespace App\Util;

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header("Access-Control-Allow-Headers: Content-Type");
header("Content-type: application/json");
use App\Controllers\Controller;

class Routes
{
    public function __construct()
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header("Access-Control-Allow-Headers: Content-Type");
        header("Content-type: application/json");
        $this->whatAmICalling();
    }


    public function whatAmICalling()
    {
        new Controller();
        exit;
    }

}

?>
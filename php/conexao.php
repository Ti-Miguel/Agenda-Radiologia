<?php
date_default_timezone_set('America/Sao_Paulo');

$host = "localhost";
$banco = "u380360322_agendaradio";
$usuario = "u380360322_agendaradio";
$senha = "Miguel847829";

$conn = new mysqli($host, $usuario, $senha, $banco);

if ($conn->connect_error) {
    die("Erro na conexão: " . $conn->connect_error);
}

$conn->set_charset("utf8");
?>
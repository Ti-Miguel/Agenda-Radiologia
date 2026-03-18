<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Cache-Control: post-check=0, pre-check=0', false);
header('Pragma: no-cache');
header('Expires: 0');

require 'conexao.php';

$sql = "SELECT * FROM lancamentos_radiologia ORDER BY id DESC";
$result = $conn->query($sql);

$lancamentos = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $lancamentos[] = $row;
    }
}

echo json_encode([
    'success' => true,
    'data' => $lancamentos
]);

$conn->close();
?>
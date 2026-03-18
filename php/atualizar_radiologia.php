<?php
header('Content-Type: application/json; charset=utf-8');
require 'conexao.php';

$id = $_POST['id'] ?? 0;
$realizado = $_POST['realizado'] ?? 'Não';

$stmt = $conn->prepare("UPDATE lancamentos_radiologia SET realizado = ? WHERE id = ?");
$stmt->bind_param("si", $realizado, $id);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Status atualizado com sucesso!']);
} else {
    echo json_encode(['success' => false, 'message' => 'Erro ao atualizar status.']);
}

$stmt->close();
$conn->close();
?>
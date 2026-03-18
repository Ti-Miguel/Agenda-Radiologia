<?php
header('Content-Type: application/json; charset=utf-8');
require 'conexao.php';

$id = $_POST['id'] ?? 0;

$stmt = $conn->prepare("DELETE FROM lancamentos_radiologia WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Lançamento excluído com sucesso!']);
} else {
    echo json_encode(['success' => false, 'message' => 'Erro ao excluir lançamento.']);
}

$stmt->close();
$conn->close();
?>
<?php
header('Content-Type: application/json; charset=utf-8');
require 'conexao.php';

$id = $_POST['id'] ?? 0;
$nome = $_POST['nome'] ?? '';
$nascimento = $_POST['nascimento'] ?? '';
$cpf = $_POST['cpf'] ?? '';
$telefone = $_POST['telefone'] ?? '';
$status_pagamento = $_POST['status_pagamento'] ?? '';
$tipo_exame = $_POST['tipo_exame'] ?? '';
$valor_pago = $_POST['valor_pago'] ?? 0;
$unidade = $_POST['unidade'] ?? '';
$quem_lancou = $_POST['quem_lancou'] ?? '';

if ($status_pagamento === 'Bonificado') {
    $valor_pago = 0;
}

$stmt = $conn->prepare("UPDATE lancamentos_radiologia 
SET nome=?, nascimento=?, cpf=?, telefone=?, status_pagamento=?, tipo_exame=?, valor_pago=?, unidade=?, quem_lancou=?
WHERE id=?");

$stmt->bind_param(
    "ssssssdssi",
    $nome,
    $nascimento,
    $cpf,
    $telefone,
    $status_pagamento,
    $tipo_exame,
    $valor_pago,
    $unidade,
    $quem_lancou,
    $id
);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Lançamento atualizado com sucesso!']);
} else {
    echo json_encode(['success' => false, 'message' => 'Erro ao atualizar lançamento.']);
}

$stmt->close();
$conn->close();
?>
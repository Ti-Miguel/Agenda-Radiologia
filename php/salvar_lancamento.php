<?php
header('Content-Type: application/json; charset=utf-8');
require 'conexao.php';

date_default_timezone_set('America/Sao_Paulo');

$nome = $_POST['nome'] ?? '';
$nascimento = $_POST['nascimento'] ?? '';
$cpf = $_POST['cpf'] ?? '';
$telefone = $_POST['telefone'] ?? '';
$status_pagamento = $_POST['status_pagamento'] ?? '';
$tipo_exame = $_POST['tipo_exame'] ?? '';
$valor_pago = $_POST['valor_pago'] ?? 0;
$unidade = $_POST['unidade'] ?? '';
$quem_lancou = $_POST['quem_lancou'] ?? '';
$data_lancamento = $_POST['data_lancamento'] ?? date('Y-m-d');

if ($status_pagamento === 'Bonificado') {
    $valor_pago = 0;
}

if (
    empty($nome) || empty($nascimento) || empty($cpf) || empty($telefone) ||
    empty($status_pagamento) || empty($tipo_exame) || empty($unidade) || empty($quem_lancou)
) {
    echo json_encode(['success' => false, 'message' => 'Preencha todos os campos obrigatórios.']);
    exit;
}

$stmt = $conn->prepare("INSERT INTO lancamentos_radiologia 
(nome, nascimento, cpf, telefone, data_lancamento, status_pagamento, tipo_exame, valor_pago, unidade, quem_lancou, realizado)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Não')");

$stmt->bind_param(
    "sssssssdss",
    $nome,
    $nascimento,
    $cpf,
    $telefone,
    $data_lancamento,
    $status_pagamento,
    $tipo_exame,
    $valor_pago,
    $unidade,
    $quem_lancou
);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Lançamento salvo com sucesso!']);
} else {
    echo json_encode(['success' => false, 'message' => 'Erro ao salvar lançamento.']);
}

$stmt->close();
$conn->close();
?>
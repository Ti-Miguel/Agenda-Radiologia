<?php
header('Content-Type: application/json; charset=utf-8');
require 'conexao.php';

date_default_timezone_set('America/Sao_Paulo');

$nome = $_POST['nome'] ?? '';
$nascimento = $_POST['nascimento'] ?? '';
$cpf = $_POST['cpf'] ?? '';
$telefone = $_POST['telefone'] ?? '';
$dr = $_POST['dr'] ?? '';

$status_pagamento = $_POST['status_pagamento'] ?? '';
$tipo_exame = $_POST['tipo_exame'] ?? '';
$valor_pago = $_POST['valor_pago'] ?? 0;
$unidade = $_POST['unidade'] ?? '';
$quem_lancou = $_POST['quem_lancou'] ?? '';

$data_lancamento = $_POST['data_lancamento'] ?? date('Y-m-d');
$horario_lancamento = date('H:i:s');

if ($status_pagamento === 'Bonificado') {
    $valor_pago = 0;
}

if (
    empty($nome) ||
    empty($nascimento) ||
    empty($cpf) ||
    empty($telefone) ||
    empty($dr) ||
    empty($status_pagamento) ||
    empty($tipo_exame) ||
    empty($unidade) ||
    empty($quem_lancou)
) {
    echo json_encode([
        "success" => false,
        "message" => "Preencha todos os campos obrigatórios."
    ]);
    exit;
}

$stmt = $conn->prepare("
    INSERT INTO lancamentos_radiologia
    (
        nome,
        nascimento,
        cpf,
        telefone,
        dr,
        data_lancamento,
        horario_lancamento,
        status_pagamento,
        tipo_exame,
        valor_pago,
        unidade,
        quem_lancou,
        realizado
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Não')
");

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => $conn->error
    ]);
    exit;
}

$stmt->bind_param(
    "sssssssssdss",
    $nome,
    $nascimento,
    $cpf,
    $telefone,
    $dr,
    $data_lancamento,
    $horario_lancamento,
    $status_pagamento,
    $tipo_exame,
    $valor_pago,
    $unidade,
    $quem_lancou
);

if ($stmt->execute()) {

    echo json_encode([
        "success" => true,
        "message" => "Lançamento salvo com sucesso!"
    ]);

} else {

    echo json_encode([
        "success" => false,
        "message" => $stmt->error
    ]);

}

$stmt->close();
$conn->close();
?>
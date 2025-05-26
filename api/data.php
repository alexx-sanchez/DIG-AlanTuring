<?php

$db = new SQLite3('database.db');

// Validar parámetro obligatorio
if (!isset($_GET['provincia'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Falta el parámetro obligatorio: provincia']);
    exit;
}

$provincia = $_GET['provincia'];
$any = isset($_GET['any']) ? $_GET['any'] : '';
$mes = isset($_GET['mes']) ? $_GET['mes'] : '';

// Construir la consulta dinámicamente
$where = 'Provincia = :provincia';
if ($any !== '') {
    $where .= ' AND Any = :any';
}
if ($mes !== '') {
    $where .= ' AND Mes = :mes';
}

$query = "SELECT * FROM aigua WHERE $where ORDER BY Any, Mes";
$stmt = $db->prepare($query);

// Asignar valores
$stmt->bindValue(':provincia', $provincia, SQLITE3_TEXT);
if ($any !== '') {
    $stmt->bindValue(':any', $any, SQLITE3_INTEGER);
}
if ($mes !== '') {
    $stmt->bindValue(':mes', $mes, SQLITE3_INTEGER);
}

// Ejecutar y recoger resultados
$result = $stmt->execute();
$data = [];
while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
    $data[] = $row;
}

// Devolver como JSON
header('Content-Type: application/json');
echo json_encode($data);
?>

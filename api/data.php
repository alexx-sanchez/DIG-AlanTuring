<?php
$db = new SQLite3('database.db');

if (!isset($_GET['provincia'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Falta el parámetro obligatorio: provincia']);
    exit;
}

$provincia = $_GET['provincia'];
$any = isset($_GET['any']) && is_numeric($_GET['any']) ? (int)$_GET['any'] : '';
$mes = isset($_GET['mes']) && is_numeric($_GET['mes']) ? (int)$_GET['mes'] : '';

error_log("Provincia: $provincia, Any: $any, Mes: $mes");

$where = 'Provincia = :provincia';
if ($any !== '') {
    $where .= ' AND Any = :any';
}
if ($mes !== '') {
    $where .= ' AND Mes = :mes';
}

$query = "SELECT * FROM aigua WHERE $where ORDER BY Any, Mes";
$stmt = $db->prepare($query);

if (!$stmt) {
    error_log("Error preparando la consulta: " . $db->lastErrorMsg());
    http_response_code(500);
    echo json_encode(['error' => 'Error en la consulta']);
    exit;
}

$stmt->bindValue(':provincia', $provincia, SQLITE3_TEXT);
if ($any !== '') {
    $stmt->bindValue(':any', $any, SQLITE3_INTEGER);
}
if ($mes !== '') {
    $stmt->bindValue(':mes', $mes, SQLITE3_INTEGER);
}

$result = $stmt->execute();
$data = [];
while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
    $data[] = $row;
}

header('Content-Type: application/json');
echo json_encode($data);
?>

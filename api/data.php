<?php

/**PETICION GET POR ANY - MES Y PROVINCIA*/
$db = new SQLite3('database.db');

// Validar parámetros
if (!isset($_GET['any']) || !isset($_GET['mes']) || !isset($_GET['provincia'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Faltan parámetros: any, mes y provincia']);
    exit;
}

$any = ($_GET['any']);
$mes = ($_GET['mes']);
$provincia = $_GET['provincia'];

// Preparar y ejecutar la consulta
$stmt = $db->prepare('
    SELECT * FROM aigua 
    WHERE Any = :any AND Mes = :mes AND Provincia = :provincia
');
$stmt->bindValue(':any', $any, SQLITE3_INTEGER);
$stmt->bindValue(':mes', $mes, SQLITE3_INTEGER);
$stmt->bindValue(':provincia', $provincia, SQLITE3_TEXT);

$result = $stmt->execute();

// Recoger los resultados
$data = [];
while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
    $data[] = $row;
}

// Devolver en JSON
header('Content-Type: application/json');
echo json_encode($data);

?>

<?php
// Habilitar la visualización de errores para depuración (desactívalo en producción)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Verificar si el archivo de la base de datos existe
$databasePath = __DIR__ . '/database.db';
if (!file_exists($databasePath)) {
    http_response_code(500);
    echo json_encode(['error' => 'El archivo de la base de datos no existe en: ' . $databasePath]);
    exit;
}

// Conectar a la base de datos SQLite
try {
    $db = new SQLite3($databasePath);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al conectar con la base de datos: ' . $e->getMessage()]);
    exit;
}

// Verificar si la tabla 'aigua' existe
$result = $db->query("SELECT name FROM sqlite_master WHERE type='table' AND name='aigua'");
if (!$result->fetchArray()) {
    http_response_code(500);
    echo json_encode(['error' => 'La tabla aigua no existe en la base de datos']);
    exit;
}

// Verificar si el parámetro 'provincia' está presente
if (!isset($_GET['provincia']) || empty(trim($_GET['provincia']))) {
    http_response_code(400);
    echo json_encode(['error' => 'Falta el parámetro obligatorio: provincia']);
    exit;
}

$provincia = trim($_GET['provincia']);
$any = isset($_GET['any']) && is_numeric($_GET['any']) ? (int)$_GET['any'] : '';
$mes = isset($_GET['mes']) && is_numeric($_GET['mes']) ? (int)$_GET['mes'] : '';

error_log("Consulta - Provincia: $provincia, Año: $any, Mes: $mes");

// Construir la cláusula WHERE dinámicamente
$where = 'Provincia = :provincia';
$params = [':provincia' => $provincia];
if ($any !== '') {
    $where .= ' AND Any = :any';
    $params[':any'] = $any;
}
if ($mes !== '') {
    $where .= ' AND Mes = :mes';
    $params[':mes'] = $mes;
}

// Consulta para seleccionar las métricas de consumo, con énfasis en per cápita
$query = "
    SELECT Provincia, 
           Any,
           Consum_per_capita, 
           Consum_personal_anual,  
           Consumo_Anual
    FROM aigua 
    WHERE $where 
    ORDER BY Any, Mes
";

try {
    $stmt = $db->prepare($query);
    if (!$stmt) {
        throw new Exception('Error preparando la consulta: ' . $db->lastErrorMsg());
    }

    // Vincular parámetros
    foreach ($params as $key => $value) {
        if (is_int($value)) {
            $stmt->bindValue($key, $value, SQLITE3_INTEGER);
        } else {
            $stmt->bindValue($key, $value, SQLITE3_TEXT);
        }
    }

    // Ejecutar la consulta
    $result = $stmt->execute();
    $data = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $data[] = $row;
    }

    // Verificar si se encontraron resultados
    if (empty($data)) {
        http_response_code(404);
        echo json_encode(['message' => 'No se encontraron datos para los filtros proporcionados']);
        exit;
    }

    // Devolver los resultados en formato JSON
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_PRETTY_PRINT);

} catch (Exception $e) {
    error_log("Error en la consulta: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Error en la consulta: ' . $e->getMessage()]);
}

// Cerrar la conexión
$db->close();

//http://tu-servidor/api/consumo_per_capita.php?provincia=Barcelona&any=2022

//http://tu-servidor/api/consumo_per_capita.php?provincia=Girona&any=2023&mes=6

?>
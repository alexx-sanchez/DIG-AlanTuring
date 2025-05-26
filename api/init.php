<?php

$db = new SQLite3('database.db');

// Crear la tabla 'aigua'
$db->exec('
CREATE TABLE IF NOT EXISTS aigua (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    Any INTEGER,
    Mes INTEGER,
    Percentatge_embassat INTEGER,
    Volum_embassat_hm3 INTEGER,
    Provincia TEXT,
    Codi_comarca TEXT,
    Comarcas TEXT,
    Poblacio INTEGER,
    Domestic_xarxa INTEGER,
    Activitats_propies INTEGER,
    Consumo_Anual INTEGER,
    Consum_personal_anual INTEGER,
    Consumo_mensual INTEGER,
    NumComarcas INTEGER,
    Consum_per_capita INTEGER
);
');

// Abrir el archivo CSV
$csv = fopen('data_updated.csv', 'r');
fgetcsv($csv); // Saltar la cabecera

while (($row = fgetcsv($csv)) !== false) {
    // Preparar valores
    $stmt = $db->prepare('
        INSERT INTO aigua (
            Any, Mes, Percentatge_embassat, Volum_embassat_hm3, Provincia,
            Codi_comarca, Comarcas, Poblacio, Domestic_xarxa, Activitats_propies,
            Consumo_Anual, Consum_personal_anual, Consumo_mensual,
            NumComarcas, Consum_per_capita
        ) VALUES (
            :any, :mes, :percentatge, :volum, :provincia,
            :codi, :comarcas, :poblacio, :domestic, :activitats,
            :consum_anual, :consum_personal, :consum_mensual,
            :numcomarcas, :per_capita
        )
    ');

    $stmt->bindValue(':any', $row[0], SQLITE3_INTEGER);
    $stmt->bindValue(':mes', $row[1], SQLITE3_INTEGER);
    $stmt->bindValue(':percentatge', $row[2], SQLITE3_INTEGER);
    $stmt->bindValue(':volum', $row[3], SQLITE3_INTEGER);
    $stmt->bindValue(':provincia', $row[4], SQLITE3_TEXT);
    $stmt->bindValue(':codi', $row[5], SQLITE3_TEXT);
    $stmt->bindValue(':comarcas', $row[6], SQLITE3_TEXT);
    $stmt->bindValue(':poblacio', $row[7], SQLITE3_INTEGER);
    $stmt->bindValue(':domestic', $row[8], SQLITE3_INTEGER);
    $stmt->bindValue(':activitats', $row[9], SQLITE3_INTEGER);
    $stmt->bindValue(':consum_anual', $row[10], SQLITE3_INTEGER);
    $stmt->bindValue(':consum_personal', $row[11], SQLITE3_INTEGER);
    $stmt->bindValue(':consum_mensual', $row[12], SQLITE3_INTEGER);
    $stmt->bindValue(':numcomarcas', $row[13], SQLITE3_INTEGER);
    $stmt->bindValue(':per_capita', $row[14], SQLITE3_INTEGER);

    $stmt->execute();
}

fclose($csv);
echo "Base de datos creada e inicializada.";

?>

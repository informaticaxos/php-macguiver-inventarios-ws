<?php

/**
 * Configuración de la base de datos
 * Utiliza PDO para la conexión a MySQL
 */
class Database
{
    private static $pdo = null;

    /**
     * Obtiene la conexión a la base de datos
     *
     * @return PDO
     */
    public static function getConnection()
    {
        if (self::$pdo === null) {
            $host = 'srv1575.hstgr.io'; // Cambiar según configuración
            $db = 'u564798502_macguiver'; // Nombre de la base de datos
            $user = 'u564798502_macguiver'; // Usuario de la base de datos
            $pass = 'Macguiver4747'; // Contraseña de la base de datos

            $dsn = "mysql:host=$host;dbname=$db;charset=utf8";
            self::$pdo = new PDO($dsn, $user, $pass);
            self::$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        }

        return self::$pdo;
    }
}

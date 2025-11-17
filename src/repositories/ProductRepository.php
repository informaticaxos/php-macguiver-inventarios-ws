<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/ProductModel.php';

/**
 * Repositorio para la entidad Product
 * Encapsula las operaciones CRUD contra la base de datos
 */
class ProductRepository
{
    private $pdo;

    /**
     * Constructor: obtiene la conexión a la base de datos
     */
    public function __construct()
    {
        $this->pdo = Database::getConnection();
    }

    /**
     * Obtiene todos los registros de products
     *
     * @return array
     */
    public function findAll()
    {
        $stmt = $this->pdo->query("SELECT * FROM products");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Obtiene un product por ID
     *
     * @param int $id
     * @return array|null
     */
    public function findById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM products WHERE id_product = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Obtiene un product por code
     *
     * @param string $code
     * @return array|null
     */
    public function findByCode($code)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM products WHERE code = ?");
        $stmt->execute([$code]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Obtiene un product por aux
     *
     * @param int $aux
     * @return array|null
     */
    public function findByAux($aux)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM products WHERE aux = ?");
        $stmt->execute([$aux]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Guarda un product (inserta si no tiene ID, actualiza si lo tiene)
     *
     * @param Product $product
     */
    public function save(Product $product)
    {
        if ($product->getIdProduct()) {
            // Actualizar
            $stmt = $this->pdo->prepare("UPDATE products SET brand = ?, description = ?, stock = ?, cost = ?, pvp = ?, min = ?, code = ?, aux = ? WHERE id_product = ?");
            $stmt->execute([
                $product->getBrand(),
                $product->getDescription(),
                $product->getStock(),
                $product->getCost(),
                $product->getPvp(),
                $product->getMin(),
                $product->getCode(),
                $product->getAux(),
                $product->getIdProduct()
            ]);
        } else {
            // Insertar
            $stmt = $this->pdo->prepare("INSERT INTO products (brand, description, stock, cost, pvp, min, code, aux) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $product->getBrand(),
                $product->getDescription(),
                $product->getStock(),
                $product->getCost(),
                $product->getPvp(),
                $product->getMin(),
                $product->getCode(),
                $product->getAux()
            ]);
            $product->setIdProduct($this->pdo->lastInsertId());
        }
    }

    /**
     * Guarda múltiples productos de manera eficiente usando transacciones
     *
     * @param array $products
     * @return int Número de productos insertados
     */
    public function bulkSave($products)
    {
        if (empty($products)) {
            return 0;
        }

        try {
            $this->pdo->beginTransaction();

            // Preparar la consulta de inserción
            $stmt = $this->pdo->prepare("INSERT INTO products (brand, description, stock, cost, pvp, min, code, aux) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

            $inserted = 0;
            foreach ($products as $product) {
                $stmt->execute([
                    $product['brand'],
                    $product['description'],
                    $product['stock'],
                    $product['cost'],
                    $product['pvp'],
                    $product['min'],
                    $product['code'],
                    $product['aux']
                ]);
                $inserted++;
            }

            $this->pdo->commit();
            return $inserted;

        } catch (Exception $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }

    /**
     * Obtiene el valor máximo del campo aux
     *
     * @return int|null
     */
    public function findMaxAux()
    {
        $stmt = $this->pdo->query("SELECT MAX(aux) as max_aux FROM products");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['max_aux'] ?? null;
    }

    /**
     * Elimina un product por ID
     *
     * @param int $id
     */
    public function delete($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM products WHERE id_product = ?");
        $stmt->execute([$id]);
    }

    /**
     * Busca productos por code, description o aux usando LIKE
     *
     * @param string $query
     * @return array
     */
    public function search($query)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM products WHERE code LIKE ? OR description LIKE ? OR aux LIKE ?");
        $searchTerm = '%' . $query . '%';
        $stmt->execute([$searchTerm, $searchTerm, $searchTerm]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Obtiene estadísticas del inventario: cantidad de productos y valor total
     *
     * @return array
     */
    public function getInventoryStats()
    {
        $stmt = $this->pdo->query("SELECT COUNT(*) as total_products, SUM(cost * stock) as total_value FROM products");
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}

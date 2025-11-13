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
     * Guarda un product (inserta si no tiene ID, actualiza si lo tiene)
     *
     * @param Product $product
     */
    public function save(Product $product)
    {
        if ($product->getIdProduct()) {
            // Actualizar
            $stmt = $this->pdo->prepare("UPDATE products SET brand = ?, description = ?, stock = ?, cost = ?, pvp = ?, min = ?, code = ? WHERE id_product = ?");
            $stmt->execute([
                $product->getBrand(),
                $product->getDescription(),
                $product->getStock(),
                $product->getCost(),
                $product->getPvp(),
                $product->getMin(),
                $product->getCode(),
                $product->getIdProduct()
            ]);
        } else {
            // Insertar
            $stmt = $this->pdo->prepare("INSERT INTO products (brand, description, stock, cost, pvp, min, code) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $product->getBrand(),
                $product->getDescription(),
                $product->getStock(),
                $product->getCost(),
                $product->getPvp(),
                $product->getMin(),
                $product->getCode()
            ]);
            $product->setIdProduct($this->pdo->lastInsertId());
        }
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
}

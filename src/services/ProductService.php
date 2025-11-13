<?php

require_once __DIR__ . '/../repositories/ProductRepository.php';
require_once __DIR__ . '/../models/ProductModel.php';

/**
 * Servicio para la lógica de negocio de Product
 * Actúa como intermediario entre controladores y repositorios
 */
class ProductService
{
    private $repository;

    /**
     * Constructor: inicializa el repositorio
     */
    public function __construct()
    {
        $this->repository = new ProductRepository();
    }

    /**
     * Obtiene todos los products
     *
     * @return array
     */
    public function getAllProducts()
    {
        return $this->repository->findAll();
    }

    /**
     * Obtiene un product por ID
     *
     * @param int $id
     * @return array|null
     */
    public function getProductById($id)
    {
        return $this->repository->findById($id);
    }

    /**
     * Crea un nuevo product
     *
     * @param array $data
     * @return Product|null
     */
    public function createProduct($data)
    {
        // Validación básica (puede expandirse)
        if (empty($data['code'])) {
            return null; // Error de validación
        }

        // Verificar si el code ya existe
        if ($this->repository->findByCode($data['code'])) {
            return null; // Code ya existe
        }

        $product = new Product(null, $data['brand'] ?? '', $data['description'] ?? '', $data['stock'] ?? 0.0, $data['cost'] ?? 0.0, $data['pvp'] ?? 0.0, $data['min'] ?? 0, $data['code']);
        $this->repository->save($product);
        return $product;
    }

    /**
     * Actualiza un product existente
     *
     * @param int $id
     * @param array $data
     * @return Product|null
     */
    public function updateProduct($id, $data)
    {
        $existing = $this->repository->findById($id);
        if (!$existing) {
            return null;
        }

        // Validación básica
        if (empty($data['code'])) {
            return null;
        }

        // Verificar si el code ya existe en otro producto
        $existingCode = $this->repository->findByCode($data['code']);
        if ($existingCode && $existingCode['id_product'] != $id) {
            return null; // Code ya existe en otro producto
        }

        $product = new Product($id, $data['brand'] ?? $existing['brand'], $data['description'] ?? $existing['description'], $data['stock'] ?? $existing['stock'], $data['cost'] ?? $existing['cost'], $data['pvp'] ?? $existing['pvp'], $data['min'] ?? $existing['min'], $data['code']);
        $this->repository->save($product);
        return $product;
    }

    /**
     * Elimina un product por ID
     *
     * @param int $id
     */
    public function deleteProduct($id)
    {
        // Verificar que el product existe
        $product = $this->repository->findById($id);
        if (!$product) {
            return false;
        }

        $this->repository->delete($id);
        return true;
    }
}

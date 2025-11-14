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

        $product = new Product(null, $data['brand'] ?? '', $data['description'] ?? '', $data['stock'] ?? 0.0, $data['cost'] ?? 0.0, $data['pvp'] ?? 0.0, $data['min'] ?? 0, $data['code'], $data['aux'] ?? 0);
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

        $product = new Product($id, $data['brand'] ?? $existing['brand'], $data['description'] ?? $existing['description'], $data['stock'] ?? $existing['stock'], $data['cost'] ?? $existing['cost'], $data['pvp'] ?? $existing['pvp'], $data['min'] ?? $existing['min'], $data['code'], $data['aux'] ?? $existing['aux']);
        $this->repository->save($product);
        return $product;
    }

    /**
     * Importa productos desde el archivo JSON
     *
     * @return array
     */
    public function importProducts()
    {
        $filePath = __DIR__ . '/../../files/plantilla_precios.json';
        if (!file_exists($filePath)) {
            return ['success' => false, 'message' => 'File not found'];
        }

        $jsonContent = file_get_contents($filePath);
        $data = json_decode($jsonContent, true);
        if (!$data || !isset($data['products'])) {
            return ['success' => false, 'message' => 'Invalid JSON structure'];
        }

        $products = $data['products'];
        $imported = 0;
        $errors = [];
        $total = count($products);

        // Iniciar sesión para progreso
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
        $_SESSION['import_progress'] = 0;
        $_SESSION['import_total'] = $total;
        $_SESSION['import_current'] = 0;

        foreach ($products as $index => $productData) {
            try {
                // Actualizar progreso
                $_SESSION['import_current'] = $index + 1;
                $_SESSION['import_progress'] = round((($index + 1) / $total) * 100);

                // Validar datos básicos
                if (empty($productData['code'])) {
                    $errors[] = 'Missing code for product';
                    continue;
                }

                // Verificar si ya existe
                if ($this->repository->findByCode($productData['code'])) {
                    // Skip existing products
                    continue;
                }

                // Crear producto
                $product = new Product(
                    null,
                    $productData['brand'] ?? '',
                    $productData['description'] ?? '',
                    $productData['stock'] ?? 0,
                    $productData['cost'] ?? 0,
                    $productData['pvp'] ?? 0,
                    $productData['min'] ?? 0,
                    $productData['code'],
                    $productData['aux'] ?? 0
                );

                $this->repository->save($product);
                $imported++;
            } catch (Exception $e) {
                $errors[] = 'Error importing product ' . ($productData['code'] ?? 'unknown') . ': ' . $e->getMessage();
            }
        }

        $_SESSION['import_progress'] = 100;

        return [
            'success' => true,
            'imported' => $imported,
            'errors' => $errors,
            'total' => $total
        ];
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

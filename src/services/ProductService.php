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

        // Generar aux automáticamente: max_aux + 1
        $maxAux = $this->getMaxAux() ?? 0;
        $data['aux'] = (string)($maxAux + 1);

        $product = new Product(null, $data['brand'] ?? '', $data['description'] ?? '', $data['stock'] ?? 0, $data['cost'] ?? 0.0, $data['pvp'] ?? 0.0, $data['min'] ?? 0, $data['code'], $data['aux']);
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
     * Importa productos desde datos enviados por POST
     *
     * @param array $productsData
     * @return array
     */
    public function importProductsFromData($productsData)
    {
        if (!is_array($productsData)) {
            return ['success' => false, 'message' => 'Invalid products data'];
        }

        $products = $productsData;
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
                    $errors[] = 'Missing code for product at row ' . ($index + 1);
                    continue;
                }

                // Validar aux: debe ser string no vacío y único
                if (!isset($productData['aux']) || !is_string($productData['aux']) || empty($productData['aux'])) {
                    $errors[] = 'Invalid aux for product ' . $productData['code'] . ': must be non-empty string';
                    continue;
                }

                // Verificar si aux ya existe
                if ($this->repository->findByAux($productData['aux'])) {
                    $errors[] = 'Aux ' . $productData['aux'] . ' already exists for product ' . $productData['code'];
                    continue;
                }

                // Verificar si code ya existe
                if ($this->repository->findByCode($productData['code'])) {
                    $errors[] = 'Code ' . $productData['code'] . ' already exists';
                    continue;
                }

                // Crear producto
                $product = new Product(
                    null,
                    $productData['brand'] ?? '',
                    $productData['description'] ?? '',
                    $productData['stock'] ?? 0,
                    $productData['cost'] ?? 0.0,
                    $productData['pvp'] ?? 0.0,
                    $productData['min'] ?? 0,
                    $productData['code'],
                    $productData['aux']
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
     * Importa productos en masa de manera eficiente
     *
     * @param array $productsData
     * @return array
     */
    public function bulkImportProducts($productsData)
    {
        if (!is_array($productsData)) {
            return ['success' => false, 'message' => 'Invalid products data'];
        }

        $products = $productsData;
        $total = count($products);

        if ($total === 0) {
            return ['success' => false, 'message' => 'No products to import'];
        }

        // Obtener el max aux actual para generar nuevos
        $currentMaxAux = $this->getMaxAux() ?? 0;

        // Filtrar productos válidos y verificar duplicados
        $validProducts = [];
        $errors = [];

        foreach ($products as $index => $productData) {
            try {
                // Validar datos básicos
                if (empty($productData['code'])) {
                    $errors[] = 'Missing code for product at row ' . ($index + 1);
                    continue;
                }

                // Verificar si code ya existe
                if ($this->repository->findByCode($productData['code'])) {
                    // Skip existing products
                    continue;
                }

                // Generar aux automáticamente: incrementar max_aux
                $currentMaxAux++;
                $aux = (string)$currentMaxAux;

                // Agregar producto válido con aux generado
                $validProducts[] = [
                    'brand' => $productData['brand'] ?? '',
                    'description' => $productData['description'] ?? '',
                    'stock' => $productData['stock'] ?? 0,
                    'cost' => $productData['cost'] ?? 0.0,
                    'pvp' => $productData['pvp'] ?? 0.0,
                    'min' => $productData['min'] ?? 0,
                    'code' => $productData['code'],
                    'aux' => $aux
                ];

            } catch (Exception $e) {
                $errors[] = 'Error validating product ' . ($productData['code'] ?? 'unknown') . ': ' . $e->getMessage();
            }
        }

        $imported = 0;
        if (!empty($validProducts)) {
            // Usar inserción masiva
            $imported = $this->repository->bulkSave($validProducts);
        }

        return [
            'success' => true,
            'imported' => $imported,
            'skipped' => $total - count($validProducts) - count($errors),
            'errors' => $errors,
            'total' => $total
        ];
    }

    /**
     * Obtiene el valor máximo del campo aux
     *
     * @return int|null
     */
    public function getMaxAux()
    {
        return $this->repository->findMaxAux();
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

    /**
     * Busca productos por code, description o aux
     *
     * @param string $query
     * @return array
     */
    public function getProductsBySearch($query)
    {
        return $this->repository->search($query);
    }

    /**
     * Obtiene estadísticas del inventario
     *
     * @return array
     */
    public function getInventoryStats()
    {
        return $this->repository->getInventoryStats();
    }
}

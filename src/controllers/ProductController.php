<?php

require_once __DIR__ . '/../services/ProductService.php';

/**
 * Controlador para manejar las solicitudes HTTP relacionadas con Product
 * Maneja la lógica de respuesta y delega a servicios
 */
class ProductController
{
    private $service;

    /**
     * Constructor: inicializa el servicio
     */
    public function __construct()
    {
        $this->service = new ProductService();
    }

    /**
     * Obtiene todos los products
     */
    public function getAll()
    {
        $products = $this->service->getAllProducts();
        $this->sendResponse(200, 1, 'Products retrieved successfully', $products);
    }

    /**
     * Obtiene un product por ID
     *
     * @param int $id
     */
    public function getById($id)
    {
        $product = $this->service->getProductById($id);
        if ($product) {
            $this->sendResponse(200, 1, 'Product retrieved successfully', $product);
        } else {
            $this->sendResponse(404, 0, 'Product not found', null);
        }
    }

    /**
     * Crea un nuevo product
     */
    public function create()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) {
            $this->sendResponse(400, 0, 'Invalid JSON data', null);
            return;
        }

        $product = $this->service->createProduct($data);
        if ($product) {
            $response = $product->toArray();
            $this->sendResponse(201, 1, 'Product created successfully', $response);
        } else {
            $this->sendResponse(400, 0, 'Validation error or code already exists', null);
        }
    }

    /**
     * Actualiza un product existente
     *
     * @param int $id
     */
    public function update($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) {
            $this->sendResponse(400, 0, 'Invalid JSON data', null);
            return;
        }

        $product = $this->service->updateProduct($id, $data);
        if ($product) {
            $response = $product->toArray();
            $this->sendResponse(200, 1, 'Product updated successfully', $response);
        } else {
            $this->sendResponse(404, 0, 'Product not found or validation error', null);
        }
    }

    /**
     * Elimina un product por ID
     *
     * @param int $id
     */
    public function delete($id)
    {
        $result = $this->service->deleteProduct($id);
        if ($result) {
            $this->sendResponse(200, 1, 'Product deleted successfully', null);
        } else {
            $this->sendResponse(404, 0, 'Product not found', null);
        }
    }

    /**
     * Envía la respuesta HTTP
     *
     * @param int $httpStatus
     * @param int $status
     * @param string $message
     * @param mixed $data
     */
    private function sendResponse($httpStatus, $status, $message, $data)
    {
        http_response_code($httpStatus);
        header('Content-Type: application/json');
        echo json_encode([
            'status' => $status,
            'message' => $message,
            'data' => $data
        ]);
        exit;
    }
}

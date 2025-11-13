<?php

require_once __DIR__ . '/../controllers/ProductController.php';

/**
 * Rutas para el módulo Product
 */
class ProductRoute
{
    private $controller;

    /**
     * Constructor: inicializa el controlador
     */
    public function __construct()
    {
        $this->controller = new ProductController();
    }

    /**
     * Maneja las rutas para products
     *
     * @param string $method
     * @param string $path
     */
    public function handle($method, $path)
    {

        if ($path === '/products' && $method === 'GET') {
            $this->controller->getAll();
        } elseif (preg_match('/^\/products\/(\d+)$/', $path, $matches) && $method === 'GET') {
            $id = $matches[1];
            $this->controller->getById($id);
        } elseif ($path === '/products' && $method === 'POST') {
            $this->controller->create();
        } elseif (preg_match('/^\/products\/(\d+)$/', $path, $matches) && $method === 'PUT') {
            $id = $matches[1];
            $this->controller->update($id);
        } elseif (preg_match('/^\/products\/(\d+)$/', $path, $matches) && $method === 'DELETE') {
            $id = $matches[1];
            $this->controller->delete($id);
        } else {
            http_response_code(404);
            echo json_encode(['status' => 0, 'message' => 'Route not found', 'data' => null]);
        }
    }
}

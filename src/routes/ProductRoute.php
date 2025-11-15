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
        } elseif ($path === '/products/import' && $method === 'POST') {
            $this->controller->import();
        } elseif ($path === '/products/import/progress' && $method === 'GET') {
            $this->getImportProgress();
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

    /**
     * Obtiene el progreso de la importación
     */
    private function getImportProgress()
    {
        session_start();
        $progress = isset($_SESSION['import_progress']) ? $_SESSION['import_progress'] : 0;
        $total = isset($_SESSION['import_total']) ? $_SESSION['import_total'] : 0;
        $current = isset($_SESSION['import_current']) ? $_SESSION['import_current'] : 0;

        http_response_code(200);
        header('Content-Type: application/json');
        echo json_encode([
            'status' => 1,
            'message' => 'Import progress retrieved',
            'data' => [
                'progress' => $progress,
                'total' => $total,
                'current' => $current
            ]
        ]);
    }
}

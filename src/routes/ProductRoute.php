<?php

/**
 * Definición de rutas para la API de Products
 * Mapea métodos HTTP y paths a métodos de controlador
 */

// Definición de rutas REST para Products
$routes = [
    'GET /products' => ['ProductController', 'getAll'],
    'GET /products/{id}' => ['ProductController', 'getById'],
    'POST /products' => ['ProductController', 'create'],
    'POST /products/bulk-import' => ['ProductController', 'bulkImport'],
    'PUT /products/{id}' => ['ProductController', 'update'],
    'DELETE /products/{id}' => ['ProductController', 'delete'],
];

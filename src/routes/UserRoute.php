<?php

/**
 * Definición de rutas para la API de Users
 * Mapea métodos HTTP y paths a métodos de controlador
 */

// Definición de rutas REST para Users
$routes = [
    'GET /users' => ['UserController', 'getAll'],
    'GET /users/{id}' => ['UserController', 'getById'],
    'POST /users' => ['UserController', 'create'],
    'PUT /users/{id}' => ['UserController', 'update'],
    'DELETE /users/{id}' => ['UserController', 'delete'],
    'POST /login' => ['UserController', 'login'],
    'PUT /users/{id}/state' => ['UserController', 'updateState'],
    'PUT /users/{id}/password' => ['UserController', 'updatePassword'],
];

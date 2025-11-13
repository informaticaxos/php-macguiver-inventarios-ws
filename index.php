<?php

// Punto de entrada de la aplicación API-REST
// Incluye las rutas y despacha las solicitudes

require_once 'src/routes/FormRoute.php';
$formRoutes = $routes;

require_once 'src/routes/FilesRoute.php';
$filesRoutes = $routes;

require_once 'src/routes/CountriesRoute.php';
$countriesRoutes = $routes;

require_once 'src/routes/UserRoute.php';
$userRoutes = $routes;

$routes = array_merge($formRoutes, $filesRoutes, $countriesRoutes, $userRoutes);

require_once 'src/controllers/FormController.php';
require_once 'src/controllers/FilesController.php';
require_once 'src/controllers/CountriesController.php';
require_once 'src/controllers/UserController.php';

// Función para obtener el método y path de la solicitud
function getRequestMethodAndPath()
{
    $method = $_SERVER['REQUEST_METHOD'];
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    // Remover el prefijo del subdirectorio
    $path = str_replace('/php-ferco-files-ws', '', $path);
    return [$method, $path];
}

// Función para hacer match de ruta
function matchRoute($routes, $method, $path)
{
    foreach ($routes as $route => $handler) {
        list($routeMethod, $routePath) = explode(' ', $route, 2);
        if ($routeMethod !== $method) {
            continue;
        }

        // Reemplazar {id} con regex
        $routePathRegex = preg_replace('/\{[^}]+\}/', '([^/]+)', $routePath);
        if (preg_match("#^$routePathRegex$#", $path, $matches)) {
            array_shift($matches); // Remover el match completo
            return [$handler, $matches];
        }
    }
    return null;
}


// Obtener método y path de la solicitud
list($method, $path) = getRequestMethodAndPath();

// Hacer match con las rutas definidas
$match = matchRoute($routes, $method, $path);

if ($match) {
    list($handler, $params) = $match;
    list($controllerClass, $methodName) = $handler;

    // Instanciar el controlador y llamar al método
    $controller = new $controllerClass();
    call_user_func_array([$controller, $methodName], $params);
} else {
    // Ruta no encontrada
    http_response_code(404);
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 0,
        'message' => 'Ruta no encontrada',
        'data' => null
    ]);
}



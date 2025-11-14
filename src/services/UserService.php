<?php

require_once __DIR__ . '/../repositories/UserRepository.php';
require_once __DIR__ . '/../models/UserModel.php';

/**
 * Servicio para la lógica de negocio de User
 * Actúa como intermediario entre controladores y repositorios
 */
class UserService
{
    private $repository;

    /**
     * Constructor: inicializa el repositorio
     */
    public function __construct()
    {
        $this->repository = new UserRepository();
    }

    /**
     * Obtiene todos los users
     *
     * @return array
     */
    public function getAllUsers()
    {
        return $this->repository->findAll();
    }

    /**
     * Obtiene un user por ID
     *
     * @param int $id
     * @return array|null
     */
    public function getUserById($id)
    {
        return $this->repository->findById($id);
    }

    /**
     * Crea un nuevo user
     *
     * @param array $data
     * @return User|null
     */
    public function createUser($data)
    {
        // Validación básica (puede expandirse)
        if (empty($data['fullname']) || empty($data['username']) || empty($data['password'])) {
            return null; // Error de validación
        }

        // Verificar si el username ya existe
        if ($this->repository->findByUsername($data['username'])) {
            return null; // Username ya existe
        }

        $user = new User(null, $data['fullname'], $data['username'], $data['password'], $data['state'] ?? 1, $data['rol'] ?? null);
        $this->repository->save($user);
        return $user;
    }

    /**
     * Actualiza un user existente
     *
     * @param int $id
     * @param array $data
     * @return User|null
     */
    public function updateUser($id, $data)
    {
        $existing = $this->repository->findById($id);
        if (!$existing) {
            return null;
        }

        // Validación básica
        if (empty($data['fullname']) || empty($data['username'])) {
            return null;
        }

        // Verificar si el username ya existe en otro usuario
        $existingUsername = $this->repository->findByUsername($data['username']);
        if ($existingUsername && $existingUsername['id_user'] != $id) {
            return null; // Username ya existe en otro usuario
        }

        $hashedPassword = isset($data['password']) && !empty($data['password']) ? password_hash($data['password'], PASSWORD_DEFAULT) : $existing['password'];

        $user = new User($id, $data['fullname'], $data['username'], $hashedPassword, $data['state'] ?? $existing['state'], $data['rol'] ?? $existing['rol']);
        $this->repository->save($user);
        return $user;
    }

    /**
     * Actualiza el estado de un user
     *
     * @param int $id
     * @param int $state
     * @return User|null
     */
    public function updateUserState($id, $state)
    {
        $existing = $this->repository->findById($id);
        if (!$existing) {
            return null;
        }

        $user = new User($id, $existing['fullname'], $existing['username'], $existing['password'], $state, $existing['rol']);
        $this->repository->save($user);
        return $user;
    }

    /**
     * Elimina un user por ID
     *
     * @param int $id
     */
    public function deleteUser($id)
    {
        // Verificar que el user existe
        $user = $this->repository->findById($id);
        if (!$user) {
            return false;
        }

        $this->repository->delete($id);
        return true;
    }

    /**
     * Actualiza la contraseña de un user
     *
     * @param int $id
     * @param string $password
     * @return User|null
     */
    public function updatePassword($id, $password)
    {
        $existing = $this->repository->findById($id);
        if (!$existing) {
            return null;
        }

        // Validación básica para contraseña
        if (empty($password) || strlen($password) < 6) {
            return null; // Contraseña inválida
        }

        // Hash de la contraseña
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        $user = new User($id, $existing['fullname'], $existing['username'], $hashedPassword, $existing['state'], $existing['rol']);
        $this->repository->save($user);
        return $user;
    }

    /**
     * Login de usuario
     *
     * @param string $username
     * @param string $password
     * @return array|null
     */
    public function login($username, $password)
    {
        $user = $this->repository->findByUsername($username);
        if (!$user) {
            return null; // Usuario no encontrado
        }

        // Verificar contraseña (sin hash, ya que las contraseñas están en texto plano)
        if ($password !== $user['password']) {
            return null; // Contraseña incorrecta
        }

        // Verificar estado
        if ($user['state'] != 1) {
            return null; // Usuario inactivo
        }

        // Retornar datos del usuario sin contraseña
        unset($user['password']);
        return $user;
    }
}

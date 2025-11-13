<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/UserModel.php';

/**
 * Repositorio para la entidad User
 * Encapsula las operaciones CRUD contra la base de datos
 */
class UserRepository
{
    private $pdo;

    /**
     * Constructor: obtiene la conexión a la base de datos
     */
    public function __construct()
    {
        $this->pdo = Database::getConnection();
    }

    /**
     * Obtiene todos los registros de users
     *
     * @return array
     */
    public function findAll()
    {
        $stmt = $this->pdo->query("SELECT * FROM users");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Obtiene un user por ID
     *
     * @param int $id
     * @return array|null
     */
    public function findById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE id_user = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Obtiene un user por email
     *
     * @param string $email
     * @return array|null
     */
    public function findByEmail($email)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Guarda un user (inserta si no tiene ID, actualiza si lo tiene)
     *
     * @param User $user
     */
    public function save(User $user)
    {
        if ($user->getIdUser()) {
            // Actualizar
            $stmt = $this->pdo->prepare("UPDATE users SET name = ?, email = ?, password = ?, state = ? WHERE id_user = ?");
            $stmt->execute([
                $user->getName(),
                $user->getEmail(),
                $user->getPassword(),
                $user->getState(),
                $user->getIdUser()
            ]);
        } else {
            // Insertar
            $stmt = $this->pdo->prepare("INSERT INTO users (name, email, password, state) VALUES (?, ?, ?, ?)");
            $stmt->execute([
                $user->getName(),
                $user->getEmail(),
                $user->getPassword(),
                $user->getState()
            ]);
            $user->setIdUser($this->pdo->lastInsertId());
        }
    }

    /**
     * Elimina un user por ID
     *
     * @param int $id
     */
    public function delete($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM users WHERE id_user = ?");
        $stmt->execute([$id]);
    }
}

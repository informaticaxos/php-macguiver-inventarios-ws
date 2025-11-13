<?php

/**
 * Modelo para la tabla users
 * Representa una entidad básica con campos: id_user, fullname, username, password, state, rol
 */
class User
{
    private $id_user;
    private $fullname;
    private $username;
    private $password;
    private $state;
    private $rol;

    /**
     * Constructor de la clase User
     *
     * @param int|null $id_user
     * @param string $fullname
     * @param string $username
     * @param string $password
     * @param int $state
     * @param int|null $rol
     */
    public function __construct($id_user = null, $fullname = '', $username = '', $password = '', $state = 1, $rol = null)
    {
        $this->id_user = $id_user;
        $this->fullname = $fullname;
        $this->username = $username;
        $this->password = $password;
        $this->state = $state;
        $this->rol = $rol;
    }

    // Getters
    public function getIdUser()
    {
        return $this->id_user;
    }

    public function getFullname()
    {
        return $this->fullname;
    }

    public function getUsername()
    {
        return $this->username;
    }

    public function getPassword()
    {
        return $this->password;
    }

    public function getState()
    {
        return $this->state;
    }

    public function getRol()
    {
        return $this->rol;
    }

    // Setters
    public function setIdUser($id_user)
    {
        $this->id_user = $id_user;
    }

    public function setFullname($fullname)
    {
        $this->fullname = $fullname;
    }

    public function setUsername($username)
    {
        $this->username = $username;
    }

    public function setPassword($password)
    {
        $this->password = $password;
    }

    public function setState($state)
    {
        $this->state = $state;
    }

    public function setRol($rol)
    {
        $this->rol = $rol;
    }

    /**
     * Método para convertir el objeto a array (útil para JSON responses)
     *
     * @return array
     */
    public function toArray()
    {
        return [
            'id_user' => $this->id_user,
            'fullname' => $this->fullname,
            'username' => $this->username,
            'password' => $this->password,
            'state' => $this->state,
            'rol' => $this->rol,
        ];
    }
}

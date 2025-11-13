<?php

/**
 * Modelo para la tabla users
 * Representa una entidad básica con campos: id_user, name, email, password, state
 */
class User
{
    private $id_user;
    private $name;
    private $email;
    private $password;
    private $state;

    /**
     * Constructor de la clase User
     *
     * @param int|null $id_user
     * @param string $name
     * @param string $email
     * @param string $password
     * @param string $state
     */
    public function __construct($id_user = null, $name = '', $email = '', $password = '', $state = '1')
    {
        $this->id_user = $id_user;
        $this->name = $name;
        $this->email = $email;
        $this->password = $password;
        $this->state = $state;
    }

    // Getters
    public function getIdUser()
    {
        return $this->id_user;
    }

    public function getName()
    {
        return $this->name;
    }

    public function getEmail()
    {
        return $this->email;
    }

    public function getPassword()
    {
        return $this->password;
    }

    public function getState()
    {
        return $this->state;
    }

    // Setters
    public function setIdUser($id_user)
    {
        $this->id_user = $id_user;
    }

    public function setName($name)
    {
        $this->name = $name;
    }

    public function setEmail($email)
    {
        $this->email = $email;
    }

    public function setPassword($password)
    {
        $this->password = $password;
    }

    public function setState($state)
    {
        $this->state = $state;
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
            'name' => $this->name,
            'email' => $this->email,
            'password' => $this->password,
            'state' => $this->state,
        ];
    }
}

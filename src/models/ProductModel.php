<?php

/**
 * Modelo para la tabla products
 * Representa una entidad básica con campos: id_product, name, brand, description, stock, cost, pvp, min, code
 */
class Product
{
    private $id_product;
    private $name;
    private $brand;
    private $description;
    private $stock;
    private $cost;
    private $pvp;
    private $min;
    private $code;

    /**
     * Constructor de la clase Product
     *
     * @param int|null $id_product
     * @param string $name
     * @param string $brand
     * @param string $description
     * @param float $stock
     * @param float $cost
     * @param float $pvp
     * @param int $min
     * @param string $code
     */
    public function __construct($id_product = null, $name = '', $brand = '', $description = '', $stock = 0.0, $cost = 0.0, $pvp = 0.0, $min = 0, $code = '')
    {
        $this->id_product = $id_product;
        $this->name = $name;
        $this->brand = $brand;
        $this->description = $description;
        $this->stock = $stock;
        $this->cost = $cost;
        $this->pvp = $pvp;
        $this->min = $min;
        $this->code = $code;
    }

    // Getters
    public function getIdProduct()
    {
        return $this->id_product;
    }

    public function getName()
    {
        return $this->name;
    }

    public function getBrand()
    {
        return $this->brand;
    }

    public function getDescription()
    {
        return $this->description;
    }

    public function getStock()
    {
        return $this->stock;
    }

    public function getCost()
    {
        return $this->cost;
    }

    public function getPvp()
    {
        return $this->pvp;
    }

    public function getMin()
    {
        return $this->min;
    }

    public function getCode()
    {
        return $this->code;
    }

    // Setters
    public function setIdProduct($id_product)
    {
        $this->id_product = $id_product;
    }

    public function setName($name)
    {
        $this->name = $name;
    }

    public function setBrand($brand)
    {
        $this->brand = $brand;
    }

    public function setDescription($description)
    {
        $this->description = $description;
    }

    public function setStock($stock)
    {
        $this->stock = $stock;
    }

    public function setCost($cost)
    {
        $this->cost = $cost;
    }

    public function setPvp($pvp)
    {
        $this->pvp = $pvp;
    }

    public function setMin($min)
    {
        $this->min = $min;
    }

    public function setCode($code)
    {
        $this->code = $code;
    }

    /**
     * Método para convertir el objeto a array (útil para JSON responses)
     *
     * @return array
     */
    public function toArray()
    {
        return [
            'id_product' => $this->id_product,
            'name' => $this->name,
            'brand' => $this->brand,
            'description' => $this->description,
            'stock' => $this->stock,
            'cost' => $this->cost,
            'pvp' => $this->pvp,
            'min' => $this->min,
            'code' => $this->code,
        ];
    }
}

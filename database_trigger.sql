-- Trigger para generar automáticamente el campo aux en la tabla products
-- Se ejecuta antes de insertar un nuevo producto

DELIMITER $$

CREATE TRIGGER generate_aux_before_insert
BEFORE INSERT ON products
FOR EACH ROW
BEGIN
    -- Si aux no está proporcionado o está vacío, generar automáticamente
    IF NEW.aux IS NULL OR NEW.aux = '' THEN
        SET NEW.aux = (SELECT COALESCE(MAX(aux) + 1, 1) FROM products);
    END IF;
END$$

DELIMITER ;

# TODO: Update Product Model and Service for New Schema

## Tasks
- [x] Update ProductModel.php: Change 'aux' property to string, 'stock' to int, update constructor, getters, and setters.
- [x] Update ProductService.php: Change validation for 'aux' to non-empty string and unique in createProduct, updateProduct, and importProductsFromData methods.
- [x] Test POST /products endpoint to ensure creation works with updated structure.

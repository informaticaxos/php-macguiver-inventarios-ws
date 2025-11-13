# TODO: Remove countries, files, form functionality, keep only users; Add products module with basic CRUD

## Information Gathered
- Project structure: MVC with controllers, models, repositories, routes, services for each module.
- Modules: Countries, Files, Form, User, Products (new).
- Task: Remove countries, files, form; keep only users; Add products module.
- Files to delete:
  - Controllers: CountriesController.php, FilesController.php, FormController.php
  - Models: CountriesModel.php, FilesModel.php, FormModel.php
  - Repositories: CountriesRepository.php, FilesRepository.php, FormRepository.php
  - Routes: CountriesRoute.php, FilesRoute.php, FormRoute.php
  - Services: CountriesService.php, FilesService.php, FormService.php
- index.php updated to only include UserRoute and UserController, and now to include ProductRoute and ProductController.
- Products table structure: id_product (int, auto_increment), name (varchar), brand (varchar), description (varchar), stock (decimal), cost (decimal), pvp (decimal), min (int), code (varchar).
- Dependencies: Form module references Files (delete form and associated files), but since both are removed, no issue.

## Plan
- Delete controller files for countries, files, form.
- Delete model files for countries, files, form.
- Delete repository files for countries, files, form.
- Delete route files for countries, files, form.
- Delete service files for countries, files, form.
- Verify no remaining references in user-related files.
- Create ProductModel.php with fields: id_product, name, brand, description, stock, cost, pvp, min, code.
- Create ProductRepository.php with CRUD operations.
- Create ProductService.php with business logic and validations.
- Create ProductController.php with HTTP request handling.
- Create ProductRoute.php with routes: GET /products, GET /products/{id}, POST /products, PUT /products/{id}, DELETE /products/{id}.
- Update index.php to include ProductRoute and ProductController.

## Dependent Files to be edited
- index.php: Updated to remove includes for Form, Files, Countries routes and controllers; add includes for ProductRoute and ProductController.

## Followup steps
- Test the application to ensure users functionality works.
- Test products CRUD endpoints.

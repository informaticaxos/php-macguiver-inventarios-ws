# TODO: Remove countries, files, form functionality, keep only users

## Information Gathered
- Project structure: MVC with controllers, models, repositories, routes, services for each module.
- Modules: Countries, Files, Form, User.
- Task: Remove countries, files, form; keep only users.
- Files to delete:
  - Controllers: CountriesController.php, FilesController.php, FormController.php
  - Models: CountriesModel.php, FilesModel.php, FormModel.php
  - Repositories: CountriesRepository.php, FilesRepository.php, FormRepository.php
  - Routes: CountriesRoute.php, FilesRoute.php, FormRoute.php
  - Services: CountriesService.php, FilesService.php, FormService.php
- No index.php found in root (referenced in .htaccess), so no router includes to update.
- Dependencies: Form module references Files (delete form and associated files), but since both are removed, no issue.

## Plan
- Delete controller files for countries, files, form.
- Delete model files for countries, files, form.
- Delete repository files for countries, files, form.
- Delete route files for countries, files, form.
- Delete service files for countries, files, form.
- Verify no remaining references in user-related files.

## Dependent Files to be edited
- None (deleting files only).

## Followup steps
- Test the application to ensure users functionality works.
- If index.php exists or is created, ensure only UserRoute is included.

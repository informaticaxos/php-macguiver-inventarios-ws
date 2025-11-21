# TODO - Refactor Frontend from Tailwind to Bootstrap

## Tareas Pendientes
- [ ] Update index.html head: Remove Tailwind script/config, add Bootstrap CSS CDN.
- [ ] Replace Tailwind classes in body with Bootstrap equivalents (e.g., bg-light).
- [ ] Replace Tailwind classes in header with Bootstrap equivalents (e.g., bg-dark).
- [ ] Refactor custom modals (createFormModal, etc.) to use Bootstrap modal classes or utilities instead of Tailwind.
- [ ] Update styles.css to add Bootstrap-compatible custom styles if needed.
- [ ] Ensure responsive design with Bootstrap grid.

## Información Recopilada
- index.html uses Tailwind CDN and config, with many Tailwind classes in body, header, and custom modals.
- Bootstrap JS is loaded, but CSS is missing; need to add Bootstrap CSS CDN.
- Sidebar and some modals already use Bootstrap classes.
- styles.css has custom styles; may need updates for Bootstrap compatibility.

## Plan de Implementación
- Update index.html head: Remove Tailwind script/config, add Bootstrap CSS CDN.
- Replace Tailwind classes in body/header with Bootstrap equivalents (e.g., bg-light, bg-dark).
- Refactor custom modals to use Bootstrap modal classes or utilities instead of Tailwind.
- Update styles.css to add Bootstrap-compatible custom styles if needed.
- Ensure responsive design with Bootstrap grid.

## Dependent Files to be edited
- frontend/index.html
- frontend/styles.css

## Followup steps
- Test design in browser for consistency.
- Verify modal functionality and responsiveness.
- Check sidebar navigation on different screen sizes.

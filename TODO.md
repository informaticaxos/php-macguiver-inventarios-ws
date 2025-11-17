# TODO: Corregir modales de usuario para coincidir con estructura de tabla `users`

## Información Recopilada
- La tabla `users` tiene campos: `id_user`, `fullname`, `username`, `password`, `state`, `rol`.
- Los modales actuales usan labels incorrectos: "Nombre" en lugar de "Nombre Completo", "Email" en lugar de "Usuario".
- Faltan campos para `rol` en ambos modales (crear y editar).
- Hay inconsistencias en IDs entre HTML y JavaScript.

## Plan de Corrección
1. **Modificar frontend/index.html**:
   - Cambiar labels y IDs en `createUserModal` para usar `fullname`, `username`, `password`, y agregar `rol`.
   - Cambiar labels y IDs en `editUserModal` para usar `fullname`, `username`, y agregar `rol`.
   - Agregar campo select para `rol` (Admin=1, Usuario=2).

2. **Modificar frontend/index.js**:
   - Ajustar IDs en funciones `saveUser` y `updateUser` para coincidir con HTML.
   - Agregar manejo de `rol` en creación y edición.
   - Modificar `openEditUserModal` para incluir `rol` y setear el campo.

3. **Verificar backend**:
   - Confirmar que `UserService` y `UserController` manejan `fullname`, `username`, `password`, `rol` correctamente.

## Pasos Detallados
- [ ] Actualizar `createUserModal` en `frontend/index.html`: cambiar labels, IDs, agregar rol.
- [ ] Actualizar `editUserModal` en `frontend/index.html`: cambiar labels, IDs, agregar rol.
- [ ] Modificar `frontend/index.js`: ajustar IDs, agregar rol en saveUser, updateUser, openEditUserModal.
- [ ] Probar funcionalidad: crear y editar usuario, verificar que se guarden fullname, username, password, rol.

## Seguimiento de Progreso
- [x] Paso 1 completado
- [x] Paso 2 completado
- [x] Paso 3 completado
- [x] Pruebas completadas

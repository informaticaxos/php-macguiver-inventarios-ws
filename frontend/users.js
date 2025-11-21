// Users module

class UserManager {
    constructor() {
        this.usersData = [];
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Search functionality
        $(document).on('keyup', '#searchUsuario', () => this.renderUsuariosTable());

        // Button event handlers
        $(document).on('click', '#refreshUsuariosBtn', () => this.loadUsuarios());

        // Create user
        $('#saveUser').click(() => this.saveUser());

        // Edit user
        $('#updateUser').click(() => this.updateUser());

        // Change password
        $('#updatePassword').click(() => this.updatePassword());
    }

    loadUsuarios() {
        $('#content-area').html('<h2>Usuarios</h2><div class="d-flex flex-column flex-md-row justify-content-between mb-3"><div class="d-flex mb-2 mb-md-0"><input type="text" id="searchUsuario" class="form-control form-control-sm me-2" placeholder="Buscar por nombre"></div><div class="d-flex gap-2"><button id="refreshUsuariosBtn" class="btn btn-secondary btn-sm"><i class="fas fa-sync"></i> Actualizar</button><button type="button" class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#createUserModal"><i class="fas fa-plus"></i> Nuevo Usuario</button></div></div><div id="usuarios-table" class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Cargando...</span></div></div>');
        $.ajax({
            url: getApiUrl(CONFIG.API_ENDPOINTS.USERS.LIST),
            method: 'GET',
            success: (response) => {
                if (response.status === 1) {
                    this.usersData = response.data;
                    this.renderUsuariosTable();
                } else {
                    $('#usuarios-table').html('<p>Error al cargar usuarios: ' + response.message + '</p>');
                }
            },
            error: () => {
                $('#usuarios-table').html('<p>Error de conexión.</p>');
            }
        });
    }

    renderUsuariosTable() {
        const searchTerm = $('#searchUsuario').val().toLowerCase();
        const filteredData = this.usersData.filter(user =>
            user.fullname && user.fullname.toLowerCase().includes(searchTerm)
        );
        let table = '<table class="table table-striped"><thead><tr><th>ID</th><th>Nombre Completo</th><th>Usuario</th><th>Estado</th><th>Rol</th><th>Acciones</th></tr></thead><tbody>';
        filteredData.forEach(user => {
            const stateText = user.state == 1 ? 'Activo' : 'Inactivo';
            const stateClass = user.state == 1 ? 'badge bg-success' : 'badge bg-danger';
            const rolText = user.rol == 1 ? 'Admin' : 'Usuario';
            table += '<tr><td>' + user.id_user + '</td><td>' + (user.fullname || 'N/A') + '</td><td>' + (user.username || 'N/A') + '</td><td><span class="' + stateClass + '">' + stateText + '</span></td><td>' + rolText + '</td><td><button class="btn btn-sm btn-warning" onclick="window.userManager.openEditUserModal(' + user.id_user + ', \'' + (user.fullname || '') + '\', \'' + (user.username || '') + '\', ' + user.rol + ')"><i class="fas fa-edit"></i></button><button class="btn btn-sm btn-danger" onclick="window.userManager.deleteUser(' + user.id_user + ')"><i class="fas fa-trash"></i></button><button class="btn btn-sm btn-info" onclick="window.userManager.openChangePasswordModal(' + user.id_user + ')"><i class="fas fa-key"></i></button></td></tr>';
        });
        table += '</tbody></table>';
        $('#usuarios-table').html(table);
    }

    saveUser() {
        const fullname = $('#newUserFullname').val();
        const username = $('#newUserUsername').val();
        const password = $('#newUserPassword').val();
        const rol = $('#newUserRol').val();

        if (fullname && username && password && rol) {
            $.ajax({
                url: getApiUrl(CONFIG.API_ENDPOINTS.USERS.CREATE),
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    fullname: fullname,
                    username: username,
                    password: password,
                    rol: parseInt(rol)
                }),
                success: (response) => {
                    Swal.fire({
                        icon: response.status === 1 ? 'success' : 'error',
                        title: response.status === 1 ? 'Éxito' : 'Error',
                        text: response.message
                    });
                    if (response.status === 1) {
                        $('#createUserModal').modal('hide');
                        $('#createUserForm')[0].reset();
                        this.loadUsuarios();
                    }
                },
                error: () => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Error de conexión.'
                    });
                }
            });
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'Campos requeridos',
                text: 'Por favor, complete todos los campos.'
            });
        }
    }

    openEditUserModal(id, fullname, username, rol) {
        $('#editUserId').val(id);
        $('#editUserFullname').val(fullname);
        $('#editUserUsername').val(username);
        $('#editUserRol').val(rol);
        $('#editUserModal').modal('show');
    }

    updateUser() {
        const id = $('#editUserId').val();
        const fullname = $('#editUserFullname').val();
        const username = $('#editUserUsername').val();
        const rol = $('#editUserRol').val();

        if (fullname && username && rol) {
            $.ajax({
                url: getApiUrl(CONFIG.API_ENDPOINTS.USERS.UPDATE) + '/' + id,
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({
                    fullname: fullname,
                    username: username,
                    rol: parseInt(rol)
                }),
                success: (response) => {
                    Swal.fire({
                        icon: response.status === 1 ? 'success' : 'error',
                        title: response.status === 1 ? 'Éxito' : 'Error',
                        text: response.message
                    });
                    if (response.status === 1) {
                        $('#editUserModal').modal('hide');
                        $('#editUserForm')[0].reset();
                        this.loadUsuarios();
                    }
                },
                error: () => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Error de conexión.'
                    });
                }
            });
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'Campos requeridos',
                text: 'Por favor, complete todos los campos.'
            });
        }
    }

    openChangePasswordModal(id) {
        $('#changePasswordUserId').val(id);
        $('#changePasswordModal').modal('show');
    }

    updatePassword() {
        const id = $('#changePasswordUserId').val();
        const password = $('#newPassword').val();

        if (password && password.length >= 6) {
            $.ajax({
                url: getApiUrl(CONFIG.API_ENDPOINTS.USERS.UPDATE_PASSWORD.replace('/users', '/users/' + id + '/password')),
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({
                    password: password
                }),
                success: (response) => {
                    Swal.fire({
                        icon: response.status === 1 ? 'success' : 'error',
                        title: response.status === 1 ? 'Éxito' : 'Error',
                        text: response.message
                    });
                    if (response.status === 1) {
                        $('#changePasswordModal').modal('hide');
                        $('#changePasswordForm')[0].reset();
                        this.loadUsuarios();
                    }
                },
                error: () => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Error de conexión.'
                    });
                }
            });
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'Contraseña inválida',
                text: 'La contraseña debe tener al menos 6 caracteres.'
            });
        }
    }

    deleteUser(id) {
        Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: getApiUrl(CONFIG.API_ENDPOINTS.USERS.DELETE) + '/' + id,
                    method: 'DELETE',
                    success: (response) => {
                        Swal.fire({
                            icon: response.status === 1 ? 'success' : 'error',
                            title: response.status === 1 ? 'Eliminado' : 'Error',
                            text: response.message
                        });
                        if (response.status === 1) {
                            this.loadUsuarios();
                        }
                    },
                    error: () => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Error de conexión.'
                        });
                    }
                });
            }
        });
    }
}

$(document).ready(function () {
    // Check if logged in
    // if (localStorage.getItem('loggedIn') !== 'true') {
    //     window.location.href = 'login.html';
    //     return;
    // }

    // API Endpoints Configuration
    const API_BASE_INVENTARIOS = 'https://nestorcornejo.com/macguiver-inventarios';

    // Products API Endpoints
    const API_PRODUCTS_LIST = API_BASE_INVENTARIOS + '/products'; // GET: Obtener lista de productos
    const API_PRODUCTS_CREATE = API_BASE_INVENTARIOS + '/products'; // POST: Crear nuevo producto
    const API_PRODUCTS_BULK_IMPORT = API_BASE_INVENTARIOS + '/products/bulk-import'; // POST: Importar productos en masa desde Excel

    // Users API Endpoints
    const API_USERS_LIST = API_BASE_INVENTARIOS + '/users'; // GET: Obtener lista de usuarios
    const API_USERS_CREATE = API_BASE_INVENTARIOS + '/users'; // POST: Crear nuevo usuario
    const API_USERS_UPDATE = API_BASE_INVENTARIOS + '/users'; // PUT: Actualizar usuario
    const API_USERS_UPDATE_PASSWORD = API_BASE_INVENTARIOS + '/users'; // PUT: Cambiar contraseña
    const API_USERS_DELETE = API_BASE_INVENTARIOS + '/users'; // DELETE: Eliminar usuario

    var productosData = []; // Store the productos data globally
    var usersData = []; // Store the users data globally

    // Handle sidebar navigation
    $('.sidebar .nav-link, .offcanvas .nav-link').click(function (e) {
        e.preventDefault();
        $('.sidebar .nav-link, .offcanvas .nav-link').removeClass('active');
        $(this).addClass('active');
        var section = $(this).data('section');
        loadSection(section);
        // Close offcanvas on mobile
        $('#sidebar').offcanvas('hide');
    });

    // Load section content
    function loadSection(section) {
        if (section === 'productos') {
            loadProductos();
        } else if (section === 'usuarios') {
            loadUsuarios();
        }
    }

    // Search functionality
    $(document).on('keyup', '#searchProducto', function() {
        renderProductosTable();
    });

    $(document).on('keyup', '#searchUsuario', function() {
        renderUsuariosTable();
    });



    // Load productos
    function loadProductos() {
        $('#content-area').html('<h2>Productos</h2><div class="d-flex flex-column flex-md-row justify-content-between mb-3"><div class="d-flex mb-2 mb-md-0"><input type="text" id="searchProducto" class="form-control form-control-sm me-2" placeholder="Buscar por marca"></div><div class="d-flex gap-2"><button id="refreshProductosBtn" class="btn btn-secondary btn-sm"><i class="fas fa-sync"></i> Actualizar</button><button type="button" class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#createProductModal"><i class="fas fa-plus"></i> Nuevo Producto</button><button type="button" class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#importProductsModal"><i class="fas fa-upload"></i> Importar Excel</button></div></div><div id="productos-table" class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Cargando...</span></div></div>');
        $.ajax({
            url: API_PRODUCTS_LIST,
            method: 'GET',
            success: function (response) {
                if (response.status === 1) {
                    productosData = response.data; // Store the data
                    renderProductosTable();
                } else {
                    $('#productos-table').html('<p>Error al cargar productos: ' + response.message + '</p>');
                }
            },
            error: function () {
                $('#productos-table').html('<p>Error de conexión.</p>');
            }
        });
    }



    // Render productos cards
    function renderProductosTable() {
        var searchTerm = $('#searchProducto').val().toLowerCase();
        var filteredData = productosData.filter(function (producto) {
            return producto.brand && producto.brand.toLowerCase().includes(searchTerm);
        });
        var cards = '<div class="row g-3">';
        filteredData.forEach(function (producto) {
            cards += '<div class="col-12">' +
                '<div class="card shadow-sm">' +
                '<div class="card-header bg-primary text-white">' +
                '<h5 class="card-title mb-0">' + (producto.brand || 'N/A') + ' - ' + (producto.code || 'N/A') + '</h5>' +
                '</div>' +
                '<div class="card-body">' +
                '<p class="card-text mb-1"><strong>Descripción:</strong> ' + (producto.description || 'N/A') + '</p>' +
                '<p class="card-text mb-0"><strong>Stock:</strong> ' + (producto.stock || 0) + ' | <strong>Costo:</strong> $' + (producto.cost || 0) + ' | <strong>PVP:</strong> $' + (producto.pvp || 0) + ' | <strong>Mínimo:</strong> ' + (producto.min || 0) + ' | <strong>Aux:</strong> ' + (producto.aux || 0) + ' | <small class="text-muted">ID: ' + producto.id_product + '</small></p>' +
                '</div>' +
                '</div>' +
                '</div>';
        });
        cards += '</div>';
        $('#productos-table').html(cards);
    }



    // Import products from Excel
    var importedProducts = [];

    // Preview products from Excel
    $('#previewProducts').click(function () {
        var fileInput = document.getElementById('excelFile');
        var file = fileInput.files[0];
        if (!file) {
            Swal.fire({
                icon: 'warning',
                title: 'Archivo requerido',
                text: 'Por favor, selecciona un archivo Excel.'
            });
            return;
        }

        // Show loading spinner
        $('#previewProducts').prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Procesando...');

        var reader = new FileReader();
        reader.onload = function (e) {
            var data = new Uint8Array(e.target.result);
            var workbook = XLSX.read(data, { type: 'array' });
            var sheetName = workbook.SheetNames[0];
            var worksheet = workbook.Sheets[sheetName];
            var jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // Assuming first row is headers: Código, Marca, Descripción, Stock, Costo, PVP, Mínimo, Aux
            if (jsonData.length < 2) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'El archivo Excel debe contener al menos una fila de datos.'
                });
                $('#previewProducts').prop('disabled', false).html('Vista Previa');
                return;
            }

            importedProducts = [];
            for (var i = 1; i < jsonData.length; i++) {
                var row = jsonData[i];
                if (row.length >= 8) {
                    importedProducts.push({
                        code: row[0] || '',
                        aux: (row[1]) || 0,
                        description: row[2] || '',
                        brand: row[3] || '',
                        stock: parseInt(row[4]) || 0,
                        cost: parseFloat(row[5]) || 0,
                        pvp: parseFloat(row[6]) || 0,
                        min: parseInt(row[7]) || 0
                    });
                }
            }

            // Render preview table rows only (headers are already in HTML)
            var rowsHtml = '';
            importedProducts.forEach(function (product, index) {
                rowsHtml += '<tr id="product-row-' + index + '"><td>' + product.code + '</td><td>' + product.brand + '</td><td>' + product.description + '</td><td>' + product.stock + '</td><td>' + product.cost + '</td><td>' + product.pvp + '</td><td>' + product.min + '</td><td>' + product.aux + '</td></tr>';
            });
            $('#productsTableBody').html(rowsHtml);
            $('#productsPreview').show();
            $('#importProducts').show();
            $('#clearPreview').show();
            $('#progressBar').show().css('width', '0%').text('0%');

            // Hide loading spinner
            $('#previewProducts').prop('disabled', false).html('Vista Previa');
        };
        reader.readAsArrayBuffer(file);
    });

    // Clear preview
    $('#clearPreview').click(function () {
        importedProducts = [];
        $('#productsTableBody').html('');
        $('#productsPreview').hide();
        $('#importProducts').hide();
        $('#clearPreview').hide();
        $('#excelFile').val('');
    });

    // Import products
    $('#importProducts').click(function () {
        if (importedProducts.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Sin productos',
                text: 'No hay productos para importar.'
            });
            return;
        }

        // Disable button and show progress
        $('#importProducts').prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Importando...');
        $('#progressBar').show().css('width', '0%').text('0%');

        // Usar importación masiva en lugar de individual
        $.ajax({
            url: API_PRODUCTS_BULK_IMPORT,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ products: importedProducts }),
            success: function (response) {
                $('#importProducts').prop('disabled', false).html('Importar Productos');
                $('#progressBar').css('width', '100%').text('100%');

                if (response.status === 1) {
                    var data = response.data;
                    var message = 'Importación completada. ' + data.imported + ' productos importados.';
                    if (data.skipped > 0) {
                        message += ' ' + data.skipped + ' productos omitidos (ya existen).';
                    }
                    if (data.errors.length > 0) {
                        message += ' ' + data.errors.length + ' errores encontrados.';
                    }

                    Swal.fire({
                        icon: data.errors.length === 0 ? 'success' : 'warning',
                        title: 'Importación completada',
                        text: message
                    });

                    $('#importProductsModal').modal('hide');
                    $('#excelFile').val('');
                    $('#productsPreview').hide();
                    $('#importProducts').hide();
                    $('#clearPreview').hide();
                    importedProducts = [];
                    loadProductos(); // Reload the products table
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: response.message
                    });
                }
            },
            error: function () {
                $('#importProducts').prop('disabled', false).html('Importar Productos');
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al importar productos.'
                });
            }
        });
    });

    // Load usuarios
    function loadUsuarios() {
        $('#content-area').html('<h2>Usuarios</h2><div class="d-flex flex-column flex-md-row justify-content-between mb-3"><div class="d-flex mb-2 mb-md-0"><input type="text" id="searchUsuario" class="form-control form-control-sm me-2" placeholder="Buscar por nombre"></div><div class="d-flex gap-2"><button id="refreshUsuariosBtn" class="btn btn-secondary btn-sm"><i class="fas fa-sync"></i> Actualizar</button><button type="button" class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#createUserModal"><i class="fas fa-plus"></i> Nuevo Usuario</button></div></div><div id="usuarios-table" class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Cargando...</span></div></div>');
        $.ajax({
            url: API_USERS_LIST,
            method: 'GET',
            success: function (response) {
                if (response.status === 1) {
                    usersData = response.data; // Store the data
                    renderUsuariosTable();
                } else {
                    $('#usuarios-table').html('<p>Error al cargar usuarios: ' + response.message + '</p>');
                }
            },
            error: function () {
                $('#usuarios-table').html('<p>Error de conexión.</p>');
            }
        });
    }

    // Render usuarios table
    function renderUsuariosTable() {
        var searchTerm = $('#searchUsuario').val().toLowerCase();
        var filteredData = usersData.filter(function (usuario) {
            return usuario.fullname && usuario.fullname.toLowerCase().includes(searchTerm);
        });
        var table = '<table class="table table-striped"><thead><tr><th>ID</th><th>Nombre Completo</th><th>Usuario</th><th>Estado</th><th>Rol</th><th>Acciones</th></tr></thead><tbody>';
        filteredData.forEach(function (usuario) {
            var stateText = usuario.state == 1 ? 'Activo' : 'Inactivo';
            var stateClass = usuario.state == 1 ? 'badge bg-success' : 'badge bg-danger';
            var rolText = usuario.rol == 1 ? 'Admin' : 'Usuario';
            table += '<tr><td>' + usuario.id_user + '</td><td>' + (usuario.fullname || 'N/A') + '</td><td>' + (usuario.username || 'N/A') + '</td><td><span class="' + stateClass + '">' + stateText + '</span></td><td>' + rolText + '</td><td><button class="btn btn-sm btn-warning" onclick="openEditUserModal(' + usuario.id_user + ', \'' + (usuario.fullname || '') + '\', \'' + (usuario.username || '') + '\', ' + usuario.rol + ')"><i class="fas fa-edit"></i></button><button class="btn btn-sm btn-danger" onclick="deleteUser(' + usuario.id_user + ')"><i class="fas fa-trash"></i></button><button class="btn btn-sm btn-info" onclick="openChangePasswordModal(' + usuario.id_user + ')"><i class="fas fa-key"></i></button></td></tr>';
        });
        table += '</tbody></table>';
        $('#usuarios-table').html(table);
    }

    // Save new user
    $('#saveUser').click(function () {
        var fullname = $('#newUserFullname').val();
        var username = $('#newUserUsername').val();
        var password = $('#newUserPassword').val();
        var rol = $('#newUserRol').val();
        if (fullname && username && password && rol) {
            $.ajax({
                url: API_USERS_CREATE,
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    fullname: fullname,
                    username: username,
                    password: password,
                    rol: parseInt(rol)
                }),
                success: function (response) {
                    Swal.fire({
                        icon: response.status === 1 ? 'success' : 'error',
                        title: response.status === 1 ? 'Éxito' : 'Error',
                        text: response.message
                    });
                    if (response.status === 1) {
                        $('#createUserModal').modal('hide');
                        $('#createUserForm')[0].reset();
                        loadUsuarios(); // Reload the table
                    }
                },
                error: function () {
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
    });

    // Open edit user modal
    window.openEditUserModal = function (id, fullname, username, rol) {
        $('#editUserId').val(id);
        $('#editUserFullname').val(fullname);
        $('#editUserUsername').val(username);
        $('#editUserRol').val(rol);
        $('#editUserModal').modal('show');
    };

    // Open change password modal
    window.openChangePasswordModal = function (id) {
        $('#changePasswordUserId').val(id);
        $('#changePasswordModal').modal('show');
    };

    // Update password
    $('#updatePassword').click(function () {
        var id = $('#changePasswordUserId').val();
        var password = $('#newPassword').val();
        if (password && password.length >= 6) {
            $.ajax({
                url: API_USERS_UPDATE_PASSWORD + '/' + id + '/password',
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({
                    password: password
                }),
                success: function (response) {
                    Swal.fire({
                        icon: response.status === 1 ? 'success' : 'error',
                        title: response.status === 1 ? 'Éxito' : 'Error',
                        text: response.message
                    });
                    if (response.status === 1) {
                        $('#changePasswordModal').modal('hide');
                        $('#changePasswordForm')[0].reset();
                        loadUsuarios(); // Reload the table
                    }
                },
                error: function () {
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
    });

    // Update user
    $('#updateUser').click(function () {
        var id = $('#editUserId').val();
        var fullname = $('#editUserFullname').val();
        var username = $('#editUserUsername').val();
        var rol = $('#editUserRol').val();
        if (fullname && username && rol) {
            $.ajax({
                url: API_USERS_UPDATE + '/' + id,
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({
                    fullname: fullname,
                    username: username,
                    rol: parseInt(rol)
                }),
                success: function (response) {
                    Swal.fire({
                        icon: response.status === 1 ? 'success' : 'error',
                        title: response.status === 1 ? 'Éxito' : 'Error',
                        text: response.message
                    });
                    if (response.status === 1) {
                        $('#editUserModal').modal('hide');
                        $('#editUserForm')[0].reset();
                        loadUsuarios(); // Reload the table
                    }
                },
                error: function () {
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
    });

    // Delete user
    window.deleteUser = function (id) {
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
                    url: API_USERS_DELETE + '/' + id,
                    method: 'DELETE',
                    success: function (response) {
                        Swal.fire({
                            icon: response.status === 1 ? 'success' : 'error',
                            title: response.status === 1 ? 'Eliminado' : 'Error',
                            text: response.message
                        });
                        if (response.status === 1) {
                            loadUsuarios(); // Reload the table
                        }
                    },
                    error: function () {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Error de conexión.'
                        });
                    }
                });
            }
        });
    };

    // Create product modal show event
    $('#createProductModal').on('show.bs.modal', function () {
        // No need to fetch max_aux as it's generated server-side
    });

    // Save new product
    $('#saveProduct').click(function () {
        console.log('Paso 1: Iniciando proceso de guardado de producto');

        var brand = $('#productBrand').val().trim();
        var description = $('#productDescription').val().trim();
        var stock = $('#productStock').val().trim();
        var cost = $('#productCost').val().trim();
        var pvp = $('#productPvp').val().trim();
        var min = $('#productMin').val().trim();
        var code = $('#productCode').val().trim();

        console.log('Paso 2: Valores obtenidos del formulario', {
            brand: brand,
            description: description,
            stock: stock,
            cost: cost,
            pvp: pvp,
            min: min,
            code: code
        });

        console.log('Paso 3: Validando que todos los campos estén completos...');
        if (brand !== '' && description !== '' && stock !== '' && cost !== '' && pvp !== '' && min !== '' && code !== '') {
            console.log('Paso 4: Campos válidos, preparando datos para envío');

            var dataToSend = {
                brand: brand,
                description: description,
                stock: parseInt(stock),
                cost: parseFloat(cost),
                pvp: parseFloat(pvp),
                min: parseInt(min),
                code: code
            };

            console.log('Paso 5: Datos a enviar al servidor', dataToSend);

            $.ajax({
                url: API_PRODUCTS_CREATE,
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(dataToSend),
                success: function (response) {
                    console.log('Paso 6: Respuesta recibida del servidor', response);

                    Swal.fire({
                        icon: response.status === 1 ? 'success' : 'error',
                        title: response.status === 1 ? 'Éxito' : 'Error',
                        text: response.message
                    });

                    if (response.status === 1) {
                        console.log('Paso 7: Producto guardado exitosamente, cerrando modal y recargando lista');
                        $('#createProductModal').modal('hide');
                        $('#createProductForm')[0].reset();
                        loadProductos(); // Reload the products table
                    } else {
                        console.log('Paso 7: Error en la respuesta del servidor', response.message);
                    }
                },
                error: function (xhr, status, error) {
                    console.log('Paso 6: Error en la solicitud AJAX', {
                        status: status,
                        error: error,
                        responseText: xhr.responseText
                    });

                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Error de conexión.'
                    });
                }
            });
        } else {
            console.log('Paso 4: Campos inválidos - algunos campos están vacíos');
            Swal.fire({
                icon: 'warning',
                title: 'Campos requeridos',
                text: 'Por favor, complete todos los campos.'
            });
        }
    });
});

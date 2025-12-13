$(document).ready(function () {
    // Check if logged in
    if (localStorage.getItem('loggedIn') !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    // API Endpoints Configuration
    const API_BASE_INVENTARIOS = 'https://nestorcornejo.com/macguiver-inventarios';

    // Products API Endpoints
    const API_PRODUCTS_LIST = API_BASE_INVENTARIOS + '/products'; // GET: Obtener lista de productos
    const API_PRODUCTS_CREATE = API_BASE_INVENTARIOS + '/products'; // POST: Crear nuevo producto
    const API_PRODUCTS_UPDATE = API_BASE_INVENTARIOS + '/products'; // PUT: Actualizar producto
    const API_PRODUCTS_BULK_IMPORT = API_BASE_INVENTARIOS + '/products/bulk-import'; // POST: Importar productos en masa desde Excel

    // Users API Endpoints
    const API_USERS_LIST = API_BASE_INVENTARIOS + '/users'; // GET: Obtener lista de usuarios
    const API_USERS_CREATE = API_BASE_INVENTARIOS + '/users'; // POST: Crear nuevo usuario
    const API_USERS_UPDATE = API_BASE_INVENTARIOS + '/users'; // PUT: Actualizar usuario
    const API_USERS_UPDATE_PASSWORD = API_BASE_INVENTARIOS + '/users'; // PUT: Cambiar contraseña
    const API_USERS_DELETE = API_BASE_INVENTARIOS + '/users'; // DELETE: Eliminar usuario

    var productosData = []; // Store the productos data globally
    var usersData = []; // Store the users data globally
    var currentSearchInput = '#searchCode'; // Default for add stock modal

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
        } else if (section === 'qr-generator') {
            loadQRGenerator();
        }
    }

    // Logout functionality
    $('#logoutBtn').click(function() {
        Swal.fire({
            title: '¿Estás seguro?',
            text: '¿Quieres cerrar la sesión?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, cerrar sesión',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('loggedIn');
                localStorage.removeItem('user');
                localStorage.removeItem('userId');
                localStorage.removeItem('role');
                window.location.href = 'login.html';
            }
        });
    });

    // Display user name
    var userName = localStorage.getItem('user') || 'Usuario';
    $('#userName').text(userName);

    // Get user role
    var userRole = localStorage.getItem('role') || 2; // Default to user role if not set

    // Search functionality
    $(document).on('keyup', '#searchProducto', function() {
        renderProductosTable();
    });

    $(document).on('keyup', '#searchUsuario', function() {
        renderUsuariosTable();
    });

    // Button event handlers

    // Search products functionality
    $(document).on('click', '#searchProductsBtn', function() {
        performProductSearch();
    });

    $(document).on('keyup', '#productSearchInput', function(e) {
        if (e.key === 'Enter') {
            performProductSearch();
        }
    });

    // QR Scanner for search bar
    $(document).on('click', '#scanQRSearchBtn', function() {
        $('#qrScannerSearchModal').modal('show');
    });

    $('#qrScannerSearchModal').on('shown.bs.modal', function () {
        startQRScannerForSearch();
    });

    $('#qrScannerSearchModal').on('hidden.bs.modal', function () {
        stopQRScannerForSearch();
    });

    function performProductSearch() {
        var searchTerm = $('#productSearchInput').val().trim().toLowerCase();
        if (!searchTerm) {
            $('#search-results').hide();
            return;
        }

        var filteredProducts = productosData.filter(function(product) {
            return (product.code && product.code.toLowerCase().includes(searchTerm)) ||
                   (product.description && product.description.toLowerCase().includes(searchTerm)) ||
                   (product.aux && product.aux.toString().toLowerCase().includes(searchTerm));
        });

        renderSearchResults(filteredProducts);
        $('#search-results').show();
    }

    // Unified function to render products list
    function renderProductsList(products, containerId, colClass = 'col-4') {
        var html = '';
        if (products.length === 0) {
            html = '<div class="col-12"><div class="alert alert-info">No se encontraron productos.</div></div>';
        } else {
            products.forEach(function(product) {
                var productInfo = '<strong>Stock:</strong> ' + (product.stock || 0) + ' | <strong>PVP:</strong> $' + (product.pvp || 0) + ' | <strong>Aux:</strong> ' + (product.aux || 0) + ' | <small class="text-muted">ID: ' + product.id_product + '</small>';
                if (userRole == 1) { // Admin role
                    productInfo = '<strong>Stock:</strong> ' + (product.stock || 0) + ' | <strong>Costo:</strong> $' + (product.cost || 0) + ' | <strong>PVP:</strong> $' + (product.pvp || 0) + ' | <strong>Mínimo:</strong> ' + (product.min || 0) + ' | <strong>Aux:</strong> ' + (product.aux || 0) + ' | <small class="text-muted">ID: ' + product.id_product + '</small>';
                }
                var editButton = userRole == 1 ? '<button class="btn-custom btn-warning-custom mt-2" onclick="openEditProductModal(' + product.id_product + ', \'' + (product.brand || '') + '\', \'' + (product.description || '') + '\', ' + (product.stock || 0) + ', ' + (product.cost || 0) + ', ' + (product.pvp || 0) + ', ' + (product.min || 0) + ', \'' + (product.code || '') + '\')"><i class="fas fa-edit"></i> Editar</button>' : '';
                var qrButton = '<button class="btn-custom btn-info-custom mt-2" onclick="generateQRCode(\'' + (product.aux || '') + '\', \'' + (product.description || '') + '\')"><i class="fas fa-qrcode"></i> QR</button>';
                html += '<div class="' + colClass + '">' +
                    '<div class="card shadow-sm">' +
                    '<div class="card-header bg-primary text-white">' +
                    '<h5 class="card-title mb-0">' + (product.code || 'N/A') + ' | ' + (product.description || 'N/A') + '</h5>' +
                    '</div>' +
                    '<div class="card-body">' +
                    '<p class="card-text mb-0">' + productInfo + '</p>' +
                    '<div class="d-flex gap-1">' +
                    editButton +
                    qrButton +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</div>';
            });
        }
        $('#' + containerId).html(html);
    }

    function renderSearchResults(products) {
        renderProductsList(products, 'products-results', 'col-12');
    }



    // Load productos stats by default
    function loadProductos() {
        var searchHtml = '<div class="row justify-content-center mt-4"><div class="col-md-8"><div class="card shadow-sm"><div class="card-body"><h6 class="card-title">Buscar Productos</h6><div class="input-group"><input type="text" id="productSearchInput" class="form-control" placeholder="Buscar por código, descripción o aux (ej: frenos posterior)"><button class="btn btn-primary" type="button" id="searchProductsBtn"><i class="fas fa-search"></i> Buscar</button><button class="btn btn-secondary" type="button" id="scanQRSearchBtn"><i class="fas fa-qrcode"></i> Escanear QR</button></div><div id="search-results" class="mt-4" style="display: none;"><div class="row g-3" id="products-results"></div></div></div></div></div></div>';
    $('#content-area').html('<div id="productos-content" class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Cargando...</span></div></div>' + searchHtml);
        loadProductosStats();
    }

    // Load productos stats
    function loadProductosStats() {
        $.ajax({
            url: API_PRODUCTS_LIST.replace('/products', '/products/stats'),
            method: 'GET',
            success: function (response) {
                if (response.status === 1) {
                    var stats = response.data;
                    var statsHtml = '<div class="row justify-content-center"><div class="col-12"><div class="stats-container"><div class="card"><div class="card-header"><h5 class="card-title mb-0">Información del Módulo de Productos</h5></div><div class="card-body"><div class="row"><div class="col-6"><h4 class="text-primary">' + (stats.total_products || 0) + '</h4><p class="mb-0">Total de Productos Registrados</p></div><div class="col-6"><h4 class="text-success">$' + (stats.total_value || 0) + '</h4><p class="mb-0">Valor Total del Inventario</p></div></div></div></div></div></div></div>';
                    var actionsHtml = '<div class="actions-header"><div class="section-title">Productos</div><div class="btn-group-custom"><button type="button" class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#createProductModal"><i class="fas fa-plus"></i> Nuevo Producto</button><button type="button" class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#importProductsModal"><i class="fas fa-upload"></i> Importar Excel</button><button type="button" class="btn btn-info btn-sm" data-bs-toggle="modal" data-bs-target="#addStockModal"><i class="fas fa-plus-circle"></i> Agregar Stock</button></div></div>';
                    $('#productos-content').html(statsHtml + actionsHtml);

                    // Load productos data for search
                    $.ajax({
                        url: API_PRODUCTS_LIST,
                        method: 'GET',
                        success: function (response) {
                            if (response.status === 1) {
                                productosData = response.data;
                            }
                        },
                        error: function () {
                            // Handle error silently
                        }
                    });
                } else {
                    $('#productos-content').html('<p>Error al cargar estadísticas: ' + response.message + '</p>');
                }
            },
            error: function () {
                $('#productos-content').html('<p>Error de conexión.</p>');
            }
        });
    }





    // Render productos cards
    function renderProductosTable() {
        var searchTerm = $('#searchProducto').val().toLowerCase();
        var filteredData = productosData.filter(function (producto) {
            return producto.brand && producto.brand.toLowerCase().includes(searchTerm);
        });
        renderProductsList(filteredData, 'productos-table', 'col-4');
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

    // Load QR Generator
    function loadQRGenerator() {
        var qrGeneratorHtml = '<h2>Generador de Códigos QR</h2>' +
            '<div class="row justify-content-center mt-4">' +
            '<div class="col-md-8">' +
            '<div class="card shadow-sm">' +
            '<div class="card-body">' +
            '<h6 class="card-title">Generar Código QR</h6>' +
            '<div class="mb-3">' +
            '<label for="qrText" class="form-label">Texto o Código</label>' +
            '<input type="text" class="form-control" id="qrText" placeholder="Ingrese el texto o código para generar QR">' +
            '</div>' +
            '<div class="mb-3">' +
            '<label for="qrDescription" class="form-label">Descripción (opcional)</label>' +
            '<input type="text" class="form-control" id="qrDescription" placeholder="Descripción del QR">' +
            '</div>' +
            '<button class="btn btn-primary" id="generateCustomQRBtn"><i class="fas fa-qrcode"></i> Generar QR</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '<div class="row justify-content-center mt-4" id="qrResult" style="display: none;">' +
            '<div class="col-md-8">' +
            '<div class="card shadow-sm">' +
            '<div class="card-header">' +
            '<h6 class="card-title mb-0">Código QR Generado</h6>' +
            '</div>' +
            '<div class="card-body text-center">' +
            '<div id="customQrContainer"></div>' +
            '<p id="customQrInfo" class="mt-2"></p>' +
            '<button class="btn btn-success mt-3" id="downloadCustomQR"><i class="fas fa-download"></i> Descargar QR</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
        $('#content-area').html(qrGeneratorHtml);

        // Event handler for generating custom QR
        $('#generateCustomQRBtn').click(function () {
            var text = $('#qrText').val().trim();
            var description = $('#qrDescription').val().trim();
            if (!text) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Campo requerido',
                    text: 'Por favor, ingrese el texto o código para generar el QR.'
                });
                return;
            }
            generateCustomQRCode(text, description);
        });
    }

    // Function to generate custom QR code
    function generateCustomQRCode(text, description) {
        var qrContainer = document.getElementById('customQrContainer');
        var qrInfo = document.getElementById('customQrInfo');

        // Clear previous QR code
        qrContainer.innerHTML = '';

        // Generate QR code
        QRCode.toCanvas(text, { width: 256, height: 256 }, function (error, canvas) {
            if (error) {
                console.error(error);
                qrInfo.textContent = 'Error al generar el código QR.';
                return;
            }

            // Append canvas to container
            qrContainer.appendChild(canvas);

            // Set info text
            qrInfo.textContent = 'Texto: ' + text + (description ? ' - ' + description : '');

            // Show result
            $('#qrResult').show();

            // Set up download functionality
            $('#downloadCustomQR').off('click').on('click', function () {
                var link = document.createElement('a');
                link.download = 'qr_custom.png';
                link.href = canvas.toDataURL();
                link.click();
            });
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

    // Open edit product modal
    window.openEditProductModal = function (id, brand, description, stock, cost, pvp, min, code) {
        $('#editProductId').val(id);
        $('#editProductBrand').val(brand);
        $('#editProductDescription').val(description);
        $('#editProductStock').val(stock);
        $('#editProductCost').val(cost);
        $('#editProductPvp').val(pvp);
        $('#editProductMin').val(min);
        $('#editProductCode').val(code);
        $('#editProductModal').modal('show');
    };

    // Update product
    $('#updateProduct').click(function () {
        var id = $('#editProductId').val();
        var brand = $('#editProductBrand').val().trim();
        var description = $('#editProductDescription').val().trim();
        var stock = $('#editProductStock').val().trim();
        var cost = $('#editProductCost').val().trim();
        var pvp = $('#editProductPvp').val().trim();
        var min = $('#editProductMin').val().trim();
        var code = $('#editProductCode').val().trim();

        if (brand !== '' && description !== '' && stock !== '' && cost !== '' && pvp !== '' && min !== '' && code !== '') {
            $.ajax({
                url: API_PRODUCTS_UPDATE + '/' + id,
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({
                    brand: brand,
                    description: description,
                    stock: parseInt(stock),
                    cost: parseFloat(cost),
                    pvp: parseFloat(pvp),
                    min: parseInt(min),
                    code: code
                }),
                success: function (response) {
                    Swal.fire({
                        icon: response.status === 1 ? 'success' : 'error',
                        title: response.status === 1 ? 'Éxito' : 'Error',
                        text: response.message
                    });
                    if (response.status === 1) {
                        $('#editProductModal').modal('hide');
                        $('#editProductForm')[0].reset();
                        loadProductos(); // Reload the products table
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

    // Add stock functionality
    var currentProductForStock = null;

    // Search product for adding stock
    $('#searchProductBtn').click(function () {
        var searchCode = $('#searchCode').val().trim();
        if (!searchCode) {
            Swal.fire({
                icon: 'warning',
                title: 'Campo requerido',
                text: 'Por favor, ingrese un código o aux.'
            });
            return;
        }

        // Find product by code or aux
        var foundProduct = productosData.find(function (product) {
            return product.code === searchCode || product.aux == searchCode;
        });

        if (foundProduct) {
            currentProductForStock = foundProduct;
            $('#foundCode').text(foundProduct.code || 'N/A');
            $('#foundDescription').text(foundProduct.description || 'N/A');
            $('#foundStock').text(foundProduct.stock || 0);
            $('#productInfo').show();
            $('#updateStockBtn').show();
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Producto no encontrado',
                text: 'No se encontró un producto con ese código o aux.'
            });
            $('#productInfo').hide();
            $('#updateStockBtn').hide();
        }
    });

    // Update stock
    $('#updateStockBtn').click(function () {
        var newStock = parseInt($('#newStock').val());
        if (isNaN(newStock) || newStock < 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Stock inválido',
                text: 'Por favor, ingrese un stock válido.'
            });
            return;
        }

        var updatedStock = (currentProductForStock.stock || 0) + newStock;

        $.ajax({
            url: API_PRODUCTS_UPDATE + '/' + currentProductForStock.id_product,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({
                stock: updatedStock
            }),
            success: function (response) {
                Swal.fire({
                    icon: response.status === 1 ? 'success' : 'error',
                    title: response.status === 1 ? 'Éxito' : 'Error',
                    text: response.message
                });
                if (response.status === 1) {
                    $('#addStockModal').modal('hide');
                    $('#searchCode').val('');
                    $('#newStock').val('');
                    $('#productInfo').hide();
                    $('#updateStockBtn').hide();
                    currentProductForStock = null;
                    loadProductos(); // Reload the products table
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
    });

    // QR Scanner functionality
    let scanner = null;

    $('#scanQRBtn').click(function () {
        $('#qrScannerModal').modal('show');
    });

    $('#qrScannerModal').on('shown.bs.modal', function () {
        startQRScanner();
    });

    $('#qrScannerModal').on('hidden.bs.modal', function () {
        stopQRScanner();
    });

    function startQRScanner() {
        if (scanner) {
            scanner.stop();
        }

        scanner = new Instascan.Scanner({ video: document.getElementById('qr-video') });

        scanner.addListener('scan', function (content) {
            // Populate the search input with the scanned QR code
            $('#searchCode').val(content);
            // Close the scanner modal
            $('#qrScannerModal').modal('hide');
            // Automatically trigger the search
            $('#searchProductBtn').click();
        });

        Instascan.Camera.getCameras().then(function (cameras) {
            if (cameras.length > 0) {
                scanner.start(cameras[0]); // Start with the first camera
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'No se encontró cámara',
                    text: 'No se pudo acceder a la cámara del dispositivo.'
                });
                $('#qrScannerModal').modal('hide');
            }
        }).catch(function (e) {
            console.error(e);
            Swal.fire({
                icon: 'error',
                title: 'Error de cámara',
                text: 'Error al acceder a la cámara: ' + e.message
            });
            $('#qrScannerModal').modal('hide');
        });
    }

    function stopQRScanner() {
        if (scanner) {
            scanner.stop();
            scanner = null;
        }
    }

    // Function to play a beep sound
    function playBeep() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // Frequency in Hz (800 Hz for beep)
        oscillator.type = 'square'; // Square wave for beep sound
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime); // Volume

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1); // Duration: 0.1 seconds
    }

    // QR Scanner for search functionality
    let searchScanner = null;

    function startQRScannerForSearch() {
        if (searchScanner) {
            searchScanner.stop();
        }

        searchScanner = new Instascan.Scanner({ video: document.getElementById('qr-search-video') });

        searchScanner.addListener('scan', function (content) {
            // Play beep sound on scan
            playBeep();
            // Validate and truncate to first 8 characters if longer
            var searchValue = content.length > 8 ? content.substring(0, 8) : content;
            // Populate the search input with the scanned QR code
            $('#productSearchInput').val(searchValue);
            // Close the scanner modal
            $('#qrScannerSearchModal').modal('hide');
            // Automatically trigger the search
            performProductSearch();
        });

        Instascan.Camera.getCameras().then(function (cameras) {
            if (cameras.length > 0) {
                // Prefer back camera if available
                let selectedCamera = cameras[0];
                for (let camera of cameras) {
                    if (camera.name && (camera.name.toLowerCase().includes('back') || camera.name.toLowerCase().includes('rear'))) {
                        selectedCamera = camera;
                        break;
                    }
                }
                searchScanner.start(selectedCamera);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'No se encontró cámara',
                    text: 'No se pudo acceder a la cámara del dispositivo.'
                });
                $('#qrScannerSearchModal').modal('hide');
            }
        }).catch(function (e) {
            console.error(e);
            Swal.fire({
                icon: 'error',
                title: 'Error de cámara',
                text: 'Error al acceder a la cámara: ' + e.message
            });
            $('#qrScannerSearchModal').modal('hide');
        });
    }

    function stopQRScannerForSearch() {
        if (searchScanner) {
            searchScanner.stop();
            searchScanner = null;
        }
    }

    // Generate QR Code function
    window.generateQRCode = function (code, description, brand) {
        var qrContainer = document.getElementById('qr-code-container');
        var qrInfo = document.getElementById('qr-code-info');

        // Clear previous QR code
        qrContainer.innerHTML = '';

        // Generate QR code
        QRCode.toCanvas(code, { width: 256, height: 256 }, function (error, canvas) {
            if (error) {
                console.error(error);
                qrInfo.textContent = 'Error al generar el código QR.';
                return;
            }

            // Append canvas to container
            qrContainer.appendChild(canvas);

            // Set info text
            qrInfo.textContent = 'Código: ' + code + ' - ' + description;

            // Show modal
            $('#qrCodeModal').modal('show');

            // Set up download functionality
            $('#downloadQR').off('click').on('click', function () {
                var link = document.createElement('a');
                link.download = 'qr_' + code + '.png';
                link.href = canvas.toDataURL();
                link.click();
            });

            // Add print button if not already added
            if (!document.getElementById('printQRBtn')) {
                var printBtn = document.createElement('button');
                printBtn.id = 'printQRBtn';
                printBtn.className = 'btn btn-primary mt-2';
                printBtn.textContent = 'Imprimir Etiqueta';
                printBtn.style.marginLeft = '10px';
                printBtn.onclick = function () {
                    printLabel(code, description, brand);
                };
                qrInfo.parentNode.appendChild(printBtn);
            } else {
                // Update print button onclick in case brand changes
                document.getElementById('printQRBtn').onclick = function () {
                    printLabel(code, description, brand);
                };
            }
        });
    };

    // Function to print label in a new tab with formatted content
    window.printLabel = function (code, description, brand) {
        var printWindow = window.open('', '_blank');
        var htmlContent = `
            <html>
            <head>
                <title>Etiqueta Producto</title>
                <style>
                    @media print {
                        @page {
                            size: 80mm 30mm;
                            margin: 0mm;
                            orientation: landscape;
                        }
                        body {
                            margin: 0;
                            padding: 0;
                        }
                    }
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 1px;
                    }
                    .label-container {
                        width: 78mm;
                        height: 28mm;
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        justify-content: space-between;
                        box-sizing: border-box;
                        padding: 1px;
                    }
                    .brand-text {
                        font-size: 8px;
                        text-align: center;
                        flex: 0 0 auto;
                        margin-right: 3px;
                        writing-mode: vertical-rl;
                        text-orientation: mixed;
                        transform: rotate(180deg);
                    }
                    .qr-code {
                        width: 24mm;
                        height: 24mm;
                        flex: 0 0 auto;
                        margin-right: 3px;
                    }
                    .code-text {
                        font-size: 12px;
                        font-weight: bold;
                        flex: 0 0 auto;
                        margin-right: 3px;
                    }
                    .description {
                        font-size: 10px;
                        text-align: left;
                        word-wrap: break-word;
                        flex: 1;
                        overflow: hidden;
                        line-height: 1.1;
                    }
                </style>
                    </head>
                    <body>
                        <div class="label-container">
                            <div class="brand-text">${brand || ''}</div>
                            <canvas id="printQrCanvas" class="qr-code"></canvas>
                            <div class="code-text">COD: ${code}</div>
                            <div class="description">${description || ''}</div>
                        </div>
                        <script src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js"></script>
                        <script>
                            window.onload = function() {
                                var canvas = document.getElementById('printQrCanvas');
                                QRCode.toCanvas(canvas, '${code}', { width: 60, height: 60 }, function (error) {
                                    if (error) console.error(error);
                                    window.print();
                                });
                            };
                        <\/script>
                    </body>
                    </html>
        `;
        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };
});

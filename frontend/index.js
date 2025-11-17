$(document).ready(function () {
    // Check if logged in
    // if (localStorage.getItem('loggedIn') !== 'true') {
    //     window.location.href = 'login.html';
    //     return;
    // }

    var formsData = []; // Store the forms data globally
    var productosData = []; // Store the productos data globally

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
        if (section === 'formularios') {
            loadFormularios();
        } else if (section === 'usuarios') {
            loadUsuarios();
        } else if (section === 'productos') {
            loadProductos();
        } else if (section === 'pagos') {
            loadPagos();
        }
    }

    // Event listeners for search and filter
    $(document).on('input', '#searchName', function () {
        renderTable();
    });
    $(document).on('change', '#filterStatus', function () {
        renderTable();
    });
    $(document).on('change', '#filterCountry', function () {
        renderTable();
    });
    $(document).on('change', '#filterDateFrom', function () {
        renderTable();
    });
    $(document).on('change', '#filterDateTo', function () {
        renderTable();
    });
    $(document).on('click', '#refreshBtn', function () {
        loadFormularios();
    });

    // Load formularios
    function loadFormularios() {
        $('#content-area').html('<h2>Formularios</h2><div class="d-flex justify-content-between mb-3"><div class="d-flex"><input type="text" id="searchName" class="form-control form-control-sm me-2" placeholder="Buscar por nombre"><select id="filterStatus" class="form-select form-select-sm me-2"><option value="">Todos los estados</option><option value="1">Completado</option><option value="0">Pendiente</option></select><select id="filterCountry" class="form-select form-select-sm me-2"><option value="">Todos los países</option></select><input type="date" id="filterDateFrom" class="form-control form-control-sm me-2" placeholder="Fecha desde"><input type="date" id="filterDateTo" class="form-control form-control-sm me-2" placeholder="Fecha hasta"></div><div><button id="refreshBtn" class="btn btn-secondary btn-sm"><i class="fas fa-sync"></i> Actualizar</button><button type="button" class="btn btn-outline-dark btn-sm ms-2" data-bs-toggle="modal" data-bs-target="#createFormModal"><i class="fas fa-file-plus"></i> Nuevo</button></div></div><div id="formularios-table" class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Cargando...</span></div></div>');
        $.ajax({
            url: 'https://fercoadvancededucation.com/php-ferco-files-ws/forms',
            method: 'GET',
            success: function (response) {
                if (response.status === 1) {
                    formsData = response.data; // Store the data
                    // Fetch file counts asynchronously for all forms
                    var promises = formsData.map(function (form) {
                        return $.ajax({
                            url: 'https://fercoadvancededucation.com/php-ferco-files-ws/files/form/' + form.id_form,
                            method: 'GET'
                        }).then(function (fileResponse) {
                            form.fileCount = fileResponse.status === 1 ? fileResponse.data.length : 0;
                        }).catch(function () {
                            form.fileCount = 0;
                        });
                    });
                    // Wait for all file counts to be fetched
                    $.when.apply($, promises).then(function () {
                        populateCountryFilter();
                        renderTable();
                    });
                } else {
                    $('#formularios-table').html('<p>Error al cargar formularios: ' + response.message + '</p>');
                }
            },
            error: function () {
                $('#formularios-table').html('<p>Error de conexión.</p>');
            }
        });
    }

    // Load usuarios
    function loadUsuarios() {
        $('#content-area').html('<h2>Usuarios</h2><div class="d-flex justify-content-between mb-3"><div class="d-flex"><input type="text" id="searchUserName" class="form-control form-control-sm me-2" placeholder="Buscar por nombre"></div><div><button id="refreshUsersBtn" class="btn btn-secondary btn-sm"><i class="fas fa-sync"></i> Actualizar</button></div></div><div id="usuarios-table" class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Cargando...</span></div></div>');
        $.ajax({
            url: 'https://nestorcornejo.com/macguiver-inventarios/users',
            method: 'GET',
            success: function (response) {
                if (response.status === 1) {
                    usersData = response.data; // Store the data
                    renderUsersTable();
                } else {
                    $('#usuarios-table').html('<p>Error al cargar usuarios: ' + response.message + '</p>');
                }
            },
            error: function () {
                $('#usuarios-table').html('<p>Error de conexión.</p>');
            }
        });
    }

    // Load productos
    function loadProductos() {
        $('#content-area').html('<h2>Productos</h2><div class="d-flex flex-column flex-md-row justify-content-between mb-3"><div class="d-flex mb-2 mb-md-0"><input type="text" id="searchProducto" class="form-control form-control-sm me-2" placeholder="Buscar por marca"></div><div class="d-flex gap-2"><button id="refreshProductosBtn" class="btn btn-secondary btn-sm"><i class="fas fa-sync"></i> Actualizar</button><button type="button" class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#importProductsModal"><i class="fas fa-upload"></i> Importar Excel</button></div></div><div id="productos-table" class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Cargando...</span></div></div>');
        $.ajax({
            url: 'https://nestorcornejo.com/macguiver-inventarios/products',
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

    // Load pagos
    function loadPagos() {
        $('#content-area').html('<h2>Pagos</h2><div class="d-flex justify-content-between mb-3"><div class="d-flex"><input type="text" id="searchPago" class="form-control form-control-sm me-2" placeholder="Buscar por referencia"></div><div><button id="refreshPagosBtn" class="btn btn-secondary btn-sm"><i class="fas fa-sync"></i> Actualizar</button></div></div><div id="pagos-table" class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Cargando...</span></div></div>');
        $.ajax({
            url: 'https://fercoadvancededucation.com/php-ferco-files-ws/pagos',
            method: 'GET',
            success: function (response) {
                if (response.status === 1) {
                    pagosData = response.data; // Store the data
                    renderPagosTable();
                } else {
                    $('#pagos-table').html('<p>Error al cargar pagos: ' + response.message + '</p>');
                }
            },
            error: function () {
                $('#pagos-table').html('<p>Error de conexión.</p>');
            }
        });
    }

    // Populate country filter
    function populateCountryFilter() {
        var countries = [...new Set(formsData.map(form => form.country).filter(country => country))];
        var options = '<option value="">Todos los países</option>';
        countries.forEach(function (country) {
            options += '<option value="' + country + '">' + country + '</option>';
        });
        $('#filterCountry').html(options);
    }

    // Render the table with filters
    function renderTable() {
        var searchTerm = $('#searchName').val().toLowerCase();
        var statusFilter = $('#filterStatus').val();
        var countryFilter = $('#filterCountry').val();
        var dateFrom = $('#filterDateFrom').val();
        var dateTo = $('#filterDateTo').val();
        var filteredData = formsData.filter(function (form) {
            var matchesSearch = form.name && form.name.toLowerCase().includes(searchTerm);
            var matchesStatus = statusFilter === '' || form.status.toString() === statusFilter;
            var matchesCountry = countryFilter === '' || form.country === countryFilter;
            var matchesDate = true;
            if (dateFrom && form.date < dateFrom) matchesDate = false;
            if (dateTo && form.date > dateTo) matchesDate = false;
            return matchesSearch && matchesStatus && matchesCountry && matchesDate;
        });
        var table = '<table class="table table-striped"><thead><tr><th>ID</th><th>Nombre</th><th>Fecha</th><th>Teléfono</th><th>País</th><th>Email</th><th>Estado</th><th>Archivos</th><th>Acciones</th></tr></thead><tbody>';
        filteredData.forEach(function (form) {
            var statusText = form.status === 1 ? 'Completado' : 'Pendiente';
            var statusIcon = form.status === 1 ? '<i class="fas fa-check-circle text-success"></i>' : '<i class="fas fa-exclamation-triangle text-warning"></i>';
            var statusDisplay = statusIcon + ' ' + statusText;
            var fileCount = form.fileCount || 0;
            table += '<tr><td>' + form.id_form + '</td><td>' + form.name + '</td><td>' + form.date + '</td><td>' + (form.phone || '') + '</td><td>' + (form.country || '') + '</td><td>' + (form.email || '') + '</td><td>' + statusDisplay + '</td><td class="text-center">' + fileCount + '</td><td class="text-start"><div class="d-flex flex-column gap-1"><button class="btn btn-warning btn-xs" onclick="openEditFormModal(' + form.id_form + ', \'' + form.name.replace(/'/g, "\\'") + '\', \'' + form.date + '\', \'' + (form.phone || '') + '\', \'' + (form.country || '') + '\', \'' + (form.email || '') + '\')"><i class="fas fa-edit"></i> Edit</button><button class="btn btn-info btn-xs" onclick="openCreateFileModal(' + form.id_form + ')"><i class="fas fa-file"></i> Assign File</button><button class="btn btn-secondary btn-xs" onclick="viewFilesModal(' + form.id_form + ')"><i class="fas fa-list"></i> Files</button><button class="btn btn-success btn-xs" onclick="shareFormModal(' + form.id_form + ')"><i class="fas fa-share"></i> Share</button><button class="btn btn-primary btn-xs" onclick="sendEmailForm(' + form.id_form + ')"><i class="fas fa-envelope"></i> Send Email</button><button class="btn btn-danger btn-xs" onclick="deleteForm(' + form.id_form + ')"><i class="fas fa-trash"></i> Delete</button></div></td></tr>';
        });
        table += '</tbody></table>';
        $('#formularios-table').html(table);
    }

    // Set current date on modal show
    $('#createFormModal').on('show.bs.modal', function () {
        var today = new Date().toISOString().split('T')[0];
        $('#formDate').val(today);
    });

    // Save new form
    $('#saveForm').click(function () {
        var name = $('#formName').val();
        var date = $('#formDate').val();
        var phone = $('#formPhone').val();
        var country = $('#formCountry').val();
        var email = $('#formEmail').val();
        if (name && date && phone && country && email) {
            $.ajax({
                url: 'https://fercoadvancededucation.com/php-ferco-files-ws/forms',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    name: name,
                    date: date,
                    status: 0,
                    phone: phone,
                    country: country,
                    email: email
                }),
                success: function (response) {
                    Swal.fire({
                        icon: response.status === 1 ? 'success' : 'error',
                        title: response.status === 1 ? 'Éxito' : 'Error',
                        text: response.message
                    });
                    if (response.status === 1) {
                        $('#createFormModal').modal('hide');
                        $('#createForm')[0].reset();
                        loadFormularios(); // Reload the table
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

    // Open edit form modal
    window.openEditFormModal = function (id, name, date, phone, country, email) {
        $('#editFormId').val(id);
        $('#editFormName').val(name);
        $('#editFormDate').val(date);
        $('#editFormPhone').val(phone);
        $('#editFormCountry').val(country);
        $('#editFormEmail').val(email);
        $('#editFormModal').modal('show');
    };

    // Open create file modal
    window.openCreateFileModal = function (fkForm) {
        $('#fileFkForm').val(fkForm);
        $('#createFileModal').modal('show');
    };

    // Save new file
    $('#saveFile').click(function () {
        var fkForm = $('#fileFkForm').val();
        var title = $('#fileTitle').val();
        if (title) {
            $.ajax({
                url: 'https://fercoadvancededucation.com/php-ferco-files-ws/files',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    fk_form: fkForm,
                    title: title
                }),
                success: function (response) {
                    Swal.fire({
                        icon: response.status === 1 ? 'success' : 'error',
                        title: response.status === 1 ? 'Éxito' : 'Error',
                        text: response.message
                    });
                    if (response.status === 1) {
                        $('#createFileModal').modal('hide');
                        $('#createFileForm')[0].reset();
                        loadFormularios(); // Reload the table
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
                text: 'Por favor, complete el título.'
            });
        }
    });

    // View files modal
    window.viewFilesModal = function (idForm) {
        $('#viewFilesModalLabel').text('Archivos del Formulario ID: ' + idForm);
        $('#files-list').html('<p>Cargando archivos...</p>');
        $('#viewFilesModal').modal('show');

        $.ajax({
            url: 'https://fercoadvancededucation.com/php-ferco-files-ws/files/form/' + idForm,
            method: 'GET',
            success: function (response) {
                if (response.status === 1 && response.data.length > 0) {
                    var filesHtml = '<div class="list-group">';
                    response.data.forEach(function (file) {
                        var fileUrl = file.path ? '<a href="' + file.path + '" target="_blank" class="btn btn-sm btn-outline-primary me-2"><i class="fas fa-download"></i> Descargar</a>' : '';
                        filesHtml += '<div class="list-group-item d-flex justify-content-between align-items-center">' +
                            '<div>' +
                            '<strong>' + file.title + '</strong><br>' +
                            '<small class="text-muted">Tipo: ' + (file.type || 'N/A') + ' | Descripción: ' + (file.description || 'N/A') + '</small>' +
                            '</div>' +
                            '<div>' +
                            fileUrl +
                            '<button class="btn btn-sm btn-outline-danger" onclick="deleteFile(' + file.id_file + ')"><i class="fas fa-trash"></i></button>' +
                            '</div>' +
                            '</div>';
                    });
                    filesHtml += '</div>';
                    $('#files-list').html(filesHtml);
                } else {
                    $('#files-list').html('<p>No hay archivos asociados a este formulario.</p>');
                }
            },
            error: function () {
                $('#files-list').html('<p>Error al cargar archivos.</p>');
            }
        });
    };

    // Delete file
    window.deleteFile = function (id) {
        Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción eliminará el archivo permanentemente.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: 'https://fercoadvancededucation.com/php-ferco-files-ws/files/' + id,
                    method: 'DELETE',
                    success: function (response) {
                        Swal.fire({
                            icon: response.status === 1 ? 'success' : 'error',
                            title: response.status === 1 ? 'Eliminado' : 'Error',
                            text: response.message
                        });
                        if (response.status === 1) {
                            $('#viewFilesModal').modal('hide');
                            loadFormularios(); // Reload the table
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

    // Share form modal
    window.shareFormModal = function (idForm) {
        var shareUrl = 'https://fercoadvancededucation.com/php-ferco-files-ws/up-file/index.html?id_form=' + idForm;
        $('#shareLink').val(shareUrl);
        // Store the form ID for WhatsApp sharing
        $('#shareFormModal').data('formId', idForm);
        $('#shareFormModal').modal('show');
    };

    // Copy link to clipboard
    $('#copyLink').click(function () {
        var copyText = document.getElementById('shareLink');
        copyText.select();
        copyText.setSelectionRange(0, 99999); // For mobile devices
        navigator.clipboard.writeText(copyText.value).then(function () {
            Swal.fire({
                icon: 'success',
                title: 'Copiado',
                text: 'Enlace copiado al portapapeles.'
            });
        }).catch(function (err) {
            console.error('Error al copiar: ', err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo copiar el enlace.'
            });
        });
    });

    // Open link in new window
    $('#openLink').click(function () {
        var url = $('#shareLink').val();
        window.open(url, '_blank');
    });

    // Share on WhatsApp
    $('#shareWhatsApp').click(function () {
        var formId = $('#shareFormModal').data('formId');
        var shareUrl = $('#shareLink').val();
        // Find the phone number from formsData
        var form = formsData.find(function (f) {
            return f.id_form == formId;
        });
        if (form && form.phone) {
            var phone = form.phone.replace(/\D/g, ''); // Remove non-digits
            var whatsappUrl = 'https://wa.me/' + phone + '?text=' + encodeURIComponent('Aquí tienes el enlace para subir archivos: ' + shareUrl);
            window.open(whatsappUrl, '_blank');
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se encontró el número de teléfono para este formulario.'
            });
        }
    });

    // Update form
    $('#updateForm').click(function () {
        var id = $('#editFormId').val();
        var name = $('#editFormName').val();
        var date = $('#editFormDate').val();
        var phone = $('#editFormPhone').val();
        var country = $('#editFormCountry').val();
        var email = $('#editFormEmail').val();
        if (name && date && phone && country && email) {
            $.ajax({
                url: 'https://fercoadvancededucation.com/php-ferco-files-ws/forms/' + id,
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({
                    name: name,
                    date: date,
                    phone: phone,
                    country: country,
                    email: email
                }),
                success: function (response) {
                    Swal.fire({
                        icon: response.status === 1 ? 'success' : 'error',
                        title: response.status === 1 ? 'Éxito' : 'Error',
                        text: response.message
                    });
                    if (response.status === 1) {
                        $('#editFormModal').modal('hide');
                        $('#editForm')[0].reset();
                        loadFormularios(); // Reload the table
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

    // Delete form
    window.deleteForm = function (id) {
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
                    url: 'https://fercoadvancededucation.com/php-ferco-files-ws/forms/' + id,
                    method: 'DELETE',
                    success: function (response) {
                        Swal.fire({
                            icon: response.status === 1 ? 'success' : 'error',
                            title: response.status === 1 ? 'Eliminado' : 'Error',
                            text: response.message
                        });
                        if (response.status === 1) {
                            loadFormularios(); // Reload the table
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

    // Display user name
    var userName = localStorage.getItem('user');
    if (userName) {
        $('#userName').text('Bienvenido, ' + userName);
    }

    // Logout functionality
    $('#logoutBtn').click(function () {
        Swal.fire({
            title: '¿Cerrar sesión?',
            text: '¿Estás seguro de que quieres cerrar sesión?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, cerrar sesión',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('loggedIn');
                localStorage.removeItem('user');
                localStorage.removeItem('userId');
                window.location.href = 'login.html';
            }
        });
    });

    // Event listeners for user search and filter
    $(document).on('input', '#searchUserName', function () {
        renderUsersTable();
    });
    $(document).on('change', '#filterRole', function () {
        renderUsersTable();
    });
    $(document).on('click', '#refreshUsersBtn', function () {
        loadUsuarios();
    });

    // Event listeners for pagos search and refresh
    $(document).on('input', '#searchPago', function () {
        renderPagosTable();
    });
    $(document).on('click', '#refreshPagosBtn', function () {
        loadPagos();
    });

    // Event listeners for productos search and refresh
    $(document).on('input', '#searchProducto', function () {
        renderProductosTable();
    });
    $(document).on('click', '#refreshProductosBtn', function () {
        loadProductos();
    });

    // Render users table
    function renderUsersTable() {
        var searchTerm = $('#searchUserName').val().toLowerCase();
        var filteredData = usersData.filter(function (user) {
            var matchesSearch = user.fullname.toLowerCase().includes(searchTerm);
            return matchesSearch;
        });
        var table = '<table class="table table-striped"><thead><tr><th>ID</th><th>Nombre Completo</th><th>Usuario</th><th>Estado</th><th>Rol</th></tr></thead><tbody>';
        filteredData.forEach(function (user) {
            var stateText = user.state === 1 ? 'Activo' : 'Inactivo';
            var rolText = user.rol === 1 ? 'Admin' : 'Usuario';
            table += '<tr><td>' + user.id_user + '</td><td>' + user.fullname + '</td><td>' + user.username + '</td><td>' + stateText + '</td><td>' + rolText + '</td></tr>';
        });
        table += '</tbody></table>';
        $('#usuarios-table').html(table);
    }

    // Render pagos table
    function renderPagosTable() {
        var searchTerm = $('#searchPago').val().toLowerCase();
        var filteredData = pagosData.filter(function (pago) {
            return pago.reference.toLowerCase().includes(searchTerm);
        });
        var table = '<table class="table table-striped"><thead><tr><th>ID</th><th>Referencia</th><th>Monto</th><th>Fecha</th></tr></thead><tbody>';
        filteredData.forEach(function (pago) {
            table += '<tr><td>' + pago.id_pago + '</td><td>' + pago.reference + '</td><td>' + pago.amount + '</td><td>' + pago.date + '</td></tr>';
        });
        table += '</tbody></table>';
        $('#pagos-table').html(table);
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
                '<div class="card h-100 shadow-sm">' +
                '<div class="card-header bg-primary text-white">' +
                '<h5 class="card-title mb-0">' + (producto.brand || 'N/A') + ' - ' + (producto.code || 'N/A') + '</h5>' +
                '</div>' +
                '<div class="card-body">' +
                '<p class="card-text"><strong>Descripción:</strong> ' + (producto.description || 'N/A') + '</p>' +
                '<div class="row">' +
                '<div class="col-md-6">' +
                '<strong>Stock:</strong> ' + (producto.stock || 0) + '<br>' +
                '<strong>Costo:</strong> $' + (producto.cost || 0) + '<br>' +
                '<strong>PVP:</strong> $' + (producto.pvp || 0) +
                '</div>' +
                '<div class="col-md-6">' +
                '<strong>Mínimo:</strong> ' + (producto.min || 0) + '<br>' +
                '<strong>Aux:</strong> ' + (producto.aux || 0) + '<br>' +
                '<small class="text-muted">ID: ' + producto.id_product + '</small>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
        });
        cards += '</div>';
        $('#productos-table').html(cards);
    }

    // Save new user
    $('#saveUser').click(function () {
        var name = $('#newUserName').val();
        var email = $('#userEmail').val();
        var password = $('#userPassword').val();
        if (name && email && password) {
            $.ajax({
                url: 'https://fercoadvancededucation.com/php-ferco-files-ws/users',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    name: name,
                    email: email,
                    password: password
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
    window.openEditUserModal = function (id, name, email) {
        $('#editUserId').val(id);
        $('#editUserName').val(name);
        $('#editUserEmail').val(email);
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
                url: 'https://fercoadvancededucation.com/php-ferco-files-ws/users/' + id + '/password',
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
        var name = $('#editUserName').val();
        var email = $('#editUserEmail').val();
        if (name && email) {
            $.ajax({
                url: 'https://fercoadvancededucation.com/php-ferco-files-ws/users/' + id,
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({
                    name: name,
                    email: email
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

    // Send email form
    window.sendEmailForm = function (id) {
        Swal.fire({
            title: '¿Enviar email?',
            text: 'Se enviará un email con el enlace del formulario.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#007bff',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, enviar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: 'https://fercoadvancededucation.com/php-ferco-files-ws/forms/' + id + '/send-email',
                    method: 'POST',
                    success: function (response) {
                        Swal.fire({
                            icon: response.status === 1 ? 'success' : 'error',
                            title: response.status === 1 ? 'Enviado' : 'Error',
                            text: response.message
                        });
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
                    url: 'https://fercoadvancededucation.com/php-ferco-files-ws/users/' + id,
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
            url: 'https://nestorcornejo.com/macguiver-inventarios/products/bulk-import',
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
});

// Products module

class ProductManager {
    constructor() {
        this.productosData = [];
        this.importedProducts = [];
        this.currentProductForStock = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Button event handlers
        $(document).on('click', '#viewProductosListBtn', () => this.loadProductosList());
        $(document).on('click', '#backToStatsBtn', () => this.loadProductosStats());
        $(document).on('click', '#refreshProductosBtn', () => this.loadProductosList());

        // Search functionality
        $(document).on('keyup', '#searchProducto', () => this.renderProductosTable());
        $(document).on('click', '#searchProductsBtn', () => this.performProductSearch());
        $(document).on('keyup', '#productSearchInput', (e) => {
            if (e.key === 'Enter') this.performProductSearch();
        });

        // QR Scanner for search bar
        $(document).on('click', '#scanQRSearchBtn', () => $('#qrScannerSearchModal').modal('show'));

        $('#qrScannerSearchModal').on('shown.bs.modal', () => window.qrManager.startQRScannerForSearch());
        $('#qrScannerSearchModal').on('hidden.bs.modal', () => window.qrManager.stopQRScannerForSearch());

        // Import products
        $('#previewProducts').click(() => this.previewProducts());
        $('#clearPreview').click(() => this.clearPreview());
        $('#importProducts').click(() => this.importProducts());

        // Create product
        $('#saveProduct').click(() => this.saveProduct());

        // Edit product
        $('#updateProduct').click(() => this.updateProduct());

        // Add stock
        $('#searchProductBtn').click(() => this.searchProductForStock());
        $('#updateStockBtn').click(() => this.updateStock());
    }

    loadProductos() {
        const searchHtml = '<div class="row justify-content-center mt-4"><div class="col-md-8"><div class="card shadow-sm"><div class="card-body"><h6 class="card-title">Buscar Productos</h6><div class="input-group"><input type="text" id="productSearchInput" class="form-control" placeholder="Buscar por código, descripción o aux (ej: frenos posterior)"><button class="btn btn-primary" type="button" id="searchProductsBtn"><i class="fas fa-search"></i> Buscar</button><button class="btn btn-secondary" type="button" id="scanQRSearchBtn"><i class="fas fa-qrcode"></i> Escanear QR</button></div><div id="search-results" class="mt-4" style="display: none;"><div class="row g-3" id="products-results"></div></div></div></div></div></div>';
        $('#content-area').html('<div id="productos-content" class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Cargando...</span></div></div>' + searchHtml);
        this.loadProductosStats();
    }

    loadProductosStats() {
        $.ajax({
            url: getApiUrl(CONFIG.API_ENDPOINTS.PRODUCTS.STATS),
            method: 'GET',
            success: (response) => {
                if (response.status === 1) {
                    const stats = response.data;
                    const statsHtml = '<div class="row justify-content-center"><div class="col-12"><div class="stats-container"><div class="card"><div class="card-header"><h5 class="card-title mb-0">Información del Módulo de Productos</h5></div><div class="card-body"><div class="row"><div class="col-6"><h4 class="text-primary">' + (stats.total_products || 0) + '</h4><p class="mb-0">Total de Productos Registrados</p></div><div class="col-6"><h4 class="text-success">$' + (stats.total_value || 0) + '</h4><p class="mb-0">Valor Total del Inventario</p></div></div></div></div></div></div></div>';
                    const actionsHtml = '<div class="actions-header"><div class="section-title">Productos</div><div class="btn-group-custom"><button id="refreshProductosBtn" class="btn-custom btn-secondary-custom"><i class="fas fa-list"></i> Listar Todos</button><button type="button" class="btn-custom btn-success-custom" data-bs-toggle="modal" data-bs-target="#createProductModal"><i class="fas fa-plus"></i> Nuevo Producto</button><button type="button" class="btn-custom btn-success-custom" data-bs-toggle="modal" data-bs-target="#importProductsModal"><i class="fas fa-upload"></i> Importar Excel</button><button type="button" class="btn-custom btn-info-custom" data-bs-toggle="modal" data-bs-target="#addStockModal"><i class="fas fa-plus-circle"></i> Agregar Stock</button></div></div>';
                    $('#productos-content').html(statsHtml + actionsHtml);

                    // Load productos data for search
                    $.ajax({
                        url: getApiUrl(CONFIG.API_ENDPOINTS.PRODUCTS.LIST),
                        method: 'GET',
                        success: (response) => {
                            if (response.status === 1) {
                                this.productosData = response.data;
                            }
                        },
                        error: () => {
                            // Handle error silently
                        }
                    });
                } else {
                    $('#productos-content').html('<p>Error al cargar estadísticas: ' + response.message + '</p>');
                }
            },
            error: () => {
                $('#productos-content').html('<p>Error de conexión.</p>');
            }
        });
    }

    loadProductosList() {
        $('#productos-content').html('<div class="actions-header"><div class="section-title">Lista de Productos</div><div class="search-actions"><input type="text" id="searchProducto" class="form-control form-control-sm me-2" placeholder="Buscar por marca"><button id="backToStatsBtn" class="btn-custom btn-secondary-custom"><i class="fas fa-arrow-left"></i> Volver a Estadísticas</button></div></div><div id="productos-table" class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Cargando...</span></div></div>');
        $.ajax({
            url: getApiUrl(CONFIG.API_ENDPOINTS.PRODUCTS.LIST),
            method: 'GET',
            success: (response) => {
                if (response.status === 1) {
                    this.productosData = response.data;
                    this.renderProductosTable();
                } else {
                    $('#productos-table').html('<p>Error al cargar productos: ' + response.message + '</p>');
                }
            },
            error: () => {
                $('#productos-table').html('<p>Error de conexión.</p>');
            }
        });
    }

    renderProductosTable() {
        const searchTerm = $('#searchProducto').val().toLowerCase();
        const filteredData = this.productosData.filter(producto =>
            producto.brand && producto.brand.toLowerCase().includes(searchTerm)
        );
        let cards = '<div class="row g-3">';
        const userRole = window.authManager.getUserRole();
        filteredData.forEach(producto => {
            let productInfo = '<strong>Stock:</strong> ' + (producto.stock || 0) + ' | <strong>PVP:</strong> $' + (producto.pvp || 0) + ' | <strong>Aux:</strong> ' + (producto.aux || 0) + ' | <small class="text-muted">ID: ' + producto.id_product + '</small>';
            if (userRole == 1) {
                productInfo = '<strong>Stock:</strong> ' + (producto.stock || 0) + ' | <strong>Costo:</strong> $' + (producto.cost || 0) + ' | <strong>PVP:</strong> $' + (producto.pvp || 0) + ' | <strong>Mínimo:</strong> ' + (producto.min || 0) + ' | <strong>Aux:</strong> ' + (producto.aux || 0) + ' | <small class="text-muted">ID: ' + producto.id_product + '</small>';
            }
            const editButton = userRole == 1 ? '<button class="btn-custom btn-warning-custom mt-2" onclick="window.productManager.openEditProductModal(' + producto.id_product + ', \'' + (producto.brand || '') + '\', \'' + (producto.description || '') + '\', ' + (producto.stock || 0) + ', ' + (producto.cost || 0) + ', ' + (producto.pvp || 0) + ', ' + (producto.min || 0) + ', \'' + (producto.code || '') + '\')"><i class="fas fa-edit"></i> Editar</button>' : '';
            const qrButton = '<button class="btn-custom btn-info-custom mt-2" onclick="window.qrManager.generateQRCode(\'' + (producto.code || '') + '\', \'' + (producto.description || '') + '\')"><i class="fas fa-qrcode"></i> QR</button>';
            cards += '<div class="col-4"><div class="card shadow-sm"><div class="card-header bg-primary text-white"><h5 class="card-title mb-0">' + (producto.code || 'N/A') + ' | ' + (producto.description || 'N/A') + '</h5></div><div class="card-body"><p class="card-text mb-0">' + productInfo + '</p><div class="d-flex gap-1">' + editButton + qrButton + '</div></div></div></div>';
        });
        cards += '</div>';
        $('#productos-table').html(cards);
    }

    performProductSearch() {
        const searchTerm = $('#productSearchInput').val().trim().toLowerCase();
        if (!searchTerm) {
            $('#search-results').hide();
            return;
        }

        const filteredProducts = this.productosData.filter(product =>
            (product.code && product.code.toLowerCase().includes(searchTerm)) ||
            (product.description && product.description.toLowerCase().includes(searchTerm)) ||
            (product.aux && product.aux.toString().toLowerCase().includes(searchTerm))
        );

        this.renderSearchResults(filteredProducts);
        $('#search-results').show();
    }

    renderSearchResults(products) {
        let resultsHtml = '';
        if (products.length === 0) {
            resultsHtml = '<div class="col-12"><div class="alert alert-info">No se encontraron productos que coincidan con la búsqueda.</div></div>';
        } else {
            const userRole = window.authManager.getUserRole();
            products.forEach(product => {
                let productInfo = '<strong>Stock:</strong> ' + (product.stock || 0) + ' | <strong>PVP:</strong> $' + (product.pvp || 0) + ' | <strong>Aux:</strong> ' + (product.aux || 0) + ' | <small class="text-muted">ID: ' + product.id_product + '</small>';
                if (userRole == 1) {
                    productInfo = '<strong>Stock:</strong> ' + (product.stock || 0) + ' | <strong>Costo:</strong> $' + (product.cost || 0) + ' | <strong>PVP:</strong> $' + (product.pvp || 0) + ' | <strong>Mínimo:</strong> ' + (product.min || 0) + ' | <strong>Aux:</strong> ' + (product.aux || 0) + ' | <small class="text-muted">ID: ' + product.id_product + '</small>';
                }
                const editButton = userRole == 1 ? '<button class="btn btn-sm btn-warning mt-2" onclick="window.productManager.openEditProductModal(' + product.id_product + ', \'' + (product.brand || '') + '\', \'' + (product.description || '') + '\', ' + (product.stock || 0) + ', ' + (product.cost || 0) + ', ' + (product.pvp || 0) + ', ' + (product.min || 0) + ', \'' + (product.code || '') + '\')"><i class="fas fa-edit"></i> Editar</button>' : '';
                resultsHtml += '<div class="col-12"><div class="card shadow-sm"><div class="card-header bg-primary text-white"><h6 class="card-title mb-0">' + (product.code || 'N/A') + ' - ' + (product.description || 'N/A') + '</h6></div><div class="card-body"><p class="card-text mb-0">' + productInfo + '</p>' + editButton + '</div></div></div>';
            });
        }
        $('#products-results').html(resultsHtml);
    }

    previewProducts() {
        const fileInput = document.getElementById('excelFile');
        const file = fileInput.files[0];
        if (!file) {
            Swal.fire({
                icon: 'warning',
                title: 'Archivo requerido',
                text: 'Por favor, selecciona un archivo Excel.'
            });
            return;
        }

        $('#previewProducts').prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Procesando...');

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (jsonData.length < 2) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'El archivo Excel debe contener al menos una fila de datos.'
                });
                $('#previewProducts').prop('disabled', false).html('Vista Previa');
                return;
            }

            this.importedProducts = [];
            for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i];
                if (row.length >= 8) {
                    this.importedProducts.push({
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

            let rowsHtml = '';
            this.importedProducts.forEach((product, index) => {
                rowsHtml += '<tr id="product-row-' + index + '"><td>' + product.code + '</td><td>' + product.brand + '</td><td>' + product.description + '</td><td>' + product.stock + '</td><td>' + product.cost + '</td><td>' + product.pvp + '</td><td>' + product.min + '</td><td>' + product.aux + '</td></tr>';
            });
            $('#productsTableBody').html(rowsHtml);
            $('#productsPreview').show();
            $('#importProducts').show();
            $('#clearPreview').show();

            $('#previewProducts').prop('disabled', false).html('Vista Previa');
        };
        reader.readAsArrayBuffer(file);
    }

    clearPreview() {
        this.importedProducts = [];
        $('#productsTableBody').html('');
        $('#productsPreview').hide();
        $('#importProducts').hide();
        $('#clearPreview').hide();
        $('#excelFile').val('');
    }

    importProducts() {
        if (this.importedProducts.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Sin productos',
                text: 'No hay productos para importar.'
            });
            return;
        }

        $('#importProducts').prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Importando...');

        $.ajax({
            url: getApiUrl(CONFIG.API_ENDPOINTS.PRODUCTS.BULK_IMPORT),
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ products: this.importedProducts }),
            success: (response) => {
                $('#importProducts').prop('disabled', false).html('Importar Productos');

                if (response.status === 1) {
                    const data = response.data;
                    let message = 'Importación completada. ' + data.imported + ' productos importados.';
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
                    this.importedProducts = [];
                    this.loadProductos();
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: response.message
                    });
                }
            },
            error: () => {
                $('#importProducts').prop('disabled', false).html('Importar Productos');
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al importar productos.'
                });
            }
        });
    }

    saveProduct() {
        const brand = $('#productBrand').val().trim();
        const description = $('#productDescription').val().trim();
        const stock = $('#productStock').val().trim();
        const cost = $('#productCost').val().trim();
        const pvp = $('#productPvp').val().trim();
        const min = $('#productMin').val().trim();
        const code = $('#productCode').val().trim();

        if (brand && description && stock && cost && pvp && min && code) {
            const dataToSend = {
                brand: brand,
                description: description,
                stock: parseInt(stock),
                cost: parseFloat(cost),
                pvp: parseFloat(pvp),
                min: parseInt(min),
                code: code
            };

            $.ajax({
                url: getApiUrl(CONFIG.API_ENDPOINTS.PRODUCTS.CREATE),
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(dataToSend),
                success: (response) => {
                    Swal.fire({
                        icon: response.status === 1 ? 'success' : 'error',
                        title: response.status === 1 ? 'Éxito' : 'Error',
                        text: response.message
                    });

                    if (response.status === 1) {
                        $('#createProductModal').modal('hide');
                        $('#createProductForm')[0].reset();
                        this.loadProductos();
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

    openEditProductModal(id, brand, description, stock, cost, pvp, min, code) {
        $('#editProductId').val(id);
        $('#editProductBrand').val(brand);
        $('#editProductDescription').val(description);
        $('#editProductStock').val(stock);
        $('#editProductCost').val(cost);
        $('#editProductPvp').val(pvp);
        $('#editProductMin').val(min);
        $('#editProductCode').val(code);
        $('#editProductModal').modal('show');
    }

    updateProduct() {
        const id = $('#editProductId').val();
        const brand = $('#editProductBrand').val().trim();
        const description = $('#editProductDescription').val().trim();
        const stock = $('#editProductStock').val().trim();
        const cost = $('#editProductCost').val().trim();
        const pvp = $('#editProductPvp').val().trim();
        const min = $('#editProductMin').val().trim();
        const code = $('#editProductCode').val().trim();

        if (brand && description && stock && cost && pvp && min && code) {
            $.ajax({
                url: getApiUrl(CONFIG.API_ENDPOINTS.PRODUCTS.UPDATE) + '/' + id,
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
                success: (response) => {
                    Swal.fire({
                        icon: response.status === 1 ? 'success' : 'error',
                        title: response.status === 1 ? 'Éxito' : 'Error',
                        text: response.message
                    });
                    if (response.status === 1) {
                        $('#editProductModal').modal('hide');
                        $('#editProductForm')[0].reset();
                        this.loadProductos();
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

    searchProductForStock() {
        const searchCode = $('#searchCode').val().trim();
        if (!searchCode) {
            Swal.fire({
                icon: 'warning',
                title: 'Campo requerido',
                text: 'Por favor, ingrese un código o aux.'
            });
            return;
        }

        const foundProduct = this.productosData.find(product =>
            product.code === searchCode || product.aux == searchCode
        );

        if (foundProduct) {
            this.currentProductForStock = foundProduct;
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
    }

    updateStock() {
        const newStock = parseInt($('#newStock').val());
        if (isNaN(newStock) || newStock < 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Stock inválido',
                text: 'Por favor, ingrese un stock válido.'
            });
            return;
        }

        const updatedStock = (this.currentProductForStock.stock || 0) + newStock;

        $.ajax({
            url: getApiUrl(CONFIG.API_ENDPOINTS.PRODUCTS.UPDATE) + '/' + this.currentProductForStock.id_product,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({
                stock: updatedStock
            }),
            success: (response) => {
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
                    this.currentProductForStock = null;
                    this.loadProductos();
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
}

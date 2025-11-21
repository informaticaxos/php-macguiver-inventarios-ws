// Main application entry point

$(document).ready(function () {
    // Initialize authentication
    window.authManager = new AuthManager();

    // Check if logged in
    if (!window.authManager.checkLogin()) {
        return;
    }

    // Display user name
    window.authManager.displayUserName();

    // Initialize managers
    window.navigationManager = new NavigationManager();
    window.productManager = new ProductManager();
    window.userManager = new UserManager();
    window.qrManager = new QRManager();

    // Load default section (products)
    window.productManager.loadProductos();
});

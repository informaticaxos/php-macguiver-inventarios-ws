// Navigation module

class NavigationManager {
    constructor() {
        this.setupSidebarNavigation();
    }

    setupSidebarNavigation() {
        $('.sidebar .nav-link, .offcanvas .nav-link').click((e) => {
            e.preventDefault();
            $('.sidebar .nav-link, .offcanvas .nav-link').removeClass('active');
            $(e.target).addClass('active');
            const section = $(e.target).data('section');
            this.loadSection(section);
            // Close offcanvas on mobile
            $('#sidebar').offcanvas('hide');
        });
    }

    loadSection(section) {
        if (section === 'productos') {
            window.productManager.loadProductos();
        } else if (section === 'usuarios') {
            window.userManager.loadUsuarios();
        }
    }
}

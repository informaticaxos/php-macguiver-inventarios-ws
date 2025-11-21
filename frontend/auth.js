// Authentication module

class AuthManager {
    constructor() {
        this.userRole = localStorage.getItem('role') || 2;
    }

    checkLogin() {
        if (localStorage.getItem('loggedIn') !== 'true') {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    displayUserName() {
        const userName = localStorage.getItem('user') || 'Usuario';
        $('#userName').text(userName);
    }

    getUserRole() {
        return this.userRole;
    }

    logout() {
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
    }
}

// Setup logout button
$(document).ready(() => {
    $('#logoutBtn').click(() => window.authManager.logout());
});

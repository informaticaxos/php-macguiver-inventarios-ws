// QR Code module

class QRManager {
    constructor() {
        this.scanner = null;
        this.searchScanner = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // QR Scanner for add stock modal
        $('#scanQRBtn').click(() => $('#qrScannerModal').modal('show'));

        $('#qrScannerModal').on('shown.bs.modal', () => this.startQRScanner());
        $('#qrScannerModal').on('hidden.bs.modal', () => this.stopQRScanner());
    }

    startQRScanner() {
        if (this.scanner) {
            this.scanner.stop();
        }

        this.scanner = new Instascan.Scanner({ video: document.getElementById('qr-video') });

        this.scanner.addListener('scan', (content) => {
            $('#searchCode').val(content);
            $('#qrScannerModal').modal('hide');
            $('#searchProductBtn').click();
        });

        Instascan.Camera.getCameras().then((cameras) => {
            if (cameras.length > 0) {
                this.scanner.start(cameras[0]);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'No se encontró cámara',
                    text: 'No se pudo acceder a la cámara del dispositivo.'
                });
                $('#qrScannerModal').modal('hide');
            }
        }).catch((e) => {
            console.error(e);
            Swal.fire({
                icon: 'error',
                title: 'Error de cámara',
                text: 'Error al acceder a la cámara: ' + e.message
            });
            $('#qrScannerModal').modal('hide');
        });
    }

    stopQRScanner() {
        if (this.scanner) {
            this.scanner.stop();
            this.scanner = null;
        }
    }

    startQRScannerForSearch() {
        if (this.searchScanner) {
            this.searchScanner.stop();
        }

        this.searchScanner = new Instascan.Scanner({ video: document.getElementById('qr-search-video') });

        this.searchScanner.addListener('scan', (content) => {
            this.playBeep();
            const searchValue = content.length > 8 ? content.substring(0, 8) : content;
            $('#productSearchInput').val(searchValue);
            $('#qrScannerSearchModal').modal('hide');
            window.productManager.performProductSearch();
        });

        Instascan.Camera.getCameras().then((cameras) => {
            if (cameras.length > 0) {
                let selectedCamera = cameras[0];
                for (let camera of cameras) {
                    if (camera.name && (camera.name.toLowerCase().includes('back') || camera.name.toLowerCase().includes('rear'))) {
                        selectedCamera = camera;
                        break;
                    }
                }
                this.searchScanner.start(selectedCamera);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'No se encontró cámara',
                    text: 'No se pudo acceder a la cámara del dispositivo.'
                });
                $('#qrScannerSearchModal').modal('hide');
            }
        }).catch((e) => {
            console.error(e);
            Swal.fire({
                icon: 'error',
                title: 'Error de cámara',
                text: 'Error al acceder a la cámara: ' + e.message
            });
            $('#qrScannerSearchModal').modal('hide');
        });
    }

    stopQRScannerForSearch() {
        if (this.searchScanner) {
            this.searchScanner.stop();
            this.searchScanner = null;
        }
    }

    playBeep() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.type = 'square';
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }

    generateQRCode(code, description) {
        const qrContainer = document.getElementById('qr-code-container');
        const qrInfo = document.getElementById('qr-code-info');

        qrContainer.innerHTML = '';

        QRCode.toCanvas(code, { width: 256, height: 256 }, (error, canvas) => {
            if (error) {
                console.error(error);
                qrInfo.textContent = 'Error al generar el código QR.';
                return;
            }

            qrContainer.appendChild(canvas);
            qrInfo.textContent = 'Código: ' + code + ' - ' + description;

            $('#qrCodeModal').modal('show');

            $('#downloadQR').off('click').on('click', () => {
                const link = document.createElement('a');
                link.download = 'qr_' + code + '.png';
                link.href = canvas.toDataURL();
                link.click();
            });
        });
    }
}

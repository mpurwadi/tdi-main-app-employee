'use client';
import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Swal from 'sweetalert2';

const AdminQrCodePage = () => {
    const [qrCodeValue, setQrCodeValue] = useState('TDI_OFFICE_QR_CODE'); // Default QR code value
    const [officeName, setOfficeName] = useState('Main Office');

    const generateNewQrCode = () => {
        // In a real application, this might fetch a unique ID from the backend
        // For now, we'll keep it static or add a timestamp for uniqueness if needed.
        // const newQrValue = `TDI_OFFICE_${Date.now()}`;
        // setQrCodeValue(newQrValue);
        Swal.fire({
            icon: 'success',
            title: 'QR Code Generated',
            text: 'The QR code value is static for now. In a production environment, this would be dynamic.',
            padding: '2em',
            customClass: 'sweet-alerts',
        });
    };

    const handlePrint = () => {
        const printContent = document.getElementById('qr-code-print-area');
        if (printContent) {
            const originalContents = document.body.innerHTML;
            document.body.innerHTML = printContent.innerHTML;
            window.print();
            document.body.innerHTML = originalContents;
            window.location.reload(); // Reload to restore original page
        }
    };

    return (
        <div className="panel">
            <h5 className="mb-5 text-lg font-semibold">Generate Office QR Code for Absensi</h5>
            <p className="mb-4">This QR code will be used by employees for check-in. Ensure it is prominently displayed at the office entrance.</p>

            <div className="flex flex-col items-center justify-center p-6 border rounded-lg shadow-md bg-white dark:bg-gray-800">
                <div id="qr-code-print-area" className="p-4 bg-white rounded-lg">
                    <h6 className="text-center text-lg font-bold mb-4 text-black">{officeName} Absensi QR Code</h6>
                    <QRCodeSVG
                        value={qrCodeValue}
                        size={256}
                        level="H"
                        includeMargin={true}
                        // renderAs="svg" // renderAs is not a prop for QRCodeSVG
                    />
                    <p className="text-center text-sm mt-2 text-gray-600">Value: {qrCodeValue}</p>
                </div>

                <div className="mt-6 flex space-x-4">
                    <button type="button" className="btn btn-primary" onClick={generateNewQrCode}>
                        Generate New QR Code (Static)
                    </button>
                    <button type="button" className="btn btn-outline-primary" onClick={handlePrint}>
                        Print QR Code
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminQrCodePage;

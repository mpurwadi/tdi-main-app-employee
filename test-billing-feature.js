/**
 * Test script untuk fitur Internal Billing
 * 
 * Fitur internal billing dalam aplikasi ITSM mencakup:
 * 1. Membuat catatan billing
 * 2. Melacak status pembayaran (pending, paid, overdue, disputed)
 * 3. Merekam pembayaran
 * 4. Membuat laporan billing
 * 5. Integrasi dengan service catalog dan service requests
 */

const fetch = require('node-fetch');

// Konfigurasi
const BASE_URL = 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api/itsm/billing`;

// Mock data untuk testing
const mockBillingData = {
    requesterDivision: 'IT',
    providerDivision: 'DevOps',
    serviceCatalogId: 1,
    quantity: 1,
    billingPeriodStart: '2025-09-01',
    billingPeriodEnd: '2025-09-30',
    dueDate: '2025-10-15',
    description: 'Testing billing feature'
};

// Fungsi untuk membuat billing record
async function testCreateBillingRecord() {
    console.log('\n=== Testing Create Billing Record ===');
    
    try {
        // Simulasi pembuatan billing record
        const response = await fetch(`${API_BASE}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...mockBillingData,
                unitPrice: 500000,
                totalAmount: 500000
            })
        });

        const result = await response.json();
        
        if (result.success) {
            console.log('✓ Create billing record: SUCCESS');
            console.log('  Billing record ID:', result.data.id);
            console.log('  Invoice Number:', result.data.invoice_number);
            return result.data;
        } else {
            console.log('✗ Create billing record: FAILED');
            console.log('  Error:', result.error);
            return null;
        }
    } catch (error) {
        console.log('✗ Create billing record: ERROR');
        console.log('  Error:', error.message);
        return null;
    }
}

// Fungsi untuk mendapatkan daftar billing records
async function testGetBillingRecords() {
    console.log('\n=== Testing Get Billing Records ===');
    
    try {
        const response = await fetch(`${API_BASE}`);
        const result = await response.json();
        
        if (result.success) {
            console.log('✓ Get billing records: SUCCESS');
            console.log('  Total records:', result.data.length);
            if (result.data.length > 0) {
                console.log('  First record ID:', result.data[0].id);
            }
            return result.data;
        } else {
            console.log('✗ Get billing records: FAILED');
            console.log('  Error:', result.error);
            return [];
        }
    } catch (error) {
        console.log('✗ Get billing records: ERROR');
        console.log('  Error:', error.message);
        return [];
    }
}

// Fungsi untuk merekam pembayaran
async function testRecordPayment(billingRecordId) {
    console.log('\n=== Testing Record Payment ===');
    
    if (!billingRecordId) {
        console.log('✗ Record payment: SKIPPED (no billing record ID)');
        return null;
    }
    
    try {
        const response = await fetch(`${API_BASE}/payments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                billingRecordId: billingRecordId,
                amount: 500000,
                paymentMethod: 'transfer',
                referenceNumber: 'TEST-REF-001',
                remarks: 'Test payment for billing feature validation'
            })
        });

        const result = await response.json();
        
        if (result.success) {
            console.log('✓ Record payment: SUCCESS');
            console.log('  Payment ID:', result.data.id);
            return result.data;
        } else {
            console.log('✗ Record payment: FAILED');
            console.log('  Error:', result.error);
            return null;
        }
    } catch (error) {
        console.log('✗ Record payment: ERROR');
        console.log('  Error:', error.message);
        return null;
    }
}

// Fungsi untuk mengkonfirmasi pembayaran
async function testConfirmPayment(billingRecordId) {
    console.log('\n=== Testing Confirm Payment ===');
    
    if (!billingRecordId) {
        console.log('✗ Confirm payment: SKIPPED (no billing record ID)');
        return null;
    }
    
    try {
        const response = await fetch(`${API_BASE}/${billingRecordId}/confirm-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const result = await response.json();
        
        if (result.success) {
            console.log('✓ Confirm payment: SUCCESS');
            console.log('  Confirmed billing record ID:', result.data.id);
            console.log('  Status:', result.data.status);
            return result.data;
        } else {
            console.log('✗ Confirm payment: FAILED');
            console.log('  Error:', result.error);
            return null;
        }
    } catch (error) {
        console.log('✗ Confirm payment: ERROR');
        console.log('  Error:', error.message);
        return null;
    }
}

// Fungsi untuk mendapatkan laporan pembayaran
async function testGetPaymentRecords() {
    console.log('\n=== Testing Get Payment Records ===');
    
    try {
        const response = await fetch(`${API_BASE}/payments`);
        const result = await response.json();
        
        if (result.success) {
            console.log('✓ Get payment records: SUCCESS');
            console.log('  Total payment records:', result.data.length);
            return result.data;
        } else {
            console.log('✗ Get payment records: FAILED');
            console.log('  Error:', result.error);
            return [];
        }
    } catch (error) {
        console.log('✗ Get payment records: ERROR');
        console.log('  Error:', error.message);
        return [];
    }
}

// Fungsi utama untuk menjalankan semua test
async function runBillingFeatureTests() {
    console.log('🧪 Starting Internal Billing Feature Tests...');
    console.log('===============================================');
    
    // Jalankan tes satu per satu
    const createdBillingRecord = await testCreateBillingRecord();
    
    if (createdBillingRecord) {
        // Tunggu sebentar agar data diperbarui
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Dapatkan daftar billing records
        const billingRecords = await testGetBillingRecords();
        
        // Rekam pembayaran
        const recordedPayment = await testRecordPayment(createdBillingRecord.id);
        
        // Tunggu sebentar
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Konfirmasi pembayaran
        const confirmedPayment = await testConfirmPayment(createdBillingRecord.id);
        
        // Dapatkan daftar payment records
        const paymentRecords = await testGetPaymentRecords();
    } else {
        // Jika pembuatan billing record gagal, tetap coba tes yang hanya membaca data
        await testGetBillingRecords();
        await testGetPaymentRecords();
    }
    
    console.log('\n===============================================');
    console.log('🏁 Billing Feature Tests Completed');
}

// Jalankan tes jika file ini dijalankan langsung
if (require.main === module) {
    runBillingFeatureTests();
}

module.exports = {
    testCreateBillingRecord,
    testGetBillingRecords,
    testRecordPayment,
    testConfirmPayment,
    testGetPaymentRecords,
    runBillingFeatureTests
};
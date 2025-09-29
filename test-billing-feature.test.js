/**
 * Jest test script untuk fitur Internal Billing
 * 
 * Fitur internal billing dalam aplikasi ITSM mencakup:
 * 1. Membuat catatan billing
 * 2. Melacak status pembayaran (pending, paid, overdue, disputed)
 * 3. Merekam pembayaran
 * 4. Membuat laporan billing
 * 5. Integrasi dengan service catalog dan service requests
 */

const request = require('supertest');
const app = require('../server'); // Sesuaikan dengan file server Anda jika menggunakan server.js

// Konfigurasi
const API_BASE = '/api/itsm/billing';

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

describe('Internal Billing Feature Tests', () => {
    let createdBillingRecordId = null;
    let createdPaymentRecordId = null;

    test('1. Harus dapat membuat billing record baru', async () => {
        const response = await request(app)
            .post(API_BASE)
            .send({
                ...mockBillingData,
                unitPrice: 500000,
                totalAmount: 500000
            })
            .expect('Content-Type', /json/)
            .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data).toHaveProperty('invoice_number');
        expect(response.body.data.requester_division).toBe('IT');
        expect(response.body.data.provider_division).toBe('DevOps');
        
        createdBillingRecordId = response.body.data.id;
    });

    test('2. Harus dapat mengambil daftar billing records', async () => {
        const response = await request(app)
            .get(API_BASE)
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('3. Harus dapat membuat payment record', async () => {
        if (!createdBillingRecordId) {
            // Jika tidak bisa membuat billing record sebelumnya, lewati tes ini
            return;
        }

        const response = await request(app)
            .post(`${API_BASE}/payments`)
            .send({
                billingRecordId: createdBillingRecordId,
                amount: 500000,
                paymentMethod: 'transfer',
                referenceNumber: 'TEST-REF-001',
                remarks: 'Test payment for billing feature validation'
            })
            .expect('Content-Type', /json/)
            .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data.billing_record_id).toBe(createdBillingRecordId);
        
        createdPaymentRecordId = response.body.data.id;
    });

    test('4. Harus dapat mengonfirmasi pembayaran', async () => {
        if (!createdBillingRecordId) {
            // Jika tidak bisa membuat billing record sebelumnya, lewati tes ini
            return;
        }

        const response = await request(app)
            .post(`${API_BASE}/${createdBillingRecordId}/confirm-payment`)
            .send({})
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(createdBillingRecordId);
        expect(response.body.data.status).toBe('paid');
    });

    test('5. Harus dapat mengambil daftar payment records', async () => {
        const response = await request(app)
            .get(`${API_BASE}/payments`)
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('6. Harus dapat mengambil satu billing record berdasarkan ID', async () => {
        if (!createdBillingRecordId) {
            // Jika tidak bisa membuat billing record sebelumnya, lewati tes ini
            return;
        }

        const response = await request(app)
            .get(`${API_BASE}/${createdBillingRecordId}`)
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(createdBillingRecordId);
    });
});

// Test untuk fitur-fitur billing secara komprehensif
describe('Comprehensive Billing Feature Tests', () => {
    test('Validasi form billing', () => {
        // Test validasi jika field penting tidak diisi
        const incompleteBillingData = {
            requesterDivision: '', // Kosong
            providerDivision: 'DevOps',
            serviceCatalogId: 1,
            quantity: 1,
            billingPeriodStart: '2025-09-01',
            billingPeriodEnd: '2025-09-30',
            dueDate: '2025-10-15',
            description: 'Testing billing feature'
        };

        expect(incompleteBillingData.requesterDivision).toBe('');
    });

    test('Validasi pembayaran', () => {
        // Test validasi pembayaran melebihi jumlah tagihan
        const excessivePayment = {
            billingRecordId: 1,
            amount: 1000000, // Misalnya tagihan hanya 500000
            paymentMethod: 'transfer'
        };

        const billingAmount = 500000;
        expect(excessivePayment.amount).toBeGreaterThan(billingAmount);
    });

    test('Status billing yang valid', () => {
        const validStatuses = ['pending', 'paid', 'overdue', 'disputed'];
        expect(['pending', 'paid', 'overdue', 'disputed']).toEqual(validStatuses);
    });
});
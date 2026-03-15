# LoveMedix End-to-End Testing Guide

This guide provides step-by-step instructions to test the complete flow of the platform from distributor registration to customer order fulfillment.

## Complete User Flow

### 1. Distributor Registration & Admin Approval

#### Step 1: Distributor Signs Up
- Go to the registration page
- Fill in the following details:
  - **Email**: distributor@test.com
  - **Password**: TestPass123
  - **Full Name**: John Distributor
  - **Company Name**: Quality Medicines Distributor
  - **Phone**: +91-9876543210
  - **Business License Number**: DL2024001
  - **GST Number**: 27AABCT1234H1Z0
  - **Street Address**: 123 Medical Park
  - **City**: Delhi
  - **State**: Delhi
  - **Postal Code**: 110001
  - **Service Areas**: Delhi, Haryana, Punjab
- Click "Register"
- Distributor account is created with `verification_status = 'pending'`

#### Step 2: Admin Reviews & Approves
- Admin logs in to `/admin/distributors`
- See the pending distributor in the table
- Click "Approve" button
- Optionally add verification notes
- Confirm the approval
- Distributor status changes to `verified`

**Expected Result**: Distributor receives verification confirmation and can now access dashboard

---

### 2. Distributor Uploads Medicine Stock

#### Step 1: Distributor Logs In
- Login with distributor@test.com / TestPass123
- Navigate to `/distributor/dashboard`
- Click "Manage Inventory" → "View Inventory"

#### Step 2: Add Medicines to Inventory
- Click "Add Medicine to Inventory" form
- Select a medicine from dropdown (e.g., Aspirin 500mg)
- Fill in details:
  - **Batch Number**: BATCH20240101
  - **Mfg. Date**: 2023-01-15
  - **Expiry Date**: 2025-01-15
  - **MRP**: ₹50.00
  - **Quantity**: 1000
  - **Unit Price**: ₹35.00
  - **HSN Code**: 3004
- Click "Add to Inventory"

**Expected Result**: Medicine appears in inventory table with status "Active"

#### Step 3: Add Multiple Medicines
Repeat Step 2 for multiple medicines to create a comprehensive catalog:
- Paracetamol 500mg - 500 units
- Ibuprofen 400mg - 300 units
- Amoxicillin 500mg - 200 units

**Expected Result**: All medicines listed in distributor inventory

---

### 3. Pharmacy Discovers & Adds Medicines

#### Step 1: Pharmacy Signs Up & Gets Verified
- Register as pharmacy with details:
  - **Email**: pharmacy@test.com
  - **Company Name**: CarePharmacy
  - **City**: Delhi
  - **State**: Delhi
- Admin approves pharmacy registration

#### Step 2: Pharmacy Finds Suppliers
- Login to pharmacy account
- Go to `/pharmacy/dashboard`
- Click "Find Suppliers" button
- See list of verified distributors and their medicines

#### Step 3: Browse Distributor Medicines
- Browse through supplier list showing:
  - Distributor name and location
  - Available medicines with prices
  - Stock quantity
  - Expiry dates
- Can search medicines by name

#### Step 4: Add Medicines from Distributor
- Click "Add" button on desired medicine
- Medicine is added to pharmacy inventory
- Pharmacy inventory now shows medicine with distributor tracking

**Expected Result**: Medicine appears in pharmacy's inventory list with distributor information

---

### 4. Customer Orders Medicine from Pharmacy

#### Step 1: Customer Browsing
- Customer logs in or browses platform
- Searches for medicine (e.g., "Aspirin")
- Sees "Aspirin 500mg" available at "CarePharmacy"

#### Step 2: Customer Places Order
- Adds medicine to cart
- Proceeds to checkout
- Completes payment
- Order is created in system

**Expected Result**: Order appears in pharmacy's dashboard with "pending" status

---

### 5. Pharmacy Processes Order

#### Step 1: View Orders
- Pharmacy logs in to `/pharmacy/dashboard`
- Sees "Recent Orders" showing new order

#### Step 2: Confirm & Process Order
- Order status: pending → confirmed → preparing → ready for delivery

**Expected Result**: Medicine is fulfilled to customer with full traceability

---

## Database Flow Verification

### Check Point 1: Distributor Registration
```sql
SELECT id, company_name, verification_status, created_at 
FROM distributor_profiles 
WHERE company_name = 'Quality Medicines Distributor';
```
**Expected**: One row with verification_status = 'verified'

### Check Point 2: Distributor Inventory
```sql
SELECT m.name, dm.quantity, dm.unit_price, dm.expiry_date
FROM distributor_medicines dm
JOIN medicines m ON dm.medicine_id = m.id
WHERE dm.distributor_id = 1;
```
**Expected**: Multiple medicines with quantities and expiry dates

### Check Point 3: Pharmacy Inventory with Distributor Tracking
```sql
SELECT pi.id, m.name, pi.distributor_id, dp.company_name
FROM pharmacy_inventory pi
JOIN medicines m ON pi.medicine_id = m.id
LEFT JOIN distributor_profiles dp ON pi.distributor_id = dp.id
WHERE pi.pharmacy_id = 1;
```
**Expected**: Medicines listed with distributor_id pointing to source distributor

### Check Point 4: Order Traceability
```sql
SELECT o.order_number, oi.medicine_id, m.name, pi.distributor_id, dp.company_name
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN medicines m ON oi.medicine_id = m.id
LEFT JOIN pharmacy_inventory pi ON pi.medicine_id = m.medicine_id
LEFT JOIN distributor_profiles dp ON pi.distributor_id = dp.id
WHERE o.id = 1;
```
**Expected**: Complete chain from order → pharmacy → distributor → medicine

---

## API Endpoints to Test

### Distributor APIs
- `GET /api/admin/distributors/pending` - List pending distributors
- `POST /api/admin/distributors/approve` - Approve/reject distributor
- `GET /api/distributor/inventory` - Get distributor's medicines
- `POST /api/distributor/inventory` - Add medicine to inventory

### Pharmacy APIs
- `GET /api/pharmacy/suppliers` - Find available distributors
- `GET /api/pharmacy/inventory` - Get pharmacy's medicines
- `POST /api/pharmacy/inventory` - Add medicine from distributor

### Customer APIs
- `GET /api/medicines` - Search medicines
- `POST /api/orders` - Create order

---

## Common Issues & Fixes

### Issue: "License Number Already Registered"
**Fix**: Changed from `license_number` to `business_license_number` in database queries

### Issue: "Distributor Profile Not Found"
**Fix**: Ensure distributor is verified before uploading medicines

### Issue: Medicine Not Appearing for Pharmacy
**Fix**: Verify distributor is marked as `verified` and has non-zero quantity with future expiry date

### Issue: Cannot Add Medicine to Pharmacy
**Fix**: Ensure pharmacy is also verified before accessing supplier discovery

---

## Success Criteria

- ✅ Distributor can register and be approved by admin
- ✅ Distributor can upload medicines with full details (batch, expiry, pricing)
- ✅ Pharmacy can discover verified distributors
- ✅ Pharmacy can view distributor's medicines and pricing
- ✅ Pharmacy can add medicines to inventory with distributor tracking
- ✅ Customer can order medicines from pharmacy
- ✅ Complete traceability from customer order back to original distributor
- ✅ All verification statuses working correctly (pending → verified → active)

---

## Test Accounts

### Admin Account
- Email: admin@test.com
- Password: AdminPass123

### Distributor Account
- Email: distributor@test.com
- Password: TestPass123

### Pharmacy Account
- Email: pharmacy@test.com
- Password: PharmacyPass123

### Customer Account
- Email: customer@test.com
- Password: CustomerPass123

---

## Notes

- All dates are in YYYY-MM-DD format
- All prices are in Indian Rupees (₹)
- Expiry dates must be in the future
- Batch numbers are optional but recommended
- Service areas for distributor allow filtering by region

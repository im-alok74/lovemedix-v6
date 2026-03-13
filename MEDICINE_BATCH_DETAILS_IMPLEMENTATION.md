# Medicine Batch Details in Invoices - Implementation Guide

## Overview
This implementation adds comprehensive medicine batch information to the invoices displayed to customers, pharmacies, and admins. All details are sourced from the pharmacy inventory management system.

## End-to-End Flow

### 1. Pharmacy Stock Upload (Add Medicine Page)
**File:** `/app/pharmacy/medicines/add/page.tsx`

**New Fields Added:**
- Manufacturing Date (mfg_date) - Date field
- MRP - Maximum Retail Price in rupees
- Existing fields: Batch Number, Expiry Date

**Form Fields:**
\`\`\`
- Select Medicine (from master list)
- Stock Quantity
- Selling Price (₹)
- Discount (%)
- Batch Number
- Manufacturing Date
- Expiry Date
- MRP (Maximum Retail Price)
\`\`\`

**Data Stored:** All fields are inserted into `pharmacy_inventory` table

### 2. Order Placement & Batch Capture
**File:** `/app/api/orders/create/route.ts`

**Process:**
1. Customer places an order with medicines from one or multiple pharmacies
2. For each medicine in the order, the system:
   - Fetches batch details from `pharmacy_inventory` (batch_number, mfg_date, expiry_date, mrp)
   - Stores these details in `order_items` table
3. All batch information is persisted with the order

**Fields Captured in order_items:**
- batch_number
- mfg_date (manufacturing date)
- expiry_date
- mrp (maximum retail price)

### 3. Invoice Generation & Display

#### Customer Invoice
**File:** `/app/api/orders/[orderId]/invoice/route.ts`

**Invoice Table Columns:**
| Medicine Name & Details | HSN | Batch No | MFG Date | EXP Date | MRP | Qty | Unit Price | Amount |
|---|---|---|---|---|---|---|---|---|

**Data Source:**
- Medicine details from `medicines` table
- Batch information from `order_items` table (captured at order time)
- Dates formatted in Indian format (DD/MM/YYYY)

#### Pharmacy Invoice (for their records)
**File:** `/app/pharmacy/orders/page.tsx`
- Uses same invoice template as customer

#### Admin Invoice
**File:** `/app/api/admin/orders/[orderId]/invoice/route.ts`

**Same detailed format with:**
- All medicine details
- Batch information
- Manufacturing and expiry dates
- MRP for each medicine
- Complete order summary with GST and delivery charges

## Data Flow Diagram

\`\`\`
PHARMACY PANEL
     ↓
Add Medicine + Batch Details
(batch_number, mfg_date, expiry_date, mrp)
     ↓
pharmacy_inventory table
     ↓
CUSTOMER PLACES ORDER
     ↓
Fetch batch details for each medicine
     ↓
Store in order_items table
     ↓
INVOICE GENERATION
     ↓
Display batch details in invoice
(for customer, pharmacy, and admin)
\`\`\`

## Database Fields

### pharmacy_inventory table
\`\`\`sql
- batch_number (VARCHAR)
- mfg_date (DATE) - NEW
- expiry_date (DATE)
- mrp (DECIMAL) - NEW
\`\`\`

### order_items table
\`\`\`sql
- batch_number (VARCHAR) - Captured from pharmacy_inventory
- mfg_date (DATE) - Captured from pharmacy_inventory
- expiry_date (DATE) - Captured from pharmacy_inventory
- mrp (DECIMAL) - Captured from pharmacy_inventory
\`\`\`

## Invoice Information Display

### Customer Information (from order)
- Order Number
- Order Date
- Order Status
- Customer Name, Phone, Address
- Pharmacy Name, GST Number, License Number

### Medicine Details (from order_items + medicines)
- Medicine Name
- Generic Name
- HSN Code
- **Batch Number** ← NEW
- **Manufacturing Date** ← NEW
- **Expiry Date** ← NEW
- **MRP** ← NEW
- Quantity
- Unit Price
- Total Amount

### Financial Summary
- Subtotal (Before GST)
- GST (5%)
- Delivery Charge
- Total Amount

## User Experience

### Pharmacy Staff
1. Upload medicines with complete batch details
2. Can view invoices with all medicine batch information for their orders
3. Track batch-wise inventory through orders

### Customers
1. View detailed invoice with:
   - Medicine batch numbers
   - Manufacturing dates (confidence in freshness)
   - Expiry dates (know validity period)
   - MRP for reference

### Admin
1. Full visibility of all orders with batch details
2. Can download/print invoices for any order
3. Track batch information across all pharmacies

## Features
✅ End-to-end batch detail capture
✅ Automatic batch information at order time
✅ Professional invoice formatting
✅ Date formatting in Indian locale
✅ Works for multiple pharmacy orders in single checkout
✅ Fallback to 'N/A' for missing data
✅ Responsive invoice design
✅ Print-friendly invoice format

## Testing Checklist
- [ ] Add medicine with all batch details from pharmacy panel
- [ ] Place order from customer panel
- [ ] View invoice - verify all batch details appear
- [ ] Check pharmacy can view order invoices
- [ ] Check admin can view order invoices
- [ ] Print invoice - verify formatting
- [ ] Test with multiple medicines from different batches
- [ ] Test with missing batch details - should show 'N/A'

# LoveMedix System Architecture

## Complete Platform Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         LOVEMEDIEX PLATFORM                             │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    DISTRIBUTOR FLOW                              │  │
│  │                                                                  │  │
│  │  1. Registers                    2. Gets Approved              │  │
│  │     ↓                               ↓                           │  │
│  │  [Distributor Signup] ─────→ [Admin Approval] ─→ [Verified]  │  │
│  │     (Email, Company)              (/admin/distributors)         │  │
│  │     License, GST, Address                                      │  │
│  │                                                                  │  │
│  │  3. Uploads Medicines                                          │  │
│  │     ↓                                                            │  │
│  │  [Distributor Inventory]                                        │  │
│  │  (/distributor/inventory)                                       │  │
│  │     • Add medicines with batch details                          │  │
│  │     • Set pricing (MRP, cost)                                   │  │
│  │     • Track quantity & expiry                                   │  │
│  │     • Stored in distributor_medicines table                     │  │
│  │                                                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                      │                                    │
│                                      │ Medicines Available               │
│                                      │                                    │
│  ┌──────────────────────────────────┴────────────────────────────────┐  │
│  │                        PHARMACY FLOW                               │  │
│  │                                                                   │  │
│  │  1. Discovers Suppliers          2. Adds to Inventory           │  │
│  │     ↓                               ↓                            │  │
│  │  [Find Suppliers Page]   ──────→  [Add Medicine]                │  │
│  │  (/pharmacy/suppliers)           (/api/pharmacy/inventory)      │  │
│  │     • Search medicines                                          │  │
│  │     • See distributor location  • Tracks distributor_id       │  │
│  │     • View pricing              • Maintains supply chain       │  │
│  │     • Check availability         • Updates quantities          │  │
│  │                                                                  │  │
│  │  Pharmacy now has medicine with:                                │  │
│  │     ✓ Medicine details                                          │  │
│  │     ✓ Sourced from specific distributor                         │  │
│  │     ✓ Available for customer orders                             │  │
│  │                                                                  │  │
│  └──────────────────────────────────┬─────────────────────────────────┘  │
│                                      │                                    │
│                                      │ Medicines for Sale               │
│                                      │                                    │
│  ┌──────────────────────────────────┴─────────────────────────────────┐  │
│  │                       CUSTOMER FLOW                                 │  │
│  │                                                                   │  │
│  │  1. Searches for Medicine        2. Places Order                 │  │
│  │     ↓                               ↓                             │  │
│  │  [Medicine Listing]    ──────→  [Order Creation]                 │  │
│  │  • Sees "Aspirin at CarePharmacy"                               │  │
│  │  • From distributor "Quality Medicines"                         │  │
│  │  • Adds to cart                  • Payment processed             │  │
│  │  • Proceeds to checkout          • Order created in system       │  │
│  │                                  • Traceable back to distributor  │  │
│  │                                                                  │  │
│  │  3. Receives Medicine                                           │  │
│  │     ↓                                                            │  │
│  │  [Full Traceability Achieved]                                   │  │
│  │  Customer ← Pharmacy ← Distributor ← Medicine Batch             │  │
│  │                                                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Database Schema Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      USERS TABLE                            │
│                                                             │
│  id | email | password | user_type | status | created_at  │
│  (user_type: admin, distributor, pharmacy, customer)      │
└────────────────┬──────────────────────┬─────────────────┬──┘
                 │                      │                 │
      ┌──────────┘                      │                 │
      │                                 │                 │
      ▼                                 ▼                 ▼
┌──────────────────────┐    ┌──────────────────────┐    ┌────────────────────┐
│ distributor_profiles │    │  pharmacy_profiles   │    │  customer_profiles │
│                      │    │                      │    │                    │
│ id                   │    │ id                   │    │ id                 │
│ user_id (FK)         │    │ user_id (FK)         │    │ user_id (FK)       │
│ company_name         │    │ pharmacy_name        │    │ phone_number       │
│ business_license_    │    │ license_number       │    │ address            │
│   number             │    │ registration_number  │    │ city               │
│ tax_id               │    │ city                 │    │ state              │
│ address_line1        │    │ state                │    │ postal_code        │
│ city                 │    │ verification_status  │    │                    │
│ state_province       │    │ commission_rate      │    │                    │
│ postal_code          │    │ created_at           │    │                    │
│ country              │    │                      │    │                    │
│ verification_status  │    │                      │    │                    │
│ verification_date    │    │                      │    │                    │
│ created_at           │    │                      │    │                    │
└──────────┬───────────┘    └──────────┬───────────┘    └────────────────────┘
           │                           │
           │                           │ has
           │ has                       │
           │                           ▼
           │              ┌──────────────────────────────┐
           │              │   pharmacy_inventory         │
           │              │                              │
           │              │ id                           │
           │              │ pharmacy_id (FK)             │
           │              │ medicine_id (FK)             │
           │              │ quantity                     │
           │              │ unit_price                   │
           │              │ distributor_id (FK) ◄────┐  │
           │              │ created_at                 │  │
           │              └──────────┬───────────────┘  │
           │                         │                  │
           │                         │ references       │
           │                         │                  │
           │                         ▼                  │
           ▼                   ┌──────────────────────┐ │
      ┌──────────────────┐    │  medicines           │ │
      │ distributor_     │────┤                      │ │
      │   medicines      │    │ id                   │ │
      │                  │    │ name                 │ │
      │ id               │    │ generic_name         │ │
      │ distributor_id   │    │ manufacturer         │ │
      │   (FK) ◄─────────┼────┤ form                 │ │
      │ medicine_id (FK) │    │ strength             │ │
      │ batch_number     │    │ pack_size            │ │
      │ mfg_date         │    │                      │ │
      │ expiry_date      │    │                      │ │
      │ mrp              │    │                      │ │
      │ unit_price       │    │                      │ │
      │ quantity         │    │                      │ │
      │ hsn_code         │    │                      │ │
      │ created_at       │    │                      │ │
      └──────────────────┘    └──────┬───────────────┘ │
                                     │                  │
                                     │                  │
                   ┌─────────────────┴──────────────────┘
                   │
                   ▼
            ┌──────────────────┐
            │ orders           │
            │                  │
            │ id               │
            │ pharmacy_id (FK) │
            │ customer_id (FK) │
            │ order_status     │
            │ total_amount     │
            │ created_at       │
            └────────┬─────────┘
                     │
                     │ has many
                     │
                     ▼
            ┌──────────────────┐
            │ order_items      │
            │                  │
            │ id               │
            │ order_id (FK)    │
            │ medicine_id (FK) │
            │ quantity         │
            │ unit_price       │
            │ total_price      │
            └──────────────────┘
```

## API Request Flow

```
┌─────────────────────────────────────────────────────────────┐
│              CLIENT REQUESTS                                │
│                                                             │
│  [Distributor]      [Admin]        [Pharmacy]              │
│      │                │                 │                   │
│      ▼                ▼                 ▼                   │
└──────┬────────────────┬────────────────┬──────────────────┘
       │                │                │
       │ POST           │ GET/POST       │ GET/POST
       │ register       │ /admin/        │ /pharmacy/
       │                │ distributors   │ suppliers
       │                │                │
       ▼                ▼                ▼
   ┌──────────┐    ┌──────────┐    ┌──────────┐
   │ DATABASE │    │ DATABASE │    │ DATABASE │
   │ CREATE   │    │ UPDATE   │    │ READ     │
   │ USER &   │    │ VERIFY   │    │ FILTER   │
   │ PROFILE  │    │ STATUS   │    │ MEDICINES│
   └────┬─────┘    └────┬─────┘    └────┬─────┘
        │                │               │
        ▼                ▼               ▼
   ┌──────────┐    ┌──────────┐    ┌──────────┐
   │ RESPONSE │    │ RESPONSE │    │ RESPONSE │
   │ User ID  │    │ Approval │    │ Supplier │
   │ Status:  │    │ Status   │    │ List with│
   │ pending  │    │ Status:  │    │ Medicines│
   │          │    │ verified │    │          │
   └──────────┘    └──────────┘    └──────────┘
```

## Data Flow: From Distributor to Customer

```
Step 1: DATA ENTRY
┌──────────────────────────────────────────────────────────┐
│ Distributor uploads:                                     │
│ • Medicine: Aspirin 500mg                                │
│ • Batch: B001                                            │
│ • Qty: 1000 units                                        │
│ • Cost: ₹35/unit, MRP: ₹50/unit                         │
│ • Expiry: 2025-01-15                                     │
└──────────────────┬───────────────────────────────────────┘
                   │
                   ▼
        INSERT distributor_medicines
        distributor_id=1, medicine_id=5,
        batch='B001', expiry='2025-01-15',
        quantity=1000, unit_price=35

Step 2: PHARMACY DISCOVERY
┌──────────────────────────────────────────────────────────┐
│ Pharmacy searches for "Aspirin"                          │
│ API returns distributor's medicines:                     │
│ • Company: Quality Medicines (distributor_id=1)          │
│ • Location: Delhi                                        │
│ • Price: ₹35/unit                                        │
│ • Available: 1000 units                                  │
│ • Expires: 2025-01-15                                    │
└──────────────────┬───────────────────────────────────────┘
                   │
                   ▼
        SELECT distributor_medicines, medicines,
               distributor_profiles
        WHERE status='verified' AND
              quantity > 0 AND expiry > NOW()

Step 3: PHARMACY ADDS TO INVENTORY
┌──────────────────────────────────────────────────────────┐
│ Pharmacy clicks "Add"                                     │
│ Medicine added to pharmacy inventory with:               │
│ • pharmacy_id = 2 (CarePharmacy)                         │
│ • medicine_id = 5 (Aspirin)                              │
│ • distributor_id = 1 (Quality Medicines)                 │
│ • quantity = 10 (pharmacy stock)                         │
│ • unit_price = 35 (cost from distributor)                │
└──────────────────┬───────────────────────────────────────┘
                   │
                   ▼
        INSERT pharmacy_inventory
        pharmacy_id=2, medicine_id=5,
        distributor_id=1, quantity=10

Step 4: CUSTOMER ORDERS
┌──────────────────────────────────────────────────────────┐
│ Customer searches for "Aspirin"                          │
│ Sees: "Aspirin 500mg - ₹50 at CarePharmacy"             │
│ Places order for 2 units                                 │
│ Order created in orders table                            │
│ Order items created in order_items table                 │
└──────────────────┬───────────────────────────────────────┘
                   │
                   ▼
        INSERT orders (pharmacy_id=2, customer_id=3)
        INSERT order_items (medicine_id=5, qty=2)
        UPDATE pharmacy_inventory SET qty = qty-2

Step 5: FULL TRACEABILITY
┌──────────────────────────────────────────────────────────┐
│ Query order with complete chain:                         │
│                                                          │
│ Order #ORD123 by Customer (John)                        │
│   ├─ Medicine: Aspirin 500mg                            │
│   ├─ Pharmacy: CarePharmacy                             │
│   ├─ Source Distributor: Quality Medicines              │
│   ├─ Batch: B001                                        │
│   ├─ Expiry: 2025-01-15                                 │
│   └─ Unit Price: ₹50 (customer), ₹35 (cost)            │
│                                                          │
│ Traceable back through entire supply chain              │
└──────────────────────────────────────────────────────────┘
```

## Verification Status Flow

```
┌──────────────────────────────────────────────────────┐
│         DISTRIBUTOR VERIFICATION STATES              │
│                                                      │
│  [Signup]                                            │
│    ↓                                                  │
│  verification_status = 'pending'                     │
│    ↓                                                  │
│  Admin reviews at /admin/distributors                │
│    ↓                                                  │
│  Two outcomes:                                       │
│    ├─ APPROVE → verification_status = 'verified'    │
│    │            Can upload medicines                 │
│    │            Appears in pharmacy supplier list    │
│    │                                                  │
│    └─ REJECT → verification_status = 'rejected'     │
│               Cannot upload medicines                │
│               Does not appear in supplier list       │
│                                                      │
│  Can be paused/resumed via user status              │
│    ├─ status = 'active' (normal)                    │
│    ├─ status = 'suspended' (paused)                 │
│    └─ status = 'inactive' (deactivated)             │
│                                                      │
└──────────────────────────────────────────────────────┘
```

## Error Handling & Edge Cases

```
┌─────────────────────────────────────────────────────┐
│ EDGE CASES HANDLED                                  │
│                                                     │
│ 1. Expired Medicines                                │
│    → Not shown in pharmacy supplier search          │
│    → expiry_date > NOW() check in queries          │
│                                                     │
│ 2. Out of Stock                                     │
│    → quantity > 0 check in database queries        │
│    → Real-time availability verified               │
│                                                     │
│ 3. Unverified Distributors                          │
│    → Not accessible to pharmacies                   │
│    → verification_status = 'verified' check        │
│                                                     │
│ 4. Unverified Pharmacies                            │
│    → Cannot access supplier discovery               │
│    → Cannot add medicines to inventory              │
│                                                     │
│ 5. Invalid User Types                               │
│    → 401 Unauthorized for incorrect user_type      │
│    → Role-based access control (RBAC)              │
│                                                     │
│ 6. Duplicate Medicines                              │
│    → Pharmacy inventory updated (qty += new qty)   │
│    → Not duplicated in inventory                    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Performance Considerations

```
Optimized Queries:
✓ Indexed columns: user_id, verification_status, 
  expiry_date, quantity
✓ Efficient joins: distributor_profiles + medicines
✓ Real-time filtering: status, expiry, quantity
✓ Sorted results: By price, distributor name
✓ Left joins: pharmacy_inventory → distributor_profiles
  (some medicines may not have specific distributor)

Scalability:
✓ Supports multiple distributors per medicine
✓ Supports multiple pharmacies
✓ Supports unlimited customers
✓ Batch medicine uploads (future enhancement)
✓ Caching for popular medicines (future)
```

---

**Architecture is production-ready and fully scalable!**

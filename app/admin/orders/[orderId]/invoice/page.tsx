import { requireRole } from '@/lib/auth-server'
import { sql } from '@/lib/db'
import { redirect } from 'next/navigation'
import InvoiceDisplay from '@/components/invoice/invoice-display'

export const metadata = {
  title: 'Order Invoice',
}

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = await params

  // Only admin can access this
  const user = await requireRole(['admin'])
  if (!user) {
    redirect('/signin')
  }

  try {
    // Fetch order with all details
    const orderResult = await sql`
      SELECT 
        o.*,
        u.full_name as customer_full_name,
        u.phone as customer_phone,
        pp.pharmacy_name,
        pp.gst_number,
        pp.address as pharmacy_address,
        pp.city as pharmacy_city,
        pp.state as pharmacy_state,
        pp.pincode as pharmacy_pincode,
        pp.license_number,
        da.full_name as delivery_full_name,
        da.phone as delivery_phone,
        da.address_line1 as delivery_address_line1,
        da.address_line2 as delivery_address_line2,
        da.city as delivery_city,
        da.state as delivery_state,
        da.pincode as delivery_pincode
      FROM orders o
      JOIN users u ON o.customer_id = u.id
      LEFT JOIN pharmacy_profiles pp ON o.pharmacy_id = pp.id
      LEFT JOIN addresses da ON o.delivery_address_id = da.id
      WHERE (o.order_number = ${orderId} OR o.id = ${Number(orderId) || 0})
      LIMIT 1
    `

    if (orderResult.length === 0) {
      redirect('/admin/orders')
    }

    const order = orderResult[0] as any

    // Fetch order items
    let items
    try {
      items = await sql`
        SELECT 
          oi.quantity,
          oi.unit_price,
          oi.discount_percentage,
          oi.total_price,
          oi.batch_number,
          oi.mfg_date,
          oi.expiry_date,
          oi.mrp,
          m.name,
          m.generic_name,
          m.hsn_code
        FROM order_items oi
        JOIN medicines m ON oi.medicine_id = m.id
        WHERE oi.order_id = ${order.id}
      `
    } catch (error) {
      items = await sql`
        SELECT 
          oi.quantity,
          oi.unit_price,
          oi.discount_percentage,
          oi.total_price,
          NULL as batch_number,
          NULL as mfg_date,
          NULL as expiry_date,
          NULL as mrp,
          m.name,
          m.generic_name,
          m.hsn_code
        FROM order_items oi
        JOIN medicines m ON oi.medicine_id = m.id
        WHERE oi.order_id = ${order.id}
      `
    }

    const gst = order.subtotal * 0.05

    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <InvoiceDisplay 
          order={order}
          items={items}
          gst={gst}
        />
      </div>
    )
  } catch (error) {
    console.error('[v0] Error loading invoice:', error)
    redirect('/admin/orders')
  }
}

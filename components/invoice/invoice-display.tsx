'use client'

import { useRef, useState } from 'react'
import { Download, Printer, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import html2pdf from 'html2pdf.js'

interface InvoiceDisplayProps {
  order: any
  items: any[]
  gst: number
}

export default function InvoiceDisplay({ order, items, gst }: InvoiceDisplayProps) {
  const invoiceRef = useRef<HTMLDivElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return
    
    setIsDownloading(true)
    try {
      const element = invoiceRef.current
      const opt = {
        margin: 10,
        filename: `Invoice_${order.order_number}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
      }
      html2pdf().set(opt).from(element).save()
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Action Buttons */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <Link href="/admin/orders">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <Button 
            onClick={handlePrint}
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button 
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <Download className="h-4 w-4" />
            {isDownloading ? 'Generating...' : 'Download PDF'}
          </Button>
        </div>
      </div>

      {/* Invoice */}
      <Card className="shadow-lg print:shadow-none print:border-0">
        <div ref={invoiceRef} className="p-8 bg-white">
          {/* Header */}
          <div className="flex justify-between items-start mb-8 pb-8 border-b-2 border-gray-200">
            <div>
              <h1 className="text-4xl font-bold text-green-600">LoveMedix</h1>
              <p className="text-sm text-gray-600 mt-1">TAX INVOICE</p>
            </div>
            <div className="text-right text-sm">
              <p className="font-semibold mb-1">Order Details</p>
              <p><strong>Invoice No:</strong> {order.order_number}</p>
              <p><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
              <p><strong>Status:</strong> <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold mt-1">{order.order_status.toUpperCase()}</span></p>
            </div>
          </div>

          {/* Seller and Buyer Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Sold By */}
            <div>
              <h3 className="font-bold text-sm text-gray-700 mb-3 uppercase">Sold By</h3>
              <div className="space-y-1 text-sm">
                <p className="font-semibold text-gray-900">{order.pharmacy_name}</p>
                <p className="text-gray-700">{order.pharmacy_address}</p>
                <p className="text-gray-700">{order.pharmacy_city}, {order.pharmacy_state} - {order.pharmacy_pincode}</p>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p><span className="text-gray-600">License No:</span> <span className="font-mono">{order.license_number}</span></p>
                  <p><span className="text-gray-600">GST No:</span> <span className="font-mono">{order.gst_number}</span></p>
                </div>
              </div>
            </div>

            {/* Bill To */}
            <div>
              <h3 className="font-bold text-sm text-gray-700 mb-3 uppercase">Bill To</h3>
              <div className="space-y-1 text-sm">
                <p className="font-semibold text-gray-900">{order.delivery_full_name}</p>
                <p className="text-gray-700">Phone: {order.delivery_phone}</p>
                <p className="text-gray-700">{order.delivery_address_line1}</p>
                {order.delivery_address_line2 && <p className="text-gray-700">{order.delivery_address_line2}</p>}
                <p className="text-gray-700">{order.delivery_city}, {order.delivery_state} - {order.delivery_pincode}</p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 border-y-2 border-gray-300">
                  <th className="text-left py-3 px-3 font-semibold">Medicine Name & Details</th>
                  <th className="text-center py-3 px-3 font-semibold">HSN</th>
                  <th className="text-center py-3 px-3 font-semibold">Batch</th>
                  <th className="text-center py-3 px-3 font-semibold">MFG Date</th>
                  <th className="text-center py-3 px-3 font-semibold">EXP Date</th>
                  <th className="text-right py-3 px-3 font-semibold">MRP</th>
                  <th className="text-center py-3 px-3 font-semibold">Qty</th>
                  <th className="text-right py-3 px-3 font-semibold">Unit Price</th>
                  <th className="text-right py-3 px-3 font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const mfgDate = item.mfg_date ? new Date(item.mfg_date).toLocaleDateString('en-IN') : 'N/A'
                  const expDate = item.expiry_date ? new Date(item.expiry_date).toLocaleDateString('en-IN') : 'N/A'
                  return (
                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-3">
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-600">Generic: {item.generic_name}</p>
                      </td>
                      <td className="text-center py-3 px-3 text-gray-700">{item.hsn_code || 'N/A'}</td>
                      <td className="text-center py-3 px-3 text-gray-700">{item.batch_number || 'N/A'}</td>
                      <td className="text-center py-3 px-3 text-gray-700">{mfgDate}</td>
                      <td className="text-center py-3 px-3 text-gray-700">{expDate}</td>
                      <td className="text-right py-3 px-3 text-gray-700">₹{Number(item.mrp || 0).toFixed(2)}</td>
                      <td className="text-center py-3 px-3 text-gray-700">{item.quantity}</td>
                      <td className="text-right py-3 px-3 text-gray-700">₹{Number(item.unit_price).toFixed(2)}</td>
                      <td className="text-right py-3 px-3 font-semibold text-gray-900">₹{Number(item.total_price).toFixed(2)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="flex justify-end mb-8">
            <div className="w-80 space-y-2">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-700">Subtotal (Before GST):</span>
                <span className="font-semibold">₹{Number(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-700">GST (5%):</span>
                <span className="font-semibold">₹{gst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-700">Delivery Charge:</span>
                <span className="font-semibold">{order.delivery_charge === 0 ? 'FREE' : `₹${Number(order.delivery_charge).toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between py-3 px-3 bg-green-50 rounded-lg border-2 border-green-200">
                <span className="font-bold text-gray-900">Total Amount:</span>
                <span className="font-bold text-lg text-green-600">₹{Number(order.total_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment & Delivery Info */}
          <div className="grid grid-cols-2 gap-8 mb-8 py-6 border-t-2 border-b-2 border-gray-200">
            <div>
              <h4 className="font-bold text-sm text-gray-700 mb-2">PAYMENT METHOD</h4>
              <p className="text-sm text-gray-600 capitalize">{order.payment_method || 'Prepaid'}</p>
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-700 mb-2">DELIVERY STATUS</h4>
              <p className="text-sm text-gray-600 capitalize">{order.delivery_status || 'Pending'}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-600 space-y-1 mt-8 pt-6 border-t border-gray-200">
            <p className="font-semibold">This is a computer-generated invoice. No signature required.</p>
            <p>For queries and support, contact: support@lovemedix.com</p>
            <p>© 2026 LoveMedix Healthcare. All rights reserved.</p>
            <p className="mt-3 text-gray-500">Generated on {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

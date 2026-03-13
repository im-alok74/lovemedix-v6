'use client'

import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PrintButton() {
  const handlePrint = () => {
    window.print()
  }

  return (
    <Button onClick={handlePrint} className='flex items-center gap-2'>
      <Printer className='h-4 w-4' />
      Print
    </Button>
  )
}

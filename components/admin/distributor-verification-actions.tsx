'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export function DistributorVerificationActions({ distributorId, userStatus }: { distributorId: number; userStatus: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const updateVerification = async (status: string) => {
    setIsLoading(true)
    try {
      console.log('[v0] Updating verification status:', status)
      const res = await fetch(`/api/admin/distributors/${distributorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verification_status: status })
      })
      
      if (!res.ok) {
        const data = await res.json()
        console.error('[v0] API Error:', data)
        toast({ title: 'Error', description: data.error || 'Failed to update', variant: 'destructive' })
        return
      }

      const data = await res.json()
      console.log('[v0] Verification updated:', data)
      toast({ title: 'Success', description: `Distributor ${status}` })
      router.refresh()
    } catch (error) {
      console.error('[v0] Error updating distributor:', error)
      toast({ title: 'Error', description: 'Network error - please try again', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  const updateUserStatus = async (status: string) => {
    setIsLoading(true)
    try {
      const newStatus = status === 'active' ? 'suspended' : 'active'
      console.log('[v0] Updating user status from', status, 'to', newStatus)
      
      const res = await fetch(`/api/admin/distributors/${distributorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_status: newStatus })
      })

      if (!res.ok) {
        const data = await res.json()
        console.error('[v0] API Error:', data)
        toast({ title: 'Error', description: data.error || 'Failed to update', variant: 'destructive' })
        return
      }

      const data = await res.json()
      console.log('[v0] User status updated:', data)
      toast({ title: 'Success', description: `Distributor ${newStatus}` })
      router.refresh()
    } catch (error) {
      console.error('[v0] Error updating distributor:', error)
      toast({ title: 'Error', description: 'Network error - please try again', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  const deleteDistributor = async () => {
    setIsLoading(true)
    try {
      console.log('[v0] Deleting distributor:', distributorId)
      const res = await fetch(`/api/admin/distributors/${distributorId}`, { method: 'DELETE' })

      if (!res.ok) {
        const data = await res.json()
        console.error('[v0] API Error:', data)
        toast({ title: 'Error', description: data.error || 'Failed to delete', variant: 'destructive' })
        return
      }

      const data = await res.json()
      console.log('[v0] Distributor deleted:', data)
      toast({ title: 'Success', description: 'Distributor deleted successfully' })
      router.refresh()
    } catch (error) {
      console.error('[v0] Error deleting distributor:', error)
      toast({ title: 'Error', description: 'Network error - please try again', variant: 'destructive' })
    } finally {
      setIsLoading(false)
      setShowDeleteAlert(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          onClick={() => updateVerification('verified')}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700"
        >
          Approve
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => updateVerification('rejected')}
          disabled={isLoading}
        >
          Reject
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => updateUserStatus(userStatus === 'active' ? 'suspended' : 'active')}
          disabled={isLoading}
        >
          {userStatus === 'active' ? 'Pause' : 'Resume'}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowDeleteAlert(true)}
          disabled={isLoading}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          Delete
        </Button>
      </div>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Distributor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this distributor? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteDistributor} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

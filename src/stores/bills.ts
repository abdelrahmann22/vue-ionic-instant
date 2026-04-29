import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Bill, Receipt, User } from '@/types'
import { billService } from '@/services/billService'

export const useBillStore = defineStore('bills', () => {
  const bills = ref<Bill[]>([])
  const activeBill = ref<Bill | null>(null)
  const receipt = ref<Receipt | null>(null)
  const loading = ref(false)

  const user: User = {
    name: 'Alex Johnson',
    email: 'alex@example.com',
    totalContributed: 245.00,
    billsPaid: 12,
    activeBills: 2,
  }

  async function loadBills() {
    loading.value = true
    try {
      bills.value = await billService.getBills()
    } finally {
      loading.value = false
    }
  }

  function setActiveBill(bill: Bill) {
    activeBill.value = bill
  }

  function clearActiveBill() {
    activeBill.value = null
  }

  async function scanQR(token: string): Promise<Bill> {
    const bill = await billService.getBillByQR(token)
    activeBill.value = bill
    return bill
  }

  async function pay(amount: number): Promise<Receipt> {
    if (!activeBill.value) throw new Error('No active bill')
    await billService.initiatePayment(activeBill.value.id, amount)
    const txn = 'INST-' + Math.random().toString(36).slice(2, 8).toUpperCase()
    const r: Receipt = {
      amount,
      title: activeBill.value.title,
      merchant: activeBill.value.merchant,
      date: 'Apr 28, 2026 · 9:41 AM',
      txn,
    }
    receipt.value = r
    return r
  }

  function clearReceipt() {
    receipt.value = null
  }

  return { bills, activeBill, receipt, loading, user, loadBills, setActiveBill, clearActiveBill, scanQR, pay, clearReceipt }
})

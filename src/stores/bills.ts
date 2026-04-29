import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Bill, Receipt, User, UserPreferences } from '@/types'
import { billService } from '@/services/billService'

export const useBillStore = defineStore('bills', () => {
  const bills = ref<Bill[]>([])
  const activeBill = ref<Bill | null>(null)
  const receipt = ref<Receipt | null>(null)
  const loading = ref(false)

  const user = ref<User>({
    name: 'Alex Johnson',
    email: 'alex@example.com',
    totalContributed: 245.00,
    billsPaid: 12,
    activeBills: 2,
  })

  const preferences = ref<UserPreferences>({
    notifications: true,
    biometrics: true,
    language: 'English',
  })

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
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' · ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      txn,
    }
    receipt.value = r
    return r
  }

  function clearReceipt() {
    receipt.value = null
  }

  async function updateProfile(name: string, email: string) {
    const updated = await billService.updateProfile(name, email)
    user.value = { ...user.value, name: updated.name, email: updated.email }
  }

  async function logout() {
    await billService.logout()
    bills.value = []
    activeBill.value = null
    receipt.value = null
    user.value = { name: '', email: '', totalContributed: 0, billsPaid: 0, activeBills: 0 }
  }

  async function updatePreferences(prefs: Partial<UserPreferences>) {
    const updated = await billService.updatePreferences(prefs)
    preferences.value = updated
  }

  return {
    bills, activeBill, receipt, loading, user, preferences,
    loadBills, setActiveBill, clearActiveBill, scanQR, pay, clearReceipt,
    updateProfile, logout, updatePreferences,
  }
})

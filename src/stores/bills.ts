import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { BillDetail, PaymentHistoryItem, Receipt, UserPreferences } from '@/types'
import { billService } from '@/services/billService'
import { paymentService } from '@/services/paymentService'

export const useBillStore = defineStore('bills', () => {
  const payments = ref<PaymentHistoryItem[]>([])
  const activeBill = ref<BillDetail | null>(null)
  const activeBillMerchant = ref<string>('')
  const receipt = ref<Receipt | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastInitiatedPaymentAmount = ref<number | null>(null)

  const preferences = ref<UserPreferences>({
    notifications: true,
    biometrics: true,
    language: 'English',
  })

  const totalContributed = computed(() =>
    payments.value
      .filter((p) => p.rawStatus === 'succeeded')
      .reduce((sum, p) => sum + p.amount, 0)
  )

  const billsPaidCount = computed(
    () => payments.value.filter((p) => p.rawStatus === 'succeeded').length
  )

  const activeBillsCount = computed(
    () => payments.value.filter((p) => p.rawStatus === 'pending').length
  )

  async function loadPayments() {
    loading.value = true
    error.value = null
    try {
      payments.value = await paymentService.getUserPayments()
    } catch (e: any) {
      error.value = e?.message ?? 'Failed to load payments'
    } finally {
      loading.value = false
    }
  }

  async function loadBillByToken(billId: number, token: string, merchantName = '') {
    loading.value = true
    error.value = null
    try {
      const bill = await billService.getBillByToken(billId, token)
      activeBill.value = bill
      activeBillMerchant.value = merchantName || lookupMerchant(billId) || ''
      return bill
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? e?.message ?? 'Failed to load bill'
      throw e
    } finally {
      loading.value = false
    }
  }

  function lookupMerchant(billId: number): string {
    const match = payments.value.find((p) => p.billId === billId)
    return match?.merchantName ?? ''
  }

  function clearActiveBill() {
    activeBill.value = null
    activeBillMerchant.value = ''
  }

  async function initiatePayment(amount: number): Promise<string> {
    if (!activeBill.value) throw new Error('No active bill')
    const { checkoutUrl } = await paymentService.initiate(
      activeBill.value.id,
      activeBill.value.token,
      amount
    )
    lastInitiatedPaymentAmount.value = amount
    return checkoutUrl
  }

  async function pollForPaymentSuccess(opts: { intervalMs?: number; maxAttempts?: number } = {}): Promise<PaymentHistoryItem | null> {
    const intervalMs = opts.intervalMs ?? 2500
    const maxAttempts = opts.maxAttempts ?? 80 // ~3.3 minutes
    const billId = activeBill.value?.id
    if (!billId) return null

    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, intervalMs))
      try {
        const list = await paymentService.getUserPayments()
        payments.value = list
        const succeeded = list.find(
          (p) => p.billId === billId && p.rawStatus === 'succeeded'
        )
        if (succeeded) return succeeded
      } catch {
        // ignore transient errors and keep polling
      }
    }
    return null
  }

  function buildReceipt(item: PaymentHistoryItem): Receipt {
    const r: Receipt = {
      amount: item.amount,
      title: item.billTitle,
      merchant: item.merchantName,
      date: item.paidAt
        ? new Date(item.paidAt).toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })
        : new Date().toLocaleString(),
      txn: 'INST-' + String(item.paymentId).padStart(6, '0'),
    }
    receipt.value = r
    return r
  }

  function clearReceipt() {
    receipt.value = null
  }

  function reset() {
    payments.value = []
    activeBill.value = null
    activeBillMerchant.value = ''
    receipt.value = null
    error.value = null
  }

  async function updatePreferences(prefs: Partial<UserPreferences>) {
    preferences.value = { ...preferences.value, ...prefs }
  }

  return {
    payments, activeBill, activeBillMerchant, receipt, loading, error,
    preferences, lastInitiatedPaymentAmount,
    totalContributed, billsPaidCount, activeBillsCount,
    loadPayments, loadBillByToken, clearActiveBill,
    initiatePayment, pollForPaymentSuccess, buildReceipt, clearReceipt,
    updatePreferences, reset,
  }
})

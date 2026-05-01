import { io, Socket } from 'socket.io-client'
import { ref, onUnmounted } from 'vue'

const API_BASE = import.meta.env.VITE_API_URL || 'https://nodejs-instant-api-production.up.railway.app'

export interface BillContributor {
  name: string
  amount: number
}

export interface PaymentSucceededData {
  paid_amount: number
  pending_amount: number
  remaining: number
  contributor: BillContributor
}

export interface BillPaidData {
  bill_id: number
  status: 'paid'
}

export interface PaymentCancelledData {
  payment_id: number
  paid_amount: number
  pending_amount: number
  remaining: number
}

export interface PaymentInitiatedData {
  pending_amount: number
  remaining: number
  contributor: BillContributor
}

export function useBillSocket() {
  const socket = ref<Socket | null>(null)

  function connect(
    billId: number,
    billToken: string,
    handlers: {
      onPaymentSucceeded?: (data: PaymentSucceededData) => void
      onPaymentCancelled?: (data: PaymentCancelledData) => void
      onBillPaid?: (data: BillPaidData) => void
      onPaymentInitiated?: (data: PaymentInitiatedData) => void
    }
  ) {
    // Disconnect any existing socket first
    disconnect()

    socket.value = io(API_BASE, {
      auth: { billId, billToken },
      transports: ['websocket', 'polling'],
    })

    socket.value.on('payment:succeeded', (data: PaymentSucceededData) => {
      handlers.onPaymentSucceeded?.(data)
    })

    socket.value.on('payment:cancelled', (data: PaymentCancelledData) => {
      handlers.onPaymentCancelled?.(data)
    })

    socket.value.on('bill:paid', (data: BillPaidData) => {
      handlers.onBillPaid?.(data)
    })

    socket.value.on('payment:initiated', (data: PaymentInitiatedData) => {
      handlers.onPaymentInitiated?.(data)
    })

    socket.value.on('error', (msg: string) => {
      console.error('Socket error:', msg)
    })
  }

  function disconnect() {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
    }
  }

  onUnmounted(disconnect)

  return { connect, disconnect }
}

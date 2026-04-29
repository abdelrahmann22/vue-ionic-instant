import type { Bill, PaymentResponse } from '@/types'

const MOCK_BILLS: Bill[] = [
  {
    id: 'p1', title: 'Dinner Split', merchant: 'Acme Restaurant',
    time: '2 min ago', date: 'Apr 28, 2026', amount: 45.00,
    status: 'Completed', peopleCount: 3,
    total: 200, contributed: 125, userShare: 75, code: 'A1F4',
    items: [
      { qty: 1, name: 'Ribeye Steak', price: 65 },
      { qty: 1, name: 'Grilled Salmon', price: 55 },
      { qty: 1, name: 'Shared Starters & Drinks', price: 60 },
    ],
    subtotal: 180, tax: 20,
    contributors: [
      { id: 'u1', name: 'You', amount: 75, paid: true, time: 'just now' },
      { id: 'u2', name: 'Ali', amount: 50, paid: true, time: '5 min ago' },
      { id: 'u3', name: 'Sara', amount: 75, paid: false, time: '' },
    ],
  },
  {
    id: 'p2', title: 'Lunch Group', merchant: 'Green Bowl',
    time: '1 hour ago', date: 'Apr 28, 2026', amount: 28.50,
    status: 'Completed', peopleCount: 4,
    total: 114, contributed: 114, userShare: 28.50, code: 'B2C9',
    items: [
      { qty: 4, name: 'Buddha Bowl', price: 88 },
      { qty: 2, name: 'Iced Matcha', price: 14 },
      { qty: 1, name: 'Side Kimchi', price: 6 },
    ],
    subtotal: 108, tax: 6,
    contributors: [
      { id: 'u1', name: 'You', amount: 28.5, paid: true, time: '1h ago' },
      { id: 'u2', name: 'Ali', amount: 28.5, paid: true, time: '1h ago' },
      { id: 'u3', name: 'Sara', amount: 28.5, paid: true, time: '58m ago' },
      { id: 'u4', name: 'Marco', amount: 28.5, paid: true, time: '45m ago' },
    ],
  },
  {
    id: 'p3', title: 'Movie Night', merchant: 'Vue Cinema',
    time: 'Yesterday', date: 'Apr 27, 2026', amount: 12.00,
    status: 'Failed', peopleCount: 5,
    total: 60, contributed: 24, userShare: 12, code: 'C3D7',
    items: [{ qty: 5, name: 'Premium Seat', price: 60 }],
    subtotal: 60, tax: 0,
    contributors: [
      { id: 'u1', name: 'You', amount: 12, paid: false, time: '' },
      { id: 'u2', name: 'Ali', amount: 12, paid: true, time: 'Yesterday' },
      { id: 'u3', name: 'Sara', amount: 12, paid: true, time: 'Yesterday' },
    ],
  },
  {
    id: 'p4', title: 'Team Event', merchant: 'Roof Bar',
    time: 'Yesterday', date: 'Apr 27, 2026', amount: 67.25,
    status: 'Completed', peopleCount: 8,
    total: 538, contributed: 538, userShare: 67.25, code: 'D4E2',
    items: [
      { qty: 1, name: 'Catering', price: 480 },
      { qty: 8, name: 'Drinks', price: 48 },
    ],
    subtotal: 528, tax: 10,
    contributors: [
      { id: 'u1', name: 'You', amount: 67.25, paid: true, time: 'Yesterday' },
    ],
  },
  {
    id: 'p5', title: 'Brunch', merchant: 'Sunny Cafe',
    time: '2 days ago', date: 'Apr 26, 2026', amount: 22.00,
    status: 'Completed', peopleCount: 3,
    total: 66, contributed: 66, userShare: 22, code: 'E5F1',
    items: [
      { qty: 3, name: 'Brunch plate', price: 60 },
      { qty: 3, name: 'Coffee', price: 6 },
    ],
    subtotal: 60, tax: 6,
    contributors: [
      { id: 'u1', name: 'You', amount: 22, paid: true, time: '2d ago' },
    ],
  },
]

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const billService = {
  async getBills(): Promise<Bill[]> {
    await delay(300)
    return [...MOCK_BILLS]
  },

  async getBillById(id: string): Promise<Bill | null> {
    await delay(200)
    return MOCK_BILLS.find(b => b.id === id) ?? null
  },

  async getBillByQR(_token: string): Promise<Bill> {
    await delay(1400)
    return MOCK_BILLS[0]
  },

  async initiatePayment(billId: string, amount: number): Promise<PaymentResponse> {
    await delay(800)
    return {
      paymentId: String(Math.floor(Math.random() * 10000)),
      checkoutUrl: '',
      status: 'pending',
    }
  },

  async confirmPayment(billId: string, paymentId: string): Promise<void> {
    await delay(300)
  },
}

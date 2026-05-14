import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn)
  const end = new Date(checkOut)
  return Math.max(0, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export const SUPPORT_OPTIONS = [
  { value: 'temporary_stay',   label: 'Temporary Stay',        icon: '🏠' },
  { value: 'airport_pickup',   label: 'Airport Pickup',        icon: '✈️' },
  { value: 'apartment_search', label: 'Apartment Search Help', icon: '🔍' },
  { value: 'local_guidance',   label: 'Local Guidance',        icon: '🗺️' },
] as const

export const LANGUAGE_OPTIONS = [
  'Arabic', 'Bengali', 'Dutch', 'English', 'French', 'German',
  'Hindi', 'Italian', 'Japanese', 'Korean', 'Mandarin', 'Polish',
  'Portuguese', 'Russian', 'Spanish', 'Swahili', 'Tagalog',
  'Turkish', 'Urdu', 'Vietnamese',
]

export const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID',
  'IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS',
  'MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK',
  'OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV',
  'WI','WY','DC',
]

export const PAYMENT_METHODS = [
  { value: 'cash',          label: 'Cash',          icon: '💵' },
  { value: 'paypal',        label: 'PayPal',         icon: '🅿️' },
  { value: 'venmo',         label: 'Venmo',          icon: '💸' },
  { value: 'zelle',         label: 'Zelle',          icon: '⚡' },
  { value: 'bank_transfer', label: 'Bank Transfer',  icon: '🏦' },
  { value: 'crypto',        label: 'Crypto',         icon: '₿'  },
] as const

export const BOOKING_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Pending',   color: 'bg-yellow-100 text-yellow-800' },
  accepted:  { label: 'Accepted',  color: 'bg-green-100 text-green-800'  },
  declined:  { label: 'Declined',  color: 'bg-red-100 text-red-800'      },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800'    },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-800'    },
}

export type Role = 'guest' | 'host' | 'both' | 'admin'
export type BookingStatus = 'pending' | 'accepted' | 'declined' | 'cancelled' | 'completed'
export type SupportType = 'temporary_stay' | 'airport_pickup' | 'apartment_search' | 'local_guidance'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  phone: string | null
  languages: string[]
  role: Role
  country_of_origin: string | null
  linkedin_verified: boolean
  linkedin_name: string | null
  instagram_url: string | null
  created_at: string
  updated_at: string
}

export interface HostListing {
  id: string
  host_id: string
  title: string
  city: string
  state: string
  address: string | null
  neighborhood: string | null
  description: string | null
  max_guests: number
  max_stay_days: number
  is_free: boolean
  price_per_night: number | null
  house_rules: string | null
  languages_spoken: string[]
  support_offered: SupportType[]
  payment_methods_accepted: string[]
  is_verified: boolean
  is_active: boolean
  is_booked: boolean
  available_from: string | null
  available_to: string | null
  created_at: string
  updated_at: string
  profiles?: Profile
}

export type PaymentStatus = 'pending' | 'paid' | 'refunded'

export interface Booking {
  id: string
  listing_id: string
  guest_id: string
  host_id: string
  check_in: string
  check_out: string
  num_guests: number
  message: string | null
  status: BookingStatus
  total_price: number | null
  payment_method: string | null
  payment_status: PaymentStatus
  created_at: string
  updated_at: string
  host_listings?: HostListing & { profiles?: Profile }
  guest?: Profile
}

export interface Review {
  id: string
  booking_id: string
  reviewer_id: string
  reviewee_id: string
  listing_id: string | null
  rating: number
  comment: string | null
  created_at: string
}

export interface Message {
  id: string
  booking_id: string | null
  sender_id: string
  recipient_id: string
  content: string
  is_read: boolean
  created_at: string
}

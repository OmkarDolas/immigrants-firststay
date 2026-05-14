export type Role = 'guest' | 'host' | 'both' | 'admin'
export type VerificationStatus = 'pending' | 'approved' | 'rejected'
export type BookingStatus = 'pending' | 'accepted' | 'declined' | 'cancelled' | 'completed'
export type SupportType = 'temporary_stay' | 'airport_pickup' | 'apartment_search' | 'local_guidance'

export type ServiceType = 'airport_pickup' | 'apartment_search' | 'local_guidance'
export type ServiceRequestStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

export interface AirportPickupRequestData {
  airport_name: string
  arrival_date: string
  arrival_time: string
  flight_number: string
  num_passengers: number
  num_bags: number
  destination_address: string
  preferred_language: string
  special_instructions: string
}

export interface ApartmentSearchRequestData {
  target_city: string
  target_state: string
  move_in_date: string
  budget_min: number
  budget_max: number
  num_bedrooms: number
  lease_duration: string
  has_pets: boolean
  needs_furnished: boolean
  preferred_neighborhoods: string
  additional_requirements: string
}

export interface LocalGuidanceRequestData {
  city: string
  state: string
  guidance_category: string
  preferred_language: string
  urgency_level: 'low' | 'medium' | 'high'
  question: string
}

export interface ServiceRequest {
  id: string
  user_id: string
  service_type: ServiceType
  status: ServiceRequestStatus
  request_data: AirportPickupRequestData | ApartmentSearchRequestData | LocalGuidanceRequestData
  assigned_host_id: string | null
  admin_notes: string | null
  created_at: string
  updated_at: string
  profiles?: Pick<Profile, 'id' | 'full_name' | 'email'>
  assigned_host?: Pick<Profile, 'id' | 'full_name' | 'email'>
}

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
  verification_status: VerificationStatus
  gov_id_path: string | null
  gov_id_type: string | null
  rejection_reason: string | null
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

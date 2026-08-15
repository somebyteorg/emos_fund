export interface FundTier {
  fund_activity_id: number
  carrot: number
  price: number
  name: string
  description: string | null
  count_total: number
  count_used: number
  count_limit: number | null
  time_expired: string | null
}

export interface FundActivity {
  id: number
  name: string
  description: string | null
  amount_total: number
  amount_used: number
  user_limit: number | null
  time_start: string | null
  time_end: string | null
  tires: FundTier[]
}

export interface CarrotBalance {
  carrot: number
}

export interface FundOrderItem {
  activity_code: string
  activity_name: string
  activity_description: string | null
  order_no: string
  order_title: string
  footprint_post_id: string | number | null
  order_bodys: unknown
  tier_name: string
  tier_description: string | null
  tier_carrot: number
  tier_price: number
  time_expired: string | null
  payed_at: string | null
  payout_status: string
  payout_status_string: string
  payout_price: number | null
  payout_at: string | null
}

export interface FundOrderListResponse {
  page: number
  page_size: number
  total: number
  items: FundOrderItem[]
}

export interface ApiMessageResponse {
  message?: string | null
}

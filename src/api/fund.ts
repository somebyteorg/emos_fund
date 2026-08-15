import request from '@/utils/ky'
import type { ApiMessageResponse, CarrotBalance, FundActivity, FundOrderListResponse } from '@/types/fund'

interface OrderListQuery {
  page?: number
  pageSize?: number
  orderNo?: string
}

export const fundApi = {
  getActivity(code: string) {
    return request.get(`api/fund/activity/${encodeURIComponent(code)}`).json<FundActivity>()
  },
  getCarrotCurrent() {
    return request.get('api/carrot/current').json<CarrotBalance>()
  },
  checkOrder(code: string) {
    return request
      .post('api/fund/order/check', {
        json: {
          fund_activity_code: code,
        },
      })
      .json<ApiMessageResponse>()
  },
  createOrder(code: string, carrot: number) {
    return request.post('api/fund/order/create', {
      json: {
        fund_activity_code: code,
        carrot,
      },
    })
  },
  getOrderList({ page = 1, pageSize = 10, orderNo }: OrderListQuery = {}) {
    const searchParams = {
      page,
      page_size: pageSize,
      ...(orderNo ? { order_no: orderNo } : {}),
    }

    return request.get('api/fund/order/list', { searchParams }).json<FundOrderListResponse>()
  },
}

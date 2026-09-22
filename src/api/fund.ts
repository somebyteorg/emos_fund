import request from '@/utils/ky'
import type { ApiMessageResponse, CarrotBalance, FundActivity, FundOrderListResponse, UploadTokenResponse } from '@/types/fund'
import type { UserBase } from '@/types/user'

interface OrderListQuery {
  page?: number
  pageSize?: number
  orderNo?: string
}

export const fundApi = {
  getUserBase() {
    return request.get('api/user/base').json<UserBase>()
  },
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
  getUploadToken(file: File) {
    return request
      .post('api/upload/getUploadToken', {
        json: {
          project_name: 'fund',
          type: 'image',
          file_type: file.type,
          file_name: file.name,
          file_size: file.size,
        },
      })
      .json<UploadTokenResponse>()
  },
  submitEvidence(orderNo: string, images: string[], remark: string) {
    return request
      .post('api/fund/order/evidence', {
        json: {
          order_no: orderNo,
          images,
          remark,
        },
      })
      .json<ApiMessageResponse>()
  },
}

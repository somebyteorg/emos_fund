import ky from 'ky'
import { useSignStore } from '@/stores/sign'

export const PREFIX_URL = import.meta.env.PROD ? 'https://emos.best/' : '/'

const instance = ky.create({
  prefixUrl: PREFIX_URL,
  timeout: 1000 * 30,
  retry: 0,
  hooks: {
    beforeRequest: [
      (request) => {
        const token = useSignStore().user_token

        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`)
        }
      },
    ],
    afterResponse: [
      (_request, _options, response) => {
        if (response.status === 401) {
          useSignStore().signOut()
        }
      },
    ],
  },
})

export default instance

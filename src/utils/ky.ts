import ky from 'ky'
import { useSignStore } from '@/stores/sign'

const instance = ky.create({
  prefixUrl: import.meta.env.PROD ? 'https://emos.best/' : '/',
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

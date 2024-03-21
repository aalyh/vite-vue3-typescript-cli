import axios, {
	AxiosInstance,
	AxiosRequestConfig,
	// AxiosRequestHeaders,
	AxiosResponse
} from 'axios'
// 根据实际的组件库进行引入
import { FileItem, Message, Modal } from '@arco-design/web-vue'
import { useUserStore } from '@/store'
import { getToken } from '@/utils/auth'
import LRUCache from '@/dataStruct/LRUCache'
import getFileFormData from '../file'
import { Optimization } from './Optimizations'

export interface HttpResponse<T = unknown> {
	success: boolean
	code: number
	data: T
	message: string
}

const MAX_CACHE_SIZE = 10

// const errorCodeMap: Record<number, string> = {
// 	1403: '用户不存在',
// 	401: '', // 两种情况， 401直接拿message
// 	500: '服务器异常',
// 	403: '无此权限',
// 	503: '密码错误',
// 	10010: '功能正在开发中'
// }

class HttpRequest {
	// axios实例
	private service: AxiosInstance

	// 缓存
	private cacheMap = new LRUCache(MAX_CACHE_SIZE)

	constructor() {
		this.service = axios.create({
			baseURL: import.meta.env.VITE_API_BASE_URL,
			timeout: 5 * 1000
		})
		this.service.interceptors.request.use(
			(config: AxiosRequestConfig) => {
				// let each request carry token
				// this example using the JWT token
				// Authorization is a custom headers key
				// please modify it according to the actual situation
				const token = getToken()
				if (token) {
					if (!config.headers) {
						config.headers = {}
					}
					config.headers.Authorization = `Bearer ${token}`
				}
				// 登出时清空缓存
				if (config.url === 'user/logout') {
					this.cacheMap.clear()
				}
				return config
			},
			(error) => {
				// do something
				return Promise.reject(error)
			}
		)
		// add response interceptors
		this.service.interceptors.response.use(
			(response: AxiosResponse<HttpResponse>): AxiosResponse['data'] => {
				const res = response.data
				// http error response guard
				if (!res.success) {
					Message.error({
						content: res.message || 'Error',
						duration: 5 * 1000
					})
					// TODO: 这里可能还需要根据后端修改
					// 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
					if (
						[403].includes(res.code) &&
						response.config.url !== '/api/user/info'
					) {
						Modal.error({
							title: '确认注销',
							content: '您已经注销，您可以取消并停留在此页面，或者重新登录',
							okText: '重新登陆',
							async onOk() {
								const userStore = useUserStore()
								await userStore.logout()
								window.location.reload()
							}
						})
					}
					return Promise.reject(new Error(res.message || 'Error'))
				}
				return res as HttpResponse
			},
			(error) => {
				Message.error({
					content: error.msg || '网络错误',
					duration: 5 * 1000
				})
				return Promise.reject(error)
			}
		)
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	request<T = any>(
		config: AxiosRequestConfig,
		opts?: Optimization
	): Promise<HttpResponse<T>> {
		/**
		 * TODO: execute other methods according to config
		 */
		// eslint-disable-next-line consistent-return
		return new Promise((resolve, reject) => {
			if (opts?.cache) {
				const cache = this.cacheMap.get(config.url as string)
				if (cache) {
					console.log(cache)
					// eslint-disable-next-line no-promise-executor-return
					return resolve(cache as HttpResponse<T>)
				}
			}
			try {
				this.service
					.request<AxiosResponse<T>>(config)
					.then((res: AxiosResponse['data']) => {
						if (opts?.cache) {
							this.cacheMap.set(config.url as string, res)
						}
						return resolve(res as HttpResponse<T>)
					})
					.catch((err) => {
						// do something
						return reject(err)
					})
			} catch (err) {
				// eslint-disable-next-line no-promise-executor-return
				return reject(err)
			}
		})
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	post<T = any>(
		url: string,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		data?: any,
		config?: Omit<AxiosRequestConfig, 'url' | 'data' | 'method'>,
		opts?: Optimization
	) {
		return this.request<T>({ url, data, method: 'POST', ...config }, opts)
	}

	upload<T = string>(
		url: string,
		fileItem: FileItem,
		otherParams: Record<string, number | string>,
		config: Omit<AxiosRequestConfig, 'url' | 'data' | 'method'>
	) {
		const data = getFileFormData(fileItem, otherParams)
		const requestConfig: AxiosRequestConfig = {
			...config,
			headers: {
				...config.headers,
				'Content-Type': 'multipart/form-data'
			}
		}
		return this.request<T>({ url, data, ...requestConfig })
	}
}

const request = new HttpRequest()
export default request

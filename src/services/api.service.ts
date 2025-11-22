// ===================================
// API SERVICE
// Centralized API client
// ===================================

import axios, { type AxiosInstance, type AxiosError } from 'axios'
import { APP_CONFIG, API_ENDPOINTS } from '../config/index.js'
import type { ChatRequest, ChatResponse, SupportRequest, SupportResponse } from '../types/index.js'

class ApiService {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: APP_CONFIG.API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`)
        return config
      },
      (error) => {
        console.error('[API] Request error:', error)
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`[API] Response:`, response.status)
        return response
      },
      (error: AxiosError) => {
        console.error('[API] Response error:', error.message)
        return Promise.reject(error)
      }
    )
  }

  // ============ Chat Endpoints ============

  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      const { data } = await this.client.post<ChatResponse>(API_ENDPOINTS.CHAT, request)
      return data
    } catch (error) {
      console.error('[ApiService] Send message failed:', error)
      throw error
    }
  }

  // ============ Support Endpoints ============

  async sendSupportRequest(request: SupportRequest): Promise<SupportResponse> {
    try {
      const { data } = await this.client.post<SupportResponse>(API_ENDPOINTS.SUPPORT_REQUEST, request)
      return data
    } catch (error) {
      console.error('[ApiService] Support request failed:', error)
      throw error
    }
  }

  // ============ Destination Endpoints ============

  async getDestinations(): Promise<any> {
    try {
      const { data } = await this.client.get(API_ENDPOINTS.DESTINATIONS)
      return data
    } catch (error) {
      console.error('[ApiService] Get destinations failed:', error)
      throw error
    }
  }

  async getOffer(destination: string): Promise<any> {
    try {
      const { data } = await this.client.get(`${API_ENDPOINTS.OFFERS}/${destination}`)
      return data
    } catch (error) {
      console.error('[ApiService] Get offer failed:', error)
      throw error
    }
  }
}

export const apiService = new ApiService()

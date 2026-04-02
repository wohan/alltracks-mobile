// AllTracks Mobile - API Service

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';

import { 
  type User, type Track, type SportType, type Competition, 
  type AuthRequest, type AuthResponse, ApiResponse 
} from '../types';

// Конфигурация API
const API_BASE_URL = 'http://89.125.123.92:8081/api/v1.0';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Добавляем токен авторизации к запросам
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Обработка ответов
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await AsyncStorage.removeItem('auth_token');
          await AsyncStorage.removeItem('user_data');
        }
        throw error;
      }
    );
  }

  // Аутентификация
  async login(credentials: AuthRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.client.post('/auth/login', credentials);
    await AsyncStorage.setItem('auth_token', response.data.token);
    await AsyncStorage.setItem('user_data', JSON.stringify(response.data.user));
    return response.data;
  }

  async register(userData: Partial<User> & { password: string }): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.client.post('/auth/register', userData);
    await AsyncStorage.setItem('auth_token', response.data.token);
    await AsyncStorage.setItem('user_data', JSON.stringify(response.data.user));
    return response.data;
  }

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user_data');
  }

  // Пользователи
  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  async getUserById(id: string): Promise<User> {
    const response: AxiosResponse<User> = await this.client.get(`/users/${id}`);
    return response.data;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const response: AxiosResponse<User> = await this.client.put(`/users/${id}`, userData);
    return response.data;
  }

  // Треки
  async getTracks(params?: {
    city?: string;
    sportTypeId?: string;
    active?: boolean;
    page?: number;
    size?: number;
  }): Promise<Track[]> {
    const response: AxiosResponse<Track[]> = await this.client.get('/tracks/active', { params });
    return response.data;
  }

  async getTrackById(id: string): Promise<Track> {
    const response: AxiosResponse<Track> = await this.client.get(`/tracks/${id}`);
    return response.data;
  }

  async searchTracks(query: string): Promise<Track[]> {
    const response = await this.client.get('/tracks/search', {
      params: { name: query },
    });
    return response.data.content ?? response.data;
  }

  async getTracksByCity(city: string): Promise<Track[]> {
    const response: AxiosResponse<Track[]> = await this.client.get(`/tracks/city/${city}`);
    return response.data;
  }

  // Виды спорта
  async getSportTypes(): Promise<SportType[]> {
    const response: AxiosResponse<SportType[]> = await this.client.get('/sport-types/active');
    return response.data;
  }

  async getSportTypeById(id: string): Promise<SportType> {
    const response: AxiosResponse<SportType> = await this.client.get(`/sport-types/${id}`);
    return response.data;
  }

  // Соревнования
  async getCompetitions(params?: {
    city?: string;
    sportTypeId?: string;
    status?: string;
    page?: number;
    size?: number;
  }): Promise<Competition[]> {
    const response = await this.client.get('/competitions/search', { params });
    return response.data.content ?? response.data;
  }

  async getCompetitionById(id: string): Promise<Competition> {
    const response: AxiosResponse<Competition> = await this.client.get(`/competitions/${id}`);
    return response.data;
  }

  async getUpcomingCompetitions(): Promise<Competition[]> {
    const response: AxiosResponse<Competition[]> = await this.client.get('/competitions/upcoming');
    return response.data;
  }

  async getActiveCompetitions(): Promise<Competition[]> {
    const response: AxiosResponse<Competition[]> = await this.client.get('/competitions/active');
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get('/health');
      return true;
    } catch {
      return false;
    }
  }
}

export const apiService = new ApiService();

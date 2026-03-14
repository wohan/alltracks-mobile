// AllTracks Mobile - TypeScript Types

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  city?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Track {
  id: string;
  name: string;
  description?: string;
  city: string;
  coverage?: string;
  length: number;
  workingHours?: string;
  seasonOfWork?: string;
  complexity: number;
  rating: number;
  images: Image[];
  coordinates: { lat: number; lng: number };
  sportTypeId: string;
  language: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SportType {
  id: string;
  name: string;
  description?: string;
  active: boolean;
}

export interface Competition {
  id: string;
  name: string;
  description?: string;
  city: string;
  startDate: string;
  endDate: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
  sportTypeId: string;
  trackId?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Image {
  id: string;
  url: string;
  alt?: string;
}

export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

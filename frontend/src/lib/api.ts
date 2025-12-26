const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:8000/api';

export interface User {
  id: number;
  email: string;
  is_active: boolean;
  date_joined: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface MessageResponse {
  message: string;
}

export interface File {
  id: string;
}

export interface CreateFileRequest {
  id: string;
}

export interface Receipt {
  id: string;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  private getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  private storeToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  private clearToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Always check localStorage for the latest token
    const currentToken = this.getStoredToken();

    // Skip auth header only for login/register/magic-link endpoints
    const skipAuthEndpoints = ['/auth/login', '/auth/register', '/auth/magic-link'];
    const shouldSkipAuth = skipAuthEndpoints.some(path => endpoint.includes(path));

    if (currentToken && !shouldSkipAuth) {
      headers['Authorization'] = `Bearer ${currentToken}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async register(
    email: string,
    password: string
  ): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
      }),
    });

    this.storeToken(response.access_token);
    return response;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    this.storeToken(response.access_token);
    return response;
  }

  async requestMagicLink(email: string): Promise<MessageResponse> {
    return this.request<MessageResponse>('/auth/magic-link/request', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyMagicLink(token: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/magic-link/verify', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });

    this.storeToken(response.access_token);
    return response;
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  logout() {
    this.clearToken();
  }

  isAuthenticated(): boolean {
    return this.getStoredToken() !== null;
  }

  async requestPasswordReset(email: string): Promise<MessageResponse> {
    return this.request<MessageResponse>('/auth/password-reset/request', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async confirmPasswordReset(token: string, newPassword: string): Promise<MessageResponse> {
    return this.request<MessageResponse>('/auth/password-reset/confirm', {
      method: 'POST',
      body: JSON.stringify({ token, new_password: newPassword }),
    });
  }

  async deleteAccount(password: string): Promise<MessageResponse> {
    return this.request<MessageResponse>('/auth/account/delete', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }

  // File management methods
  async getFiles(): Promise<File[]> {
    return this.request<File[]>('/files');
  }

  async getFile(id: string): Promise<File> {
    return this.request<File>(`/files/${id}`);
  }

  async createFile(data: CreateFileRequest): Promise<File> {
    return this.request<File>('/files', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Receipt methods
  async getReceipt(id: string): Promise<Receipt> {
    return this.request<Receipt>(`/receipts/${id}`);
  }
}

export const apiClient = new ApiClient();

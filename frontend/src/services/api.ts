/* 
  API Client with Firebase Auth Support
*/
import { auth } from '../firebaseConfig';
import { getIdToken } from 'firebase/auth';

export type Role = 'ADMIN' | 'ANALYST' | 'VIEWER';

export interface User {
  id: string;
  role: Role;
  email?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  date: string;
  notes?: string;
  userId: string;
  createdAt: string;
}

export interface DashboardSummary {
  netBalance: number;
  totalIncome: number;
  totalExpenses: number;
  totals: {
    income: number;
    expenses: number;
    balance: number;
  };
  categoryBreakdown: {
    category: string;
    totalAmount: number;
  }[];
  recentActivity: Transaction[];
  monthlyTrends: {
    month: string;
    type: string;
    total: number;
  }[];
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  
  // Real Firebase Auth
  if (auth.currentUser) {
    const token = await getIdToken(auth.currentUser);
    headers.set('Authorization', `Bearer ${token}`);
    
    // Add Test Role Override from LocalStorage
    const mockRole = localStorage.getItem('mockRole');
    if (mockRole) {
      headers.set('x-test-role-override', mockRole);
    }
  } else {
    // Legacy fallback for testing if no one is logged in
    headers.set('X-User-Id', 'admin-id');
    headers.set('X-User-Role', 'ADMIN');
  }

  headers.set('Content-Type', 'application/json');

  // Use VITE_API_URL when deployed (e.g. Railway/Render), fall back to /api for local dev
  const baseUrl = import.meta.env.VITE_API_URL || '/api';

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || error.error || 'Request failed');
  }

  return response.json();
}

export const api = {
  getSummary: () => request<DashboardSummary>('/dashboard/summary'),
  getRecords: (params?: Record<string, string>) => {
    const cleanParams = params ? Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== '')) : {};
    const query = Object.keys(cleanParams).length > 0 ? `?${new URLSearchParams(cleanParams)}` : '';
    return request<Transaction[]>(`/records${query}`);
  },
  createRecord: (data: Partial<Transaction>) => request<Transaction>('/records', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateRecord: (id: string, data: Partial<Transaction>) => request<Transaction>(`/records/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  deleteRecord: (id: string) => request<{ message: string }>(`/records/${id}`, {
    method: 'DELETE',
  }),
  updateUser: (id: string, data: Partial<User>) => request<User>(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
};
export const {
  getSummary: getDashboardSummary,
  getRecords,
  createRecord,
  updateRecord,
  deleteRecord
} = api;

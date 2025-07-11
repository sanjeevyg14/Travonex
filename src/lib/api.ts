import type { Trip } from './types';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function fetchData<T>(endpoint: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${endpoint}`, init);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${endpoint}`);
  }
  return res.json() as Promise<T>;
}

export function getTrip(id: string) {
  return fetchData<Trip>(`/api/admin/trips/${id}`);
}

export function updateTrip(id: string, data: Partial<Trip>) {
  return fetchData<Trip>(`/api/admin/trips/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function getReportsSummary() {
  return fetchData<{ totalRevenue: number }>(`/api/admin/reports/summary`);
}

export function getMonthlyReports() {
  return fetchData<Array<{ month: string; revenue: number; bookings: number }>>(
    `/api/admin/reports/monthly`
  );
}

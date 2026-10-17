/**
 * API Service for Transactions
 * Connects directly to VikeSo Backend API
 */

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://vikeso-cash-flow-assistant-app.onrender.com/api';

export interface BackendTransaction {
  _id: string;
  id?: string;
  userId: string;
  totalAmount: number;
  transactionType: 'THU' | 'CHI';
  category: string;
  reason?: string;
  transactionDate: string;
  source?: string;
  status?: string;
  details?: string;
}

export interface TransactionsResponse {
  success: boolean;
  data?: BackendTransaction[];
  message?: string;
}

/**
 * Lấy danh sách giao dịch thực tế của hộ kinh doanh từ Backend
 * Endpoint: GET /api/transactions?userId={userId}
 */
export async function getTransactions(userId: string): Promise<BackendTransaction[]> {
  if (!userId) return [];
  try {
    const res = await fetch(`${API_BASE_URL}/transactions?userId=${encodeURIComponent(userId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const body: TransactionsResponse = await res.json();
    if (body.success && Array.isArray(body.data)) {
      return body.data;
    }
    return [];
  } catch (err) {
    console.error('Lỗi khi tải giao dịch từ backend:', err);
    return [];
  }
}

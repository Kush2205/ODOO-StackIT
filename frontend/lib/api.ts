const API_BASE_URL = 'http://localhost:8000';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Generic API call function
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = localStorage.getItem('stackit-token');

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('API call failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Auth API
export const authApi = {
  register: async (userData: {
    username: string;
    email: string;
    password: string;
    is_admin?: boolean;
  }) => {
    return apiCall('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login: async (credentials: { email: string; password: string }) => {
    return apiCall<{ access_token: string; token_type: string }>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
};

// Questions API
export const questionsApi = {
  getAll: async () => {
    return apiCall<any[]>('/questions');
  },

  getById: async (id: string) => {
    return apiCall(`/questions/${id}`);
  },

  create: async (questionData: { title: string; description: string; tags: string[] }) => {
    return apiCall('/questions', {
      method: 'POST',
      body: JSON.stringify(questionData),
    });
  },

  vote: async (questionId: string, direction: 'up' | 'down') => {
    return apiCall(`/questions/${questionId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ direction }),
    });
  },
};

// Answers API
export const answersApi = {
  getByQuestionId: async (questionId: string) => {
    return apiCall<any[]>(`/questions/${questionId}/answers`);
  },

  create: async (questionId: string, answerData: { content: string }) => {
    return apiCall(`/questions/${questionId}/answers`, {
      method: 'POST',
      body: JSON.stringify(answerData),
    });
  },

  vote: async (answerId: string, direction: 'up' | 'down') => {
    return apiCall(`/answers/${answerId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ direction }),
    });
  },

  accept: async (answerId: string) => {
    return apiCall(`/answers/${answerId}/accept`, {
      method: 'POST',
    });
  },
};

// Notifications API
export const notificationsApi = {
  getAll: async (unreadOnly: boolean = false) => {
    return apiCall<any[]>(`/notifications${unreadOnly ? '?unread_only=true' : ''}`);
  },

  getUnreadCount: async () => {
    return apiCall<{ unread_count: number }>('/notifications/count');
  },

  markAllRead: async () => {
    return apiCall('/notifications/mark-read', {
      method: 'POST',
    });
  },
};

// Helper functions
export const setAuthToken = (token: string) => {
  localStorage.setItem('stackit-token', token);
};

export const getAuthToken = () => {
  return localStorage.getItem('stackit-token');
};

export const removeAuthToken = () => {
  localStorage.removeItem('stackit-token');
};

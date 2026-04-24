const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('token');
}

async function apiCall(endpoint, options = {}) {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token && !options.skipAuth) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Something went wrong');
  }

  return response.json();
}

export const authAPI = {
  register: (data) => apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
    skipAuth: true,
  }),
  
  login: (data) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
    skipAuth: true,
  }),
  
  me: () => apiCall('/auth/me'),
};

export const sitesAPI = {
  getAll: () => apiCall('/sites', { skipAuth: true }),
  getBySlug: (slug) => apiCall(`/sites/${slug}`, { skipAuth: true }),
  create: (data) => apiCall('/sites', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiCall(`/sites/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiCall(`/sites/${id}`, { method: 'DELETE' }),
};

export const pagesAPI = {
  getBySite: (siteId) => apiCall(`/pages/site/${siteId}`),
  getPublished: (siteSlug) => apiCall(`/pages/public/${siteSlug}`, { skipAuth: true }),
  getById: (id) => apiCall(`/pages/${id}`),
  getBySlug: (siteSlug, pageSlug) => apiCall(`/pages/${siteSlug}/${pageSlug}`, { skipAuth: true }),
  create: (data) => apiCall('/pages', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiCall(`/pages/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiCall(`/pages/${id}`, { method: 'DELETE' }),
  publish: (id) => apiCall(`/pages/${id}/publish`, { method: 'POST' }),
};

export const commentsAPI = {
  getByPage: (pageId) => apiCall(`/comments/page/${pageId}`, { skipAuth: true }),
  create: (data) => apiCall('/comments', {
    method: 'POST',
    body: JSON.stringify(data),
    skipAuth: true,
  }),
  delete: (id) => apiCall(`/comments/${id}`, { method: 'DELETE' }),
};
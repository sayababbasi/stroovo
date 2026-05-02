// API helper functions for authenticated requests with timeout and retry logic

interface ApiOptions extends RequestInit {
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: any;
}

/**
 * Creates headers for authenticated API requests
 * @param accessToken - The JWT access token
 * @returns Headers object with Authorization and Content-Type
 */
export function createAuthHeaders(accessToken?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  return headers;
}

/**
 * Makes a fetch request with timeout and retry logic
 * @param url - API endpoint URL
 * @param options - Fetch options with timeout and retry settings
 * @returns Promise with fetch response
 */
async function fetchWithTimeout(
  url: string,
  options: ApiOptions = {}
): Promise<Response> {
  const {
    timeout = 30000,
    maxRetries = 2,
    retryDelay = 1000,
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // If response is not ok and it's a server error (5xx), retry
      if (!response.ok && response.status >= 500 && attempt < maxRetries) {
        console.warn(`API request failed (attempt ${attempt + 1}/${maxRetries + 1}): ${response.status} ${response.statusText}`);
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
        continue;
      }

      return response;
    } catch (error: any) {
      lastError = error;
      
      // If it's an abort error (timeout) or network error, retry
      if ((error.name === 'AbortError' || error.message?.includes('fetch')) && attempt < maxRetries) {
        console.warn(`API request failed (attempt ${attempt + 1}/${maxRetries + 1}): ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
        continue;
      }
    }
  }

  throw lastError || new Error('API request failed after retries');
}

/**
 * Makes an authenticated fetch request with proper token handling, timeout, and retry logic
 * @param url - API endpoint URL
 * @param accessToken - JWT access token
 * @param options - Fetch options with timeout and retry settings
 * @returns Promise with fetch response
 */
export async function authenticatedFetch(
  url: string,
  accessToken: string | null,
  options: ApiOptions = {}
): Promise<Response> {
  const headers = {
    ...createAuthHeaders(accessToken || undefined),
    ...options.headers,
  };

  return fetchWithTimeout(url, {
    ...options,
    headers,
    credentials: 'include', // Include cookies for fallback
  });
}

/**
 * Wrapper for GET requests with structured response
 */
export async function apiGet<T = any>(
  url: string,
  accessToken: string | null,
  options?: ApiOptions
): Promise<ApiResponse<T>> {
  try {
    // Add default headers for development
    const headers = {
      'x-tenant-id': 'default-tenant',
      'x-user-id': 'admin@revoticai.com',
      ...options?.headers,
    };

    const response = await authenticatedFetch(url, accessToken, { ...options, method: 'GET', headers });
    
    if (response.ok) {
      const result = await response.json();
      return { success: true, data: result.data !== undefined ? result.data : result, message: result.message };
    } else {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      return { 
        success: false, 
        error: errorData.error || errorData.message || 'Request failed',
        details: errorData.details 
      };
    }
  } catch (error: any) {
    console.error('API GET error:', error);
    return { success: false, error: error.message || 'Network error' };
  }
}

/**
 * Wrapper for POST requests with structured response
 */
export async function apiPost<T = any>(
  url: string,
  accessToken: string | null,
  data: any,
  options?: ApiOptions
): Promise<ApiResponse<T>> {
  try {
    // Add default headers for development
    const headers = {
      'x-tenant-id': 'default-tenant',
      'x-user-id': 'admin@revoticai.com',
      ...options?.headers,
    };

    const response = await authenticatedFetch(url, accessToken, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
      headers,
    });
    
    if (response.ok) {
      const result = await response.json();
      return { success: true, data: result.data || result, message: result.message };
    } else {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      return { 
        success: false, 
        error: errorData.error || errorData.message || 'Request failed',
        details: errorData.details 
      };
    }
  } catch (error: any) {
    console.error('API POST error:', error);
    return { success: false, error: error.message || 'Network error' };
  }
}

/**
 * Wrapper for PUT requests with structured response
 */
export async function apiPut<T = any>(
  url: string,
  accessToken: string | null,
  data: any,
  options?: ApiOptions
): Promise<ApiResponse<T>> {
  try {
    // Add default headers for development
    const headers = {
      'x-tenant-id': 'default-tenant',
      'x-user-id': 'admin@revoticai.com',
      ...options?.headers,
    };

    const response = await authenticatedFetch(url, accessToken, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
      headers,
    });
    
    if (response.ok) {
      const result = await response.json();
      return { success: true, data: result.data || result, message: result.message };
    } else {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      return { 
        success: false, 
        error: errorData.error || errorData.message || 'Request failed',
        details: errorData.details 
      };
    }
  } catch (error: any) {
    console.error('API PUT error:', error);
    return { success: false, error: error.message || 'Network error' };
  }
}

/**
 * Wrapper for DELETE requests with structured response
 */
export async function apiDelete<T = any>(
  url: string,
  accessToken: string | null,
  options?: ApiOptions
): Promise<ApiResponse<T>> {
  try {
    // Add default headers for development
    const headers = {
      'x-tenant-id': 'default-tenant',
      'x-user-id': 'admin@revoticai.com',
      ...options?.headers,
    };

    const response = await authenticatedFetch(url, accessToken, { ...options, method: 'DELETE', headers });
    
    if (response.ok) {
      const result = await response.json();
      return { success: true, data: result.data || result, message: result.message };
    } else {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      return { 
        success: false, 
        error: errorData.error || errorData.message || 'Request failed',
        details: errorData.details 
      };
    }
  } catch (error: any) {
    console.error('API DELETE error:', error);
    return { success: false, error: error.message || 'Network error' };
  }
}

/**
 * Wrapper for PATCH requests with structured response
 */
export async function apiPatch<T = any>(
  url: string,
  accessToken: string | null,
  data: any,
  options?: ApiOptions
): Promise<ApiResponse<T>> {
  try {
    // Add default headers for development
    const headers = {
      'x-tenant-id': 'default-tenant',
      'x-user-id': 'admin@revoticai.com',
      ...options?.headers,
    };

    const response = await authenticatedFetch(url, accessToken, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
      headers,
    });
    
    if (response.ok) {
      const result = await response.json();
      return { success: true, data: result.data || result, message: result.message };
    } else {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      return { 
        success: false, 
        error: errorData.error || errorData.message || 'Request failed',
        details: errorData.details 
      };
    }
  } catch (error: any) {
    console.error('API PATCH error:', error);
    return { success: false, error: error.message || 'Network error' };
  }
}

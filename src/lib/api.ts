
// Helper functions for making API calls to your server or external APIs

/**
 * Generic function to fetch data from API endpoints
 */
export async function fetchFromApi(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * Example function for getting channels data
 */
export async function getChannels() {
  return fetchFromApi('/api/channels');
}

/**
 * Example function for getting content data
 */
export async function getContent(channelId?: string) {
  const url = channelId ? `/api/content?channelId=${channelId}` : '/api/content';
  return fetchFromApi(url);
}

// Add more specific API functions as needed


import { NewsItem } from "@/models/types";

const API_BASE_URL = "/api";

export async function fetchNews(): Promise<NewsItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/news`);
    if (!response.ok) {
      throw new Error('Failed to fetch news');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
}

export async function updateNewsSelection(newsId: string, selected: boolean): Promise<NewsItem> {
  try {
    const response = await fetch(`${API_BASE_URL}/news/${newsId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ selected }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update news selection');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating news selection:', error);
    throw error;
  }
}

export async function sendNewsletter(selectedNewsIds: string[]): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/newsletter/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newsIds: selectedNewsIds }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send newsletter');
    }
  } catch (error) {
    console.error('Error sending newsletter:', error);
    throw error;
  }
}


import { NewsItem } from "@/models/types";
import { query } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid';

export async function getNews(): Promise<NewsItem[]> {
  const result = await query(`
    SELECT id, source, summarized_title as "summarizedTitle", summary, url, selected, 
           created_at as "createdAt", updated_at as "updatedAt" 
    FROM news
    ORDER BY created_at DESC
  `);
  
  return result.rows;
}

export async function updateNewsSelectionStatus(id: string, selected: boolean): Promise<NewsItem> {
  const result = await query(
    `UPDATE news 
     SET selected = $1, updated_at = NOW() 
     WHERE id = $2 
     RETURNING id, source, summarized_title as "summarizedTitle", summary, url, selected, 
               created_at as "createdAt", updated_at as "updatedAt"`,
    [selected, id]
  );
  
  if (result.rows.length === 0) {
    throw new Error('News item not found');
  }
  
  return result.rows[0];
}

export async function getSelectedNews(): Promise<NewsItem[]> {
  const result = await query(`
    SELECT id, source, summarized_title as "summarizedTitle", summary, url, selected, 
           created_at as "createdAt", updated_at as "updatedAt" 
    FROM news
    WHERE selected = true
    ORDER BY created_at DESC
  `);
  
  return result.rows;
}

export async function createNewsItem(newsItem: Omit<NewsItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<NewsItem> {
  const id = uuidv4();
  
  const result = await query(
    `INSERT INTO news (id, source, summarized_title, summary, url, selected, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
     RETURNING id, source, summarized_title as "summarizedTitle", summary, url, selected,
               created_at as "createdAt", updated_at as "updatedAt"`,
    [id, newsItem.source, newsItem.summarizedTitle, newsItem.summary, newsItem.url, newsItem.selected]
  );
  
  return result.rows[0];
}

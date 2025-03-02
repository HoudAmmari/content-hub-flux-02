import { NewsItem } from "@/models/types";
import { v4 as uuidv4 } from 'uuid';

// Simulação de um banco de dados em memória
const db = new Map<string, NewsItem>();

// Dados iniciais para simulação
db.set('1', { id: '1', source: 'Source 1', summarizedTitle: 'Title 1', summary: 'Summary 1', url: 'http://example.com/1', selected: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
db.set('2', { id: '2', source: 'Source 2', summarizedTitle: 'Title 2', summary: 'Summary 2', url: 'http://example.com/2', selected: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });

export async function getNews(): Promise<NewsItem[]> {
  try {
    // const result = await query(`
    //   SELECT id, source, summarized_title as "summarizedTitle", summary, url, selected, 
    //          created_at as "createdAt", updated_at as "updatedAt" 
    //   FROM news
    //   ORDER BY created_at DESC
    // `);
    // return result.rows;

    const result = Array.from(db.values());
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Erro ao buscar notícias:', error);
    throw error;
  }
}

export async function updateNewsSelectionStatus(id: string, selected: boolean): Promise<NewsItem> {
  try {
    // const result = await query(
    //   `UPDATE news 
    //    SET selected = $1, updated_at = NOW() 
    //    WHERE id = $2 
    //    RETURNING id, source, summarized_title as "summarizedTitle", summary, url, selected, 
    //              created_at as "createdAt", updated_at as "updatedAt"`,
    //   [selected, id]
    // );
    // if (result.rows.length === 0) {
    //   throw new Error('News item not found');
    // }
    // return result.rows[0];

    const newsItem = db.get(id);
    if (!newsItem) {
      throw new Error('News item not found');
    }
    const updatedNewsItem = { ...newsItem, selected, updatedAt: new Date().toISOString() };
    db.set(id, updatedNewsItem);
    return updatedNewsItem;
  } catch (error) {
    console.error(`Erro ao atualizar status de seleção da notícia ${id}:`, error);
    throw error;
  }
}

export async function getSelectedNews(): Promise<NewsItem[]> {
  try {
    // const result = await query(`
    //   SELECT id, source, summarized_title as "summarizedTitle", summary, url, selected, 
    //          created_at as "createdAt", updated_at as "updatedAt" 
    //   FROM news
    //   WHERE selected = true
    //   ORDER BY created_at DESC
    // `);
    // return result.rows;

    const result = Array.from(db.values()).filter(newsItem => newsItem.selected);
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Erro ao buscar notícias selecionadas:', error);
    throw error;
  }
}

export async function createNewsItem(newsItem: Omit<NewsItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<NewsItem> {
  try {
    const id = uuidv4();
    const now = new Date().toISOString();
    const newNewsItem: NewsItem = {
      id,
      source: newsItem.source,
      summarizedTitle: newsItem.summarizedTitle,
      summary: newsItem.summary,
      url: newsItem.url,
      selected: newsItem.selected,
      createdAt: now,
      updatedAt: now
    };
    db.set(id, newNewsItem);
    return newNewsItem;
  } catch (error) {
    console.error('Erro ao criar notícia:', error);
    throw error;
  }
}

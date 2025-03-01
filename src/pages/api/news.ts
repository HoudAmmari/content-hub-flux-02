
import { NextApiRequest, NextApiResponse } from 'next';
import { getNews, updateNewsSelectionStatus } from '@/services/newsService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const news = await getNews();
      return res.status(200).json(news);
    } 
    
    if (req.method === 'PATCH') {
      const { id } = req.query;
      const { selected } = req.body;
      
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'News ID is required' });
      }
      
      if (typeof selected !== 'boolean') {
        return res.status(400).json({ error: 'Selected status must be a boolean' });
      }
      
      const updatedNews = await updateNewsSelectionStatus(id, selected);
      return res.status(200).json(updatedNews);
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

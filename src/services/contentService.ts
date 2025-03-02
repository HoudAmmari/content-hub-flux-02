
import { query } from '../lib/db';
import { Content } from '../models/types';
import { v4 as uuidv4 } from 'uuid';

// Serviço para gerenciar operações CRUD de conteúdos
export const contentService = {
  // Obter todos os conteúdos
  async getAllContents(): Promise<Content[]> {
    try {
      const result = await query('SELECT * FROM contents ORDER BY "dueDate" DESC');
      return result.rows.map(row => ({
        ...row,
        tags: row.tags || [],
        isEpic: row.isEpic || false
      }));
    } catch (error) {
      console.error('Erro ao buscar conteúdos:', error);
      throw error;
    }
  },

  // Obter conteúdos por canal
  async getContentsByChannel(channel: string, includeEpics: boolean = false): Promise<Content[]> {
    try {
      let sql = 'SELECT * FROM contents WHERE channel = $1';
      const params = [channel];
      
      if (!includeEpics) {
        sql += ' AND ("isEpic" = false OR "isEpic" IS NULL)';
      }
      
      sql += ' ORDER BY "dueDate" DESC';
      
      const result = await query(sql, params);
      return result.rows.map(row => ({
        ...row,
        tags: row.tags || [],
        isEpic: row.isEpic || false
      }));
    } catch (error) {
      console.error(`Erro ao buscar conteúdos do canal ${channel}:`, error);
      throw error;
    }
  },

  // Obter épicos por canal
  async getEpicsByChannel(channel: string): Promise<Content[]> {
    try {
      const result = await query(
        'SELECT * FROM contents WHERE channel = $1 AND "isEpic" = true ORDER BY "dueDate"',
        [channel]
      );
      return result.rows.map(row => ({
        ...row,
        tags: row.tags || [],
        isEpic: true
      }));
    } catch (error) {
      console.error(`Erro ao buscar épicos do canal ${channel}:`, error);
      throw error;
    }
  },

  // Obter um conteúdo pelo ID
  async getContentById(id: string): Promise<Content | null> {
    try {
      const result = await query('SELECT * FROM contents WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        return null;
      }
      return {
        ...result.rows[0],
        tags: result.rows[0].tags || [],
        isEpic: result.rows[0].isEpic || false
      };
    } catch (error) {
      console.error(`Erro ao buscar conteúdo ${id}:`, error);
      throw error;
    }
  },

  // Criar um novo conteúdo
  async createContent(content: Omit<Content, 'id'>): Promise<Content> {
    try {
      const id = uuidv4();
      const now = new Date().toISOString();
      const result = await query(
        'INSERT INTO contents (id, title, description, status, channel, tags, "dueDate", "isEpic", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
        [id, content.title, content.description, content.status, content.channel, content.tags, content.dueDate, content.isEpic || false, now, now]
      );
      return {
        ...result.rows[0],
        tags: result.rows[0].tags || [],
        isEpic: result.rows[0].isEpic || false
      };
    } catch (error) {
      console.error('Erro ao criar conteúdo:', error);
      throw error;
    }
  },

  // Atualizar um conteúdo existente
  async updateContent(id: string, content: Partial<Content>): Promise<Content | null> {
    try {
      const existingContent = await this.getContentById(id);
      if (!existingContent) {
        return null;
      }

      const now = new Date().toISOString();
      const updates = {
        title: content.title ?? existingContent.title,
        description: content.description ?? existingContent.description,
        status: content.status ?? existingContent.status,
        channel: content.channel ?? existingContent.channel,
        tags: content.tags ?? existingContent.tags,
        dueDate: content.dueDate ?? existingContent.dueDate,
        isEpic: content.isEpic ?? existingContent.isEpic,
        updatedAt: now
      };

      const result = await query(
        'UPDATE contents SET title = $1, description = $2, status = $3, channel = $4, tags = $5, "dueDate" = $6, "isEpic" = $7, "updatedAt" = $8 WHERE id = $9 RETURNING *',
        [updates.title, updates.description, updates.status, updates.channel, updates.tags, updates.dueDate, updates.isEpic, updates.updatedAt, id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return {
        ...result.rows[0],
        tags: result.rows[0].tags || [],
        isEpic: result.rows[0].isEpic || false
      };
    } catch (error) {
      console.error(`Erro ao atualizar conteúdo ${id}:`, error);
      throw error;
    }
  },

  // Excluir um conteúdo
  async deleteContent(id: string): Promise<boolean> {
    try {
      const result = await query('DELETE FROM contents WHERE id = $1', [id]);
      return result.rowCount > 0;
    } catch (error) {
      console.error(`Erro ao excluir conteúdo ${id}:`, error);
      throw error;
    }
  }
};

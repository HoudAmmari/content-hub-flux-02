
import { query } from '../lib/db';
import { Channel } from '../models/types';
import { v4 as uuidv4 } from 'uuid';

// Serviço para gerenciar operações CRUD de canais
export const channelService = {
  // Obter todos os canais
  async getAllChannels(): Promise<Channel[]> {
    try {
      const result = await query('SELECT * FROM channels ORDER BY name');
      return result.rows.map(row => ({
        ...row,
        statuses: row.statuses || ["backlog", "in_progress", "pending", "done"]
      }));
    } catch (error) {
      console.error('Erro ao buscar canais:', error);
      throw error;
    }
  },

  // Obter um canal pelo ID
  async getChannelById(id: string): Promise<Channel | null> {
    try {
      const result = await query('SELECT * FROM channels WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        return null;
      }
      return {
        ...result.rows[0],
        statuses: result.rows[0].statuses || ["backlog", "in_progress", "pending", "done"]
      };
    } catch (error) {
      console.error(`Erro ao buscar canal ${id}:`, error);
      throw error;
    }
  },

  // Obter um canal pelo nome
  async getChannelByName(name: string): Promise<Channel | null> {
    try {
      const result = await query('SELECT * FROM channels WHERE name = $1', [name]);
      if (result.rows.length === 0) {
        return null;
      }
      return {
        ...result.rows[0],
        statuses: result.rows[0].statuses || ["backlog", "in_progress", "pending", "done"]
      };
    } catch (error) {
      console.error(`Erro ao buscar canal ${name}:`, error);
      throw error;
    }
  },

  // Criar um novo canal
  async createChannel(channel: Omit<Channel, 'id'>): Promise<Channel> {
    try {
      const id = uuidv4();
      const now = new Date().toISOString();
      const result = await query(
        'INSERT INTO channels (id, name, description, statuses, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [id, channel.name, channel.description || '', channel.statuses || ["backlog", "in_progress", "pending", "done"], now, now]
      );
      return {
        ...result.rows[0],
        statuses: result.rows[0].statuses || ["backlog", "in_progress", "pending", "done"]
      };
    } catch (error) {
      console.error('Erro ao criar canal:', error);
      throw error;
    }
  },

  // Atualizar um canal existente
  async updateChannel(id: string, channel: Partial<Channel>): Promise<Channel | null> {
    try {
      const existingChannel = await this.getChannelById(id);
      if (!existingChannel) {
        return null;
      }

      const now = new Date().toISOString();
      const updates = {
        name: channel.name ?? existingChannel.name,
        description: channel.description ?? existingChannel.description,
        statuses: channel.statuses ?? existingChannel.statuses,
        updatedAt: now
      };

      const result = await query(
        'UPDATE channels SET name = $1, description = $2, statuses = $3, "updatedAt" = $4 WHERE id = $5 RETURNING *',
        [updates.name, updates.description, updates.statuses, updates.updatedAt, id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return {
        ...result.rows[0],
        statuses: result.rows[0].statuses || ["backlog", "in_progress", "pending", "done"]
      };
    } catch (error) {
      console.error(`Erro ao atualizar canal ${id}:`, error);
      throw error;
    }
  },

  // Excluir um canal
  async deleteChannel(id: string): Promise<boolean> {
    try {
      const result = await query('DELETE FROM channels WHERE id = $1', [id]);
      return result.rowCount > 0;
    } catch (error) {
      console.error(`Erro ao excluir canal ${id}:`, error);
      throw error;
    }
  }
};

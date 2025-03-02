import { Channel } from '../models/types';
import { v4 as uuidv4 } from 'uuid';

// Simulação de um banco de dados em memória
const db = new Map<string, Channel>();

// Dados iniciais para simulação
db.set('1', { id: '1', name: 'Channel 1', description: 'Description 1', statuses: ["backlog", "in_progress", "pending", "done"], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
db.set('2', { id: '2', name: 'Channel 2', description: 'Description 2', statuses: ["backlog", "in_progress", "pending", "done"], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });

// Serviço para gerenciar operações CRUD de canais
export const channelService = {
  // Obter todos os canais
  async getAllChannels(): Promise<Channel[]> {
    try {
      const result = Array.from(db.values());
      return result.map(row => ({
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
      const channel = db.get(id);
      if (!channel) {
        return null;
      }
      return {
        ...channel,
        statuses: channel.statuses || ["backlog", "in_progress", "pending", "done"]
      };
    } catch (error) {
      console.error(`Erro ao buscar canal ${id}:`, error);
      throw error;
    }
  },

  // Obter um canal pelo nome
  async getChannelByName(name: string): Promise<Channel | null> {
    try {
      const channel = Array.from(db.values()).find(channel => channel.name === name);
      if (!channel) {
        return null;
      }
      return {
        ...channel,
        statuses: channel.statuses || ["backlog", "in_progress", "pending", "done"]
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
      const newChannel: Channel = {
        id,
        name: channel.name,
        description: channel.description || '',
        statuses: channel.statuses || ["backlog", "in_progress", "pending", "done"],
        createdAt: now,
        updatedAt: now
      };
      db.set(id, newChannel);
      return newChannel;
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

      const updatedChannel: Channel = {
        ...existingChannel,
        ...updates
      };

      db.set(id, updatedChannel);

      return updatedChannel;
    } catch (error) {
      console.error(`Erro ao atualizar canal ${id}:`, error);
      throw error;
    }
  },

  // Excluir um canal
  async deleteChannel(id: string): Promise<boolean> {
    try {
      const result = db.delete(id);
      return result;
    } catch (error) {
      console.error(`Erro ao excluir canal ${id}:`, error);
      throw error;
    }
  }
};

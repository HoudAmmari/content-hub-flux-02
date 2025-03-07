
import { Content } from '../models/types';
import { v4 as uuidv4 } from 'uuid';
import contentMock from './mock/content-mock';

// Simulação de um banco de dados em memória
const db = new Map<string, Content>();

// Dados iniciais para simulação
for (const content of contentMock) {
  db.set(content.id, content);
}


// Serviço para gerenciar operações CRUD de conteúdos
export const contentService = {
  // Obter todos os conteúdos
  async getAllContents(): Promise<Content[]> {
    try {
      const result = Array.from(db.values());
      return result.map(row => ({
        ...row,
        tags: row.tags || [],
        isEpic: row.isEpic || false
      }));
    } catch (error) {
      console.error('Erro ao buscar conteúdos:', error);
      throw error;
    }
  },

  // Obter conteúdos por canal com paginação
  async getContentsByChannel(
    channel: string, 
    includeEpics: boolean = false,
    options?: { 
      status?: string, 
      page?: number, 
      pageSize?: number 
    }
  ): Promise<{ contents: Content[], total: number }> {
    try {
      let contents = Array.from(db.values()).filter(content => content.channelId === channel);
      
      if (!includeEpics) {
        contents = contents.filter(content => !content.isEpic);
      }
      
      // Filtrar por status, se fornecido
      if (options?.status) {
        contents = contents.filter(content => content.status === options.status);
      }
      
      // Ordenar os conteúdos
      contents.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
      
      // Calcular total antes de paginar
      const total = contents.length;
      
      // Aplicar paginação, se fornecida
      if (options?.page !== undefined && options?.pageSize !== undefined) {
        const startIndex = options.page * options.pageSize;
        contents = contents.slice(startIndex, startIndex + options.pageSize);
      }
      
      return { 
        contents: contents.map(row => ({
          ...row,
          tags: row.tags || [],
          isEpic: row.isEpic || false
        })),
        total
      };
    } catch (error) {
      console.error(`Erro ao buscar conteúdos do canal ${channel}:`, error);
      throw error;
    }
  },

  // Obter épicos por canal com paginação
  async getEpicsByChannel(
    channel: string,
    options?: { 
      status?: string, 
      page?: number, 
      pageSize?: number 
    }
  ): Promise<{ epics: Content[], total: number }> {
    try {
      let contents = Array.from(db.values()).filter(
        content => content.channelId === channel && content.isEpic
      );
      
      // Filtrar por status, se fornecido
      if (options?.status) {
        contents = contents.filter(content => content.status === options.status);
      }
      
      // Ordenar os épicos
      contents.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      
      // Calcular total antes de paginar
      const total = contents.length;
      
      // Aplicar paginação, se fornecida
      if (options?.page !== undefined && options?.pageSize !== undefined) {
        const startIndex = options.page * options.pageSize;
        contents = contents.slice(startIndex, startIndex + options.pageSize);
      }
      
      return {
        epics: contents.map(row => ({
          ...row,
          tags: row.tags || [],
          isEpic: true
        })),
        total
      };
    } catch (error) {
      console.error(`Erro ao buscar épicos do canal ${channel}:`, error);
      throw error;
    }
  },

  // Obter um conteúdo pelo ID
  async getContentById(id: string): Promise<Content | null> {
    try {
      const content = db.get(id);
      if (!content) {
        return null;
      }
      return {
        ...content,
        tags: content.tags || [],
        isEpic: content.isEpic || false
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
      
      // Obter o próximo índice para o status
      const contentsInStatus = Array.from(db.values()).filter(
        item => item.status === content.status && item.channelId === content.channelId
      );
      const nextIndex = contentsInStatus.length;
      
      const newContent: Content = {
        id,
        title: content.title,
        description: content.description || '',
        status: content.status,
        channelId: content.channelId,
        tags: content.tags || [],
        dueDate: content.dueDate || now,
        isEpic: content.isEpic || false,
        index: content.index || nextIndex,
        createdAt: now,
        updatedAt: now
      };
      db.set(id, newContent);
      return newContent;
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
        channel: content.channelId ?? existingContent.channel,
        tags: content.tags ?? existingContent.tags,
        dueDate: content.dueDate ?? existingContent.dueDate,
        isEpic: content.isEpic ?? existingContent.isEpic,
        index: content.index ?? existingContent.index,
        updatedAt: now
      };

      const updatedContent: Content = {
        ...existingContent,
        ...updates
      };

      db.set(id, updatedContent);

      return updatedContent;
    } catch (error) {
      console.error(`Erro ao atualizar conteúdo ${id}:`, error);
      throw error;
    }
  },

  // Atualizar os índices de múltiplos conteúdos
  async updateContentIndices(contentUpdates: { id: string, index: number }[]): Promise<boolean> {
    try {
      for (const update of contentUpdates) {
        const existingContent = await this.getContentById(update.id);
        if (existingContent) {
          await this.updateContent(update.id, { index: update.index });
        }
      }
      return true;
    } catch (error) {
      console.error('Erro ao atualizar índices:', error);
      throw error;
    }
  },

  // Excluir um conteúdo
  async deleteContent(id: string): Promise<boolean> {
    try {
      const result = db.delete(id);
      return result;
    } catch (error) {
      console.error(`Erro ao excluir conteúdo ${id}:`, error);
      throw error;
    }
  }
};

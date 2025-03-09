
import { Content } from '../models/types';
import { v4 as uuidv4 } from 'uuid';
import contentMock from './mock/content-mock';

// Simulação de um banco de dados em memória
const db = new Map<string, Content>();

// Variável para controlar a inicialização única
let dbInitialized = false;

// Dados iniciais para simulação - carregar apenas se o banco estiver vazio E não tiver sido inicializado antes
if (db.size === 0 && !dbInitialized) {
  console.log("Inicializando banco de dados com dados mock");
  for (const content of contentMock) {
    db.set(content.id, content);
  }
  console.log(`Total de conteúdos carregados no banco: ${db.size}`);
  dbInitialized = true;
}

// Serviço para gerenciar operações CRUD de conteúdos
export const contentService = {
  // Obter todos os conteúdos
  async getAllContents(): Promise<Content[]> {
    try {
      const result = Array.from(db.values());
      console.log(`getAllContents: Retornando ${result.length} conteúdos (tamanho atual do banco: ${db.size})`);
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
      
      // Ordenar os conteúdos primeiramente pelo índice, depois pela data de vencimento
      contents.sort((a, b) => {
        // Primeiro, comparar pelo índice (se existir)
        const indexA = a.index !== undefined ? a.index : Number.MAX_SAFE_INTEGER;
        const indexB = b.index !== undefined ? b.index : Number.MAX_SAFE_INTEGER;
        
        if (indexA !== indexB) {
          return indexA - indexB;
        }
        
        // Se os índices forem iguais, ordenar pela data
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      });
      
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
      
      // Ordenar os épicos primeiramente pelo índice, depois pela data de vencimento
      contents.sort((a, b) => {
        // Primeiro, comparar pelo índice (se existir)
        const indexA = a.index !== undefined ? a.index : Number.MAX_SAFE_INTEGER;
        const indexB = b.index !== undefined ? b.index : Number.MAX_SAFE_INTEGER;
        
        if (indexA !== indexB) {
          return indexA - indexB;
        }
        
        // Se os índices forem iguais, ordenar pela data
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
      
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

  // Obter conteúdos por projeto com paginação
  async getContentsByProject(
    projectId: string,
    options?: { 
      status?: string, 
      page?: number, 
      pageSize?: number 
    }
  ): Promise<{ contents: Content[], total: number }> {
    try {
      let contents = Array.from(db.values()).filter(content => content.projectId === projectId);
      
      // Filtrar por status, se fornecido
      if (options?.status) {
        contents = contents.filter(content => content.status === options.status);
      }
      
      // Ordenar os conteúdos primeiramente pelo índice, depois pela data de vencimento
      contents.sort((a, b) => {
        // Primeiro, comparar pelo índice (se existir)
        const indexA = a.index !== undefined ? a.index : Number.MAX_SAFE_INTEGER;
        const indexB = b.index !== undefined ? b.index : Number.MAX_SAFE_INTEGER;
        
        if (indexA !== indexB) {
          return indexA - indexB;
        }
        
        // Se os índices forem iguais, ordenar pela data
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      });
      
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
      console.error(`Erro ao buscar conteúdos do projeto ${projectId}:`, error);
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
        item => item.status === content.status && 
        (
          (content.channelId && item.channelId === content.channelId) || 
          (content.projectId && item.projectId === content.projectId)
        )
      );
      const nextIndex = contentsInStatus.length;
      
      const newContent: Content = {
        id,
        title: content.title,
        description: content.description || '',
        status: content.status,
        channelId: content.channelId,
        projectId: content.projectId,
        tags: content.tags || [],
        dueDate: content.dueDate || now,
        isEpic: content.isEpic || false,
        index: content.index ?? nextIndex,
        createdAt: now,
        updatedAt: now,
        type: content.type || 'default'
      };
      db.set(id, newContent);
      console.log(`Novo conteúdo criado: ${id}, título: ${newContent.title}`);
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
        console.log(`Conteúdo ${id} não encontrado para atualização`);
        return null;
      }

      const now = new Date().toISOString();
      
      // Garantir que todos os campos estejam corretamente mapeados
      const updates = {
        title: content.title ?? existingContent.title,
        description: content.description ?? existingContent.description,
        status: content.status ?? existingContent.status,
        channelId: content.channelId ?? existingContent.channelId,
        tags: content.tags ?? existingContent.tags,
        dueDate: content.dueDate ?? existingContent.dueDate,
        isEpic: content.isEpic ?? existingContent.isEpic,
        index: content.index !== undefined ? content.index : existingContent.index,
        updatedAt: now,
        type: content.type ?? existingContent.type
      };

      const updatedContent: Content = {
        ...existingContent,
        ...updates
      };

      console.log(`Atualizando conteúdo ${id}: "${updatedContent.title}"`);
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
      console.log("Atualizando índices de conteúdos:", contentUpdates.map(u => `${u.id}: ${u.index}`).join(', '));
      
      for (const update of contentUpdates) {
        const existingContent = db.get(update.id);
        if (existingContent) {
          // Atualizar diretamente no banco de dados em memória para evitar leitura extra
          existingContent.index = update.index;
          existingContent.updatedAt = new Date().toISOString();
          db.set(update.id, existingContent);
          
          console.log(`Índice do card ${existingContent.id} (${existingContent.title}) atualizado para ${update.index}`);
        } else {
          console.warn(`Card ${update.id} não encontrado para atualização de índice`);
        }
      }
      
      // Verificar se os índices foram atualizados corretamente
      for (const update of contentUpdates) {
        const content = db.get(update.id);
        console.log(`Verificação: Card ${update.id} - índice atual: ${content?.index}`);
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
      console.log(`Excluindo conteúdo ${id}...`);
      console.log(`Tamanho do banco antes da exclusão: ${db.size}`);
      const result = db.delete(id);
      console.log(`Conteúdo ${id} excluído: ${result}`);
      console.log(`Tamanho do banco após exclusão: ${db.size}`);
      return result;
    } catch (error) {
      console.error(`Erro ao excluir conteúdo ${id}:`, error);
      throw error;
    }
  }
};

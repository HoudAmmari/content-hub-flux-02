
import { Task } from '@/models/types';
import { v4 as uuidv4 } from 'uuid';

// Simulação de um banco de dados em memória
const db = new Map<string, Task>();

// Flag para controlar a inicialização
let dbInitialized = false;

// Dados iniciais para simulação
const initialTasks: Task[] = [
  {
    id: '1',
    projectId: '1',
    title: 'Criar design de tela inicial',
    description: 'Desenvolver mockups para a nova tela inicial do aplicativo',
    status: 'in_progress',
    dueDate: '2025-03-15',
    createdAt: '2025-03-01T10:00:00Z',
    updatedAt: '2025-03-02T14:30:00Z',
    type: 'design',
    channelId: 'design'
  },
  {
    id: '2',
    projectId: '1',
    title: 'Implementar autenticação',
    description: 'Integrar sistema de login com OAuth',
    status: 'pending',
    dueDate: '2025-03-20',
    createdAt: '2025-03-01T10:30:00Z',
    updatedAt: '2025-03-01T10:30:00Z',
    type: 'development',
    channelId: 'auth'
  },
  {
    id: '3',
    projectId: '2',
    title: 'Otimizar banco de dados',
    description: 'Revisar e melhorar consultas SQL para melhor performance',
    status: 'completed',
    dueDate: '2025-03-05',
    createdAt: '2025-02-25T08:00:00Z',
    updatedAt: '2025-03-05T16:45:00Z',
    type: 'database',
    channelId: 'database'
  },
];

// Inicializar o banco de dados em memória apenas se ainda não foi inicializado
const initializeDb = () => {
  if (!dbInitialized) {
    console.log("Inicializando banco de dados de tarefas...");
    initialTasks.forEach(task => {
      db.set(task.id, task);
    });
    dbInitialized = true;
    console.log(`Banco de dados inicializado com ${db.size} tarefas.`);
  }
};

// Inicializar na primeira importação
initializeDb();

// Serviço para gerenciar operações CRUD de tarefas
export const taskService = {
  // Obter todas as tarefas
  async getAllTasks(): Promise<Task[]> {
    try {
      return Array.from(db.values());
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      throw error;
    }
  },

  // Obter tarefas por projeto
  async getTasksByProject(projectId: string): Promise<Task[]> {
    try {
      return Array.from(db.values()).filter(task => task.projectId === projectId);
    } catch (error) {
      console.error(`Erro ao buscar tarefas do projeto ${projectId}:`, error);
      throw error;
    }
  },

  // Obter tarefa pelo ID
  async getTaskById(id: string): Promise<Task | null> {
    try {
      const task = db.get(id);
      return task || null;
    } catch (error) {
      console.error(`Erro ao buscar tarefa ${id}:`, error);
      throw error;
    }
  },

  // Criar uma nova tarefa
  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    try {
      const id = uuidv4();
      const now = new Date().toISOString();
      const newTask: Task = {
        id,
        projectId: task.projectId,
        title: task.title,
        description: task.description,
        status: task.status,
        dueDate: task.dueDate,
        type: task.type || 'default',
        channelId: task.channelId || '',
        createdAt: now,
        updatedAt: now
      };
      db.set(id, newTask);
      return newTask;
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      throw error;
    }
  },

  // Atualizar uma tarefa existente
  async updateTask(id: string, task: Partial<Task>): Promise<Task | null> {
    try {
      const existingTask = db.get(id);
      if (!existingTask) {
        return null;
      }

      const now = new Date().toISOString();
      const updatedTask: Task = {
        ...existingTask,
        ...task,
        updatedAt: now
      };
      db.set(id, updatedTask);
      return updatedTask;
    } catch (error) {
      console.error(`Erro ao atualizar tarefa ${id}:`, error);
      throw error;
    }
  },

  // Excluir uma tarefa
  async deleteTask(id: string): Promise<boolean> {
    try {
      console.log(`Excluindo tarefa com ID: ${id}`);
      const deleted = db.delete(id);
      console.log(`Exclusão bem-sucedida: ${deleted}, Tarefas restantes: ${db.size}`);
      return deleted;
    } catch (error) {
      console.error(`Erro ao excluir tarefa ${id}:`, error);
      throw error;
    }
  },

  // Obter tarefas próximas do vencimento
  async getUpcomingTasks(days: number = 7): Promise<Task[]> {
    try {
      const now = new Date();
      const limit = new Date();
      limit.setDate(now.getDate() + days);
      
      return Array.from(db.values()).filter(task => {
        if (task.status === 'completed') return false;
        
        const dueDate = new Date(task.dueDate);
        return dueDate >= now && dueDate <= limit;
      });
    } catch (error) {
      console.error('Erro ao buscar tarefas próximas:', error);
      throw error;
    }
  },

  // Obter tarefas pendentes (implementando método que faltava)
  async getPendingTasks(): Promise<Task[]> {
    try {
      console.log("Buscando tarefas pendentes...");
      const pendingTasks = Array.from(db.values()).filter(task => 
        task.status === 'pending' || task.status === 'in_progress'
      );
      console.log(`Encontradas ${pendingTasks.length} tarefas pendentes.`);
      return pendingTasks;
    } catch (error) {
      console.error('Erro ao buscar tarefas pendentes:', error);
      throw error;
    }
  }
};

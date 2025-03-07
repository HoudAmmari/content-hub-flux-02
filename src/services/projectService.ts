import { Project, Task } from '../models/types';
import { v4 as uuidv4 } from 'uuid';

// Simulação de um banco de dados em memória
const projectDb = new Map<string, Project>();
const taskDb = new Map<string, Task>();

// Dados iniciais para simulação
projectDb.set('1', { id: '1', title: 'Project 1', description: 'Description 1', progress: 50, status: 'in_progress', deadline: new Date().toISOString(), tasks: 2, completedTasks: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
projectDb.set('2', { id: '2', title: 'Project 2', description: 'Description 2', progress: 100, status: 'completed', deadline: new Date().toISOString(), tasks: 1, completedTasks: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });

taskDb.set('1', { id: '1', projectId: '1', title: 'Task 1', description: 'Description 1', status: 'completed', dueDate: new Date().toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
taskDb.set('2', { id: '2', projectId: '1', title: 'Task 2', description: 'Description 2', status: 'in_progress', dueDate: new Date().toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
taskDb.set('3', { id: '3', projectId: '2', title: 'Task 3', description: 'Description 3', status: 'completed', dueDate: new Date().toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });

// Serviço para gerenciar operações CRUD de projetos
export const projectService = {
  // Obter todos os projetos
  async getAllProjects(): Promise<Project[]> {
    try {
      // const result = await query('SELECT * FROM projects ORDER BY deadline');
      // return result.rows;

      const result = Array.from(projectDb.values());
      return result.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      throw error;
    }
  },

  // Obter um projeto pelo ID
  async getProjectById(id: string): Promise<Project | null> {
    try {
      // const result = await query('SELECT * FROM projects WHERE id = $1', [id]);
      // if (result.rows.length === 0) {
      //   return null;
      // }
      // return result.rows[0];

      const project = projectDb.get(id);
      return project || null;
    } catch (error) {
      console.error(`Erro ao buscar projeto ${id}:`, error);
      throw error;
    }
  },

  // Criar um novo projeto
  async createProject(project: Omit<Project, 'id'>): Promise<Project> {
    try {
      const id = uuidv4();
      const now = new Date().toISOString();
      // const result = await query(
      //   'INSERT INTO projects (id, title, description, progress, status, deadline, tasks, "completedTasks", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      //   [id, project.title, project.description, project.progress, project.status, project.deadline, project.tasks, project.completedTasks, now, now]
      // );
      // return result.rows[0];

      const newProject: Project = {
        id,
        title: project.title,
        description: project.description,
        progress: project.progress,
        status: project.status,
        deadline: project.deadline,
        tasks: project.tasks,
        completedTasks: project.completedTasks,
        createdAt: now,
        updatedAt: now
      };
      projectDb.set(id, newProject);
      return newProject;
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      throw error;
    }
  },

  // Atualizar um projeto existente
  async updateProject(id: string, project: Partial<Project>): Promise<Project | null> {
    try {
      const existingProject = await this.getProjectById(id);
      if (!existingProject) {
        return null;
      }

      const now = new Date().toISOString();
      const updates = {
        title: project.title ?? existingProject.title,
        description: project.description ?? existingProject.description,
        progress: project.progress ?? existingProject.progress,
        status: project.status ?? existingProject.status,
        deadline: project.deadline ?? existingProject.deadline,
        tasks: project.tasks ?? existingProject.tasks,
        completedTasks: project.completedTasks ?? existingProject.completedTasks,
        updatedAt: now
      };

      // const result = await query(
      //   'UPDATE projects SET title = $1, description = $2, progress = $3, status = $4, deadline = $5, tasks = $6, "completedTasks" = $7, "updatedAt" = $8 WHERE id = $9 RETURNING *',
      //   [updates.title, updates.description, updates.progress, updates.status, updates.deadline, updates.tasks, updates.completedTasks, updates.updatedAt, id]
      // );

      // if (result.rows.length === 0) {
      //   return null;
      // }

      const updatedProject: Project = {
        ...existingProject,
        ...updates
      };
      projectDb.set(id, updatedProject);
      return updatedProject;
    } catch (error) {
      console.error(`Erro ao atualizar projeto ${id}:`, error);
      throw error;
    }
  },

  // Excluir um projeto
  async deleteProject(id: string): Promise<boolean> {
    try {
      // const result = await query('DELETE FROM projects WHERE id = $1', [id]);
      // return result.rowCount > 0;

      return projectDb.delete(id);
    } catch (error) {
      console.error(`Erro ao excluir projeto ${id}:`, error);
      throw error;
    }
  },

  // Obter tarefas de um projeto
  async getProjectTasks(projectId: string): Promise<Task[]> {
    try {
      // const result = await query('SELECT * FROM tasks WHERE "projectId" = $1 ORDER BY "dueDate"', [projectId]);
      // return result.rows;

      const result = Array.from(taskDb.values()).filter(task => task.projectId === projectId);
      return result.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    } catch (error) {
      console.error(`Erro ao buscar tarefas do projeto ${projectId}:`, error);
      throw error;
    }
  },

  // Criar uma nova tarefa para um projeto
  async createProjectTask(task: Omit<Task, 'id'>): Promise<Task> {
    try {
      const id = uuidv4();
      const now = new Date().toISOString();
      // const result = await query(
      //   'INSERT INTO tasks (id, "projectId", title, description, status, "dueDate", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      //   [id, task.projectId, task.title, task.description, task.status, task.dueDate, now, now]
      // );

      const newTask: Task = {
        id,
        projectId: task.projectId,
        title: task.title,
        description: task.description,
        status: task.status,
        dueDate: task.dueDate,
        createdAt: now,
        updatedAt: now
      };
      taskDb.set(id, newTask);

      // Atualizar o contador de tarefas do projeto
      await this.updateTaskCounters(task.projectId);

      return newTask;
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      throw error;
    }
  },

  // Atualizar uma tarefa existente
  async updateTask(id: string, task: Partial<Task>): Promise<Task | null> {
    try {
      // const existingTask = await query('SELECT * FROM tasks WHERE id = $1', [id]);
      // if (existingTask.rows.length === 0) {
      //   return null;
      // }

      const existingTask = taskDb.get(id);
      if (!existingTask) {
        return null;
      }

      const now = new Date().toISOString();
      const updates = {
        title: task.title ?? existingTask.title,
        description: task.description ?? existingTask.description,
        status: task.status ?? existingTask.status,
        dueDate: task.dueDate ?? existingTask.dueDate,
        updatedAt: now
      };

      // const result = await query(
      //   'UPDATE tasks SET title = $1, description = $2, status = $3, "dueDate" = $4, "updatedAt" = $5 WHERE id = $6 RETURNING *',
      //   [updates.title, updates.description, updates.status, updates.dueDate, updates.updatedAt, id]
      // );

      // if (result.rows.length === 0) {
      //   return null;
      // }

      const updatedTask: Task = {
        ...existingTask,
        ...updates
      };
      taskDb.set(id, updatedTask);

      // Se o status foi alterado, atualizar os contadores de tarefas do projeto
      if (task.status && task.status !== existingTask.status) {
        await this.updateTaskCounters(existingTask.projectId);
      }

      return updatedTask;
    } catch (error) {
      console.error(`Erro ao atualizar tarefa ${id}:`, error);
      throw error;
    }
  },

  // Excluir uma tarefa
  async deleteTask(id: string): Promise<boolean> {
    try {
      // const existingTask = await query('SELECT "projectId" FROM tasks WHERE id = $1', [id]);
      // if (existingTask.rows.length === 0) {
      //   return false;
      // }

      const existingTask = taskDb.get(id);
      if (!existingTask) {
        return false;
      }

      const projectId = existingTask.projectId;
      // const result = await query('DELETE FROM tasks WHERE id = $1', [id]);

      const result = taskDb.delete(id);

      if (result) {
        // Atualizar os contadores de tarefas do projeto
        await this.updateTaskCounters(projectId);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Erro ao excluir tarefa ${id}:`, error);
      throw error;
    }
  },

  // Atualizar contadores de tarefas de um projeto
  async updateTaskCounters(projectId: string): Promise<void> {
    try {
      // Contar o total de tarefas
      // const totalResult = await query('SELECT COUNT(*) as total FROM tasks WHERE "projectId" = $1', [projectId]);
      // const total = parseInt(totalResult.rows[0].total);

      const total = Array.from(taskDb.values()).filter(task => task.projectId === projectId).length;

      // Contar tarefas completadas
      // const completedResult = await query('SELECT COUNT(*) as completed FROM tasks WHERE "projectId" = $1 AND status = $2', [projectId, 'completed']);
      // const completed = parseInt(completedResult.rows[0].completed);

      const completed = Array.from(taskDb.values()).filter(task => task.projectId === projectId && task.status === 'completed').length;

      // Calcular o progresso
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

      // Atualizar o projeto
      // await query(
      //   'UPDATE projects SET tasks = $1, "completedTasks" = $2, progress = $3 WHERE id = $4',
      //   [total, completed, progress, projectId]
      // );

      const project = projectDb.get(projectId);
      if (project) {
        projectDb.set(projectId, {
          ...project,
          tasks: total,
          completedTasks: completed,
          progress
        });
      }
    } catch (error) {
      console.error(`Erro ao atualizar contadores de tarefas do projeto ${projectId}:`, error);
      throw error;
    }
  }
};

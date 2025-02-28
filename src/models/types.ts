
// Tipos para os modelos de dados

export interface Content {
  id: string;
  title: string;
  description: string;
  status: string;
  channel: string;
  tags: string[];
  dueDate: string;
  isEpic?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: "em_andamento" | "concluido" | "pausado";
  deadline: string;
  tasks: number;
  completedTasks: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: "completed" | "in_progress" | "pending";
  dueDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  statuses: string[];
  createdAt?: string;
  updatedAt?: string;
}

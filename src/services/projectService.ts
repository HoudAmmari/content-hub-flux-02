
import { Project } from '../models/types';
import { v4 as uuidv4 } from 'uuid';

// Sample data for simulation
const mockProjects: Project[] = [
  {
    id: "1",
    title: "Create E-book: React Guide",
    description: "A complete guide to React for beginners",
    progress: 65,
    status: "in_progress",
    deadline: "2023-07-15",
    tasks: 12,
    completedTasks: 8,
    createdAt: "2023-01-15T10:00:00Z",
    updatedAt: "2023-06-30T15:30:00Z"
  },
  {
    id: "2",
    title: "TypeScript Course",
    description: "Introductory course on TypeScript",
    progress: 30,
    status: "in_progress",
    deadline: "2023-08-20",
    tasks: 18,
    completedTasks: 5,
    createdAt: "2023-02-20T09:15:00Z",
    updatedAt: "2023-06-25T14:20:00Z"
  },
  {
    id: "3",
    title: "Video Series: Advanced CSS",
    description: "A series of videos exploring advanced CSS techniques",
    progress: 100,
    status: "completed",
    deadline: "2023-05-10",
    tasks: 8,
    completedTasks: 8,
    createdAt: "2023-03-05T11:30:00Z",
    updatedAt: "2023-05-10T16:45:00Z"
  },
  {
    id: "4",
    title: "Weekly Newsletter",
    description: "Create a newsletter with development tips",
    progress: 10,
    status: "in_progress",
    deadline: "2023-09-01",
    tasks: 16,
    completedTasks: 2,
    createdAt: "2023-04-10T08:45:00Z",
    updatedAt: "2023-06-28T13:10:00Z"
  },
  {
    id: "5",
    title: "NextJS Workshop",
    description: "Prepare and conduct an online workshop on NextJS",
    progress: 45,
    status: "in_progress",
    deadline: "2023-07-30",
    tasks: 20,
    completedTasks: 9,
    createdAt: "2023-05-15T10:20:00Z",
    updatedAt: "2023-06-29T15:40:00Z"
  },
  {
    id: "6",
    title: "Podcast: Tech Career",
    description: "Podcast series about careers in technology",
    progress: 0,
    status: "paused",
    deadline: "2023-10-15",
    tasks: 15,
    completedTasks: 0,
    createdAt: "2023-06-01T09:30:00Z",
    updatedAt: "2023-06-15T14:50:00Z"
  }
];

// In-memory database
const db = new Map<string, Project>();

// Initialize with mock data
mockProjects.forEach(project => {
  db.set(project.id, project);
});

// Service for CRUD operations on projects
export const projectService = {
  // Get all projects
  async getAllProjects(): Promise<Project[]> {
    try {
      return Array.from(db.values());
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },

  // Get projects by status
  async getProjectsByStatus(status: string): Promise<Project[]> {
    try {
      return Array.from(db.values()).filter(project => project.status === status);
    } catch (error) {
      console.error(`Error fetching projects with status ${status}:`, error);
      throw error;
    }
  },

  // Get a project by ID
  async getProjectById(id: string): Promise<Project | null> {
    try {
      const project = db.get(id);
      return project || null;
    } catch (error) {
      console.error(`Error fetching project ${id}:`, error);
      throw error;
    }
  },

  // Create a new project
  async createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    try {
      const id = uuidv4();
      const now = new Date().toISOString();
      
      const newProject: Project = {
        id,
        ...projectData,
        createdAt: now,
        updatedAt: now
      };
      
      db.set(id, newProject);
      return newProject;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  // Update an existing project
  async updateProject(id: string, projectData: Partial<Project>): Promise<Project | null> {
    try {
      const existingProject = db.get(id);
      
      if (!existingProject) {
        return null;
      }
      
      const now = new Date().toISOString();
      
      const updatedProject: Project = {
        ...existingProject,
        ...projectData,
        updatedAt: now
      };
      
      db.set(id, updatedProject);
      return updatedProject;
    } catch (error) {
      console.error(`Error updating project ${id}:`, error);
      throw error;
    }
  },

  // Update project progress
  async updateProjectProgress(id: string, completedTasks: number): Promise<Project | null> {
    try {
      const project = db.get(id);
      
      if (!project) {
        return null;
      }
      
      const progress = project.tasks > 0 
        ? Math.round((completedTasks / project.tasks) * 100)
        : 0;
      
      return this.updateProject(id, { 
        completedTasks, 
        progress,
        status: progress === 100 ? 'completed' : project.status
      });
    } catch (error) {
      console.error(`Error updating project progress ${id}:`, error);
      throw error;
    }
  },

  // Delete a project
  async deleteProject(id: string): Promise<boolean> {
    try {
      return db.delete(id);
    } catch (error) {
      console.error(`Error deleting project ${id}:`, error);
      throw error;
    }
  }
};

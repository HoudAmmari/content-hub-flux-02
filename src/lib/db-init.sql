
-- Criação da tabela de canais
CREATE TABLE IF NOT EXISTS channels (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    "createdAt" TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP NOT NULL
);

-- Criação da tabela de conteúdos
CREATE TABLE IF NOT EXISTS contents (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    channel VARCHAR(50) NOT NULL,
    tags TEXT[] DEFAULT '{}',
    "dueDate" DATE NOT NULL,
    "createdAt" TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP NOT NULL
);

-- Criação da tabela de projetos
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    progress INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL,
    deadline DATE NOT NULL,
    tasks INTEGER NOT NULL DEFAULT 0,
    "completedTasks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP NOT NULL
);

-- Criação da tabela de tarefas
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY,
    "projectId" UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    "dueDate" DATE NOT NULL,
    "createdAt" TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP NOT NULL
);

-- Inserção de dados iniciais de canais
INSERT INTO channels (id, name, description, "createdAt", "updatedAt")
VALUES 
    ('550e8400-e29b-41d4-a716-446655440000', 'Blog', 'Artigos para o blog', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440001', 'Vídeos Curtos', 'Conteúdo para Instagram e TikTok', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440002', 'YouTube', 'Vídeos longos para o canal do YouTube', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440003', 'LinkedIn', 'Posts profissionais para o LinkedIn', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

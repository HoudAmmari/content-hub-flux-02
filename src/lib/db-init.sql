
-- Criação da tabela de canais
CREATE TABLE IF NOT EXISTS channels (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    statuses JSONB DEFAULT '["backlog", "in_progress", "pending", "done"]',
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
    "isEpic" BOOLEAN DEFAULT FALSE,
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
INSERT INTO channels (id, name, description, statuses, "createdAt", "updatedAt")
VALUES 
    ('550e8400-e29b-41d4-a716-446655440000', 'Blog', 'Artigos para o blog', '["backlog", "writing", "review", "done"]', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440001', 'Vídeos Curtos', 'Conteúdo para Instagram e TikTok', '["backlog", "script", "recording", "editing", "done"]', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440002', 'YouTube', 'Vídeos longos para o canal do YouTube', '["backlog", "research", "script", "recording", "editing", "done"]', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440003', 'LinkedIn', 'Posts profissionais para o LinkedIn', '["backlog", "draft", "review", "done"]', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Inserção de dados iniciais de conteúdos (incluindo épicos para o YouTube)
INSERT INTO contents (id, title, description, status, channel, tags, "dueDate", "isEpic", "createdAt", "updatedAt")
VALUES
    ('650e8400-e29b-41d4-a716-446655440001', 'Como criar um blog eficiente', 'Dicas práticas para manter um blog atualizado e relevante', 'backlog', 'blog', ARRAY['escrita', 'conteúdo', 'dicas'], '2023-06-25', FALSE, NOW(), NOW()),
    ('650e8400-e29b-41d4-a716-446655440002', 'Tendências de React em 2023', 'Um overview das principais novidades do React', 'writing', 'blog', ARRAY['react', 'frontend', 'javascript'], '2023-06-28', FALSE, NOW(), NOW()),
    ('650e8400-e29b-41d4-a716-446655440003', 'Dicas de produtividade para dev', 'Como organizar seu tempo e entregar mais', 'review', 'blog', ARRAY['produtividade', 'carreira'], '2023-06-22', FALSE, NOW(), NOW()),
    ('650e8400-e29b-41d4-a716-446655440004', 'Tour pelo meu setup', 'Mostrando meu ambiente de trabalho', 'backlog', 'youtube', ARRAY['setup', 'hardware'], '2023-06-30', FALSE, NOW(), NOW()),
    ('650e8400-e29b-41d4-a716-446655440005', 'Explicando Hooks em 60s', 'Guia rápido sobre React Hooks', 'script', 'videos', ARRAY['react', 'tutorial', 'rápido'], '2023-06-23', FALSE, NOW(), NOW()),
    ('650e8400-e29b-41d4-a716-446655440006', 'Vagas em tecnologia', 'Como está o mercado de trabalho atualmente', 'done', 'linkedin', ARRAY['carreira', 'mercado'], '2023-06-18', FALSE, NOW(), NOW()),
    ('650e8400-e29b-41d4-a716-446655440007', 'Clean Code em 5 passos', 'Princípios básicos para escrever código limpo', 'done', 'videos', ARRAY['código', 'boas práticas'], '2023-06-15', FALSE, NOW(), NOW()),
    -- Épicos para o YouTube (plano editorial anual)
    ('650e8400-e29b-41d4-a716-446655440008', 'Série: Fundamentos de React', 'Uma série completa cobrindo todos os fundamentos do React moderno', 'backlog', 'youtube', ARRAY['react', 'série', 'fundamentos'], '2023-07-30', TRUE, NOW(), NOW()),
    ('650e8400-e29b-41d4-a716-446655440009', 'Série: TypeScript para JS devs', 'Como migrar do JavaScript para o TypeScript', 'backlog', 'youtube', ARRAY['typescript', 'javascript', 'série'], '2023-08-25', TRUE, NOW(), NOW()),
    ('650e8400-e29b-41d4-a716-446655440010', 'Série: Backend com Node.js', 'Desenvolvimento de APIs REST com Node.js', 'backlog', 'youtube', ARRAY['node', 'backend', 'api'], '2023-09-15', TRUE, NOW(), NOW()),
    ('650e8400-e29b-41d4-a716-446655440011', 'Série: Frameworks Front-end', 'Comparações entre React, Vue, Angular e Svelte', 'backlog', 'youtube', ARRAY['frameworks', 'frontend', 'comparação'], '2023-10-10', TRUE, NOW(), NOW()),
    ('650e8400-e29b-41d4-a716-446655440012', 'Série: APIs de Inteligência Artificial', 'Como integrar IAs em seus projetos', 'backlog', 'youtube', ARRAY['ia', 'api', 'integração'], '2023-11-05', TRUE, NOW(), NOW()),
    ('650e8400-e29b-41d4-a716-446655440013', 'Série: DevOps para desenvolvedores', 'Entendendo pipelines CI/CD e infraestrutura como código', 'backlog', 'youtube', ARRAY['devops', 'ci/cd', 'infraestrutura'], '2023-12-01', TRUE, NOW(), NOW()),
    ('650e8400-e29b-41d4-a716-446655440014', 'Série: Web Performance', 'Otimizando a performance de aplicações web', 'backlog', 'youtube', ARRAY['performance', 'otimização', 'web'], '2024-01-15', TRUE, NOW(), NOW()),
    ('650e8400-e29b-41d4-a716-446655440015', 'Série: Segurança em aplicações web', 'Protegendo suas aplicações contra vulnerabilidades comuns', 'backlog', 'youtube', ARRAY['segurança', 'vulnerabilidades', 'proteção'], '2024-02-10', TRUE, NOW(), NOW()),
    ('650e8400-e29b-41d4-a716-446655440016', 'Série: Arquitetura de software', 'Padrões e práticas para software escalável', 'backlog', 'youtube', ARRAY['arquitetura', 'padrões', 'escalabilidade'], '2024-03-05', TRUE, NOW(), NOW()),
    ('650e8400-e29b-41d4-a716-446655440017', 'Série: Testes automatizados', 'Implementando testes unitários, de integração e E2E', 'backlog', 'youtube', ARRAY['testes', 'automação', 'qualidade'], '2024-04-01', TRUE, NOW(), NOW()),
    ('650e8400-e29b-41d4-a716-446655440018', 'Série: Design System', 'Criando e mantendo um design system', 'backlog', 'youtube', ARRAY['design', 'ui', 'componentes'], '2024-05-15', TRUE, NOW(), NOW()),
    ('650e8400-e29b-41d4-a716-446655440019', 'Série: Tendências em desenvolvimento', 'O que esperar da tecnologia nos próximos anos', 'backlog', 'youtube', ARRAY['tendências', 'futuro', 'tecnologia'], '2024-06-10', TRUE, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

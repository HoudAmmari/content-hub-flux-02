
-- Criação da tabela de notícias
CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY,
  source VARCHAR(255) NOT NULL,
  summarized_title TEXT NOT NULL,
  summary TEXT NOT NULL,
  url TEXT NOT NULL,
  selected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir dados de exemplo para testes
INSERT INTO news (id, source, summarized_title, summary, url, selected, created_at, updated_at)
VALUES 
  ('9b3c9fde-1f4e-4b9a-b262-123456789abc', 'TechCrunch', 'Nova IA da Google supera benchmarks', 'A Google anunciou hoje uma nova IA generativa que superou todos os benchmarks anteriores em tarefas de processamento de linguagem natural.', 'https://techcrunch.com/example1', false, NOW(), NOW()),
  ('8a2b8ecd-0e3d-3a8b-a151-987654321def', 'Wired', 'Tesla apresenta novo modelo de bateria', 'A Tesla revelou um novo modelo de bateria que promete aumentar a autonomia dos carros elétricos em até 50%.', 'https://wired.com/example2', false, NOW(), NOW()),
  ('7c1a7dcb-9d2c-2a7c-b040-456789123ghi', 'The Verge', 'Apple anuncia MacBook com novo chip', 'A Apple anunciou o novo MacBook Pro equipado com o chip M3, prometendo melhorias significativas de desempenho.', 'https://theverge.com/example3', false, NOW(), NOW()),
  ('6d0b6cab-8c1b-1b6d-a939-345678912jkl', 'CNBC', 'Microsoft adquire startup de IA', 'A Microsoft anunciou a aquisição de uma startup de IA por 2 bilhões de dólares para impulsionar suas capacidades em automação.', 'https://cnbc.com/example4', false, NOW(), NOW());

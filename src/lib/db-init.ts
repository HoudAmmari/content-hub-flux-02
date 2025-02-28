
import { pool } from './db';
import fs from 'fs';
import path from 'path';

// Função para inicializar o banco de dados
export async function initDatabase() {
  try {
    console.log('Inicializando banco de dados...');
    
    // Ler o arquivo SQL de inicialização
    const sqlPath = path.join(__dirname, 'db-init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Executar o script SQL
    await pool.query(sql);
    
    console.log('Banco de dados inicializado com sucesso!');
  } catch (error) {
    console.error('Erro ao inicializar o banco de dados:', error);
    throw error;
  }
}

// Se este arquivo for executado diretamente, inicializar o banco de dados
if (require.main === module) {
  initDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

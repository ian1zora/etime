require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  let connection;
  
  try {
    // Conectar sin especificar base de datos
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || ''
    });
    
    console.log('✅ Conectado a MySQL');
    
    // Leer el archivo schema.sql
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Dividir el schema en comandos individuales
    const commands = schema
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📋 Ejecutando ${commands.length} comandos SQL...`);
    
    // Ejecutar cada comando
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.trim()) {
        try {
          await connection.execute(command);
          console.log(`✅ Comando ${i + 1}/${commands.length} ejecutado`);
        } catch (error) {
          if (!error.message.includes('already exists')) {
            console.error(`❌ Error en comando ${i + 1}:`, error.message);
          }
        }
      }
    }
    
    console.log('🎉 Base de datos configurada correctamente');
    
    // Verificar que se crearon los datos
    await connection.execute('USE restaurante');
    const [productos] = await connection.execute('SELECT COUNT(*) as count FROM producto');
    const [categorias] = await connection.execute('SELECT COUNT(*) as count FROM categoria');
    
    console.log(`📦 Productos creados: ${productos[0].count}`);
    console.log(`📂 Categorías creadas: ${categorias[0].count}`);
    
  } catch (error) {
    console.error('❌ Error configurando la base de datos:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();
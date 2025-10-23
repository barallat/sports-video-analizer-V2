#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuraciones disponibles
const availableSports = ['multi', 'basketball', 'tennis', 'football', 'volleyball', 'track-field'];

function showHelp() {
  console.log(`
🏀 Sports Video Analyzer - Configurador de Deportes

Uso: node scripts/switch-sport.js <deporte>

Deportes disponibles:
${availableSports.map(sport => `  - ${sport}`).join('\n')}

Ejemplos:
  node scripts/switch-sport.js basketball
  node scripts/switch-sport.js tennis
  node scripts/switch-sport.js football
  node scripts/switch-sport.js volleyball
  node scripts/switch-sport.js track-field
  node scripts/switch-sport.js multi

Comandos adicionales:
  node scripts/switch-sport.js list    - Listar deportes disponibles
  node scripts/switch-sport.js help    - Mostrar esta ayuda
  `);
}

function listSports() {
  console.log('🏀 Deportes disponibles:');
  availableSports.forEach(sport => {
    console.log(`  - ${sport}`);
  });
}

function switchSport(sport) {
  if (!availableSports.includes(sport)) {
    console.error(`❌ Error: Deporte "${sport}" no encontrado.`);
    console.log('Deportes disponibles:', availableSports.join(', '));
    process.exit(1);
  }

  const envFile = path.join(__dirname, '..', `env.${sport}`);
  const targetFile = path.join(__dirname, '..', '.env');

  if (!fs.existsSync(envFile)) {
    console.error(`❌ Error: Archivo de configuración "${envFile}" no encontrado.`);
    process.exit(1);
  }

  try {
    // Copiar archivo de configuración
    fs.copyFileSync(envFile, targetFile);
    
    console.log(`✅ Configuración cambiada a: ${sport}`);
    console.log(`📁 Archivo copiado: ${envFile} → ${targetFile}`);
    
    // Mostrar contenido del archivo
    const content = fs.readFileSync(targetFile, 'utf8');
    console.log('\n📋 Configuración actual:');
    console.log(content);
    
    console.log('\n🚀 Para aplicar los cambios:');
    console.log(`  npm run dev:${sport}`);
    console.log(`  npm run build:${sport}`);
    
  } catch (error) {
    console.error('❌ Error al cambiar configuración:', error.message);
    process.exit(1);
  }
}

// Procesar argumentos
const args = process.argv.slice(2);

if (args.length === 0) {
  showHelp();
  process.exit(0);
}

const command = args[0];

switch (command) {
  case 'help':
  case '--help':
  case '-h':
    showHelp();
    break;
    
  case 'list':
  case '--list':
  case '-l':
    listSports();
    break;
    
  default:
    switchSport(command);
    break;
} 
const fs = require('fs');
const path = require('path');

// Mapa de reemplazos de colores estáticos a colores dinámicos
const colorReplacements = {
  // Fondos
  '#f8fafc': 'colors.background',
  '#ffffff': 'colors.card',
  '#111827': 'colors.card',
  '#1e293b': 'colors.sectionBackground',
  '#0f172a': 'colors.background',
  
  // Textos
  '#0f172a': 'colors.text',
  '#f8fafc': 'colors.text',
  '#64748b': 'colors.mutedText',
  '#94a3b8': 'colors.mutedText',
  '#475569': 'colors.mutedText',
  
  // Bordes
  '#e2e8f0': 'colors.border',
  '#e5e7eb': 'colors.border',
  '#334155': 'colors.border',
  
  // Botones y acciones
  '#0891b2': 'colors.primary',
  '#f1f5f9': 'colors.tagBackground',
  
  // Estados médicos
  '#ef4444': 'colors.scoreLow',
  '#f97316': 'colors.scoreMedium', 
  '#eab308': 'colors.scoreGood',
  '#22c55e': 'colors.scoreExcellent',
  '#15803d': 'colors.scoreOptimal',
};

// Función para procesar un archivo
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Agregar import del hook si no existe
    if (!content.includes('useScaleStyles') && !content.includes('useThemedStyles')) {
      content = content.replace(
        /import.*from 'react-native';/,
        `$&\nimport { useScaleStyles } from '@/hooks/useScaleStyles';`
      );
      modified = true;
    }

    // Agregar el hook en el componente principal
    if (!content.includes('const { styles, colors }') && !content.includes('const { colors, isDark }')) {
      const componentMatch = content.match(/export default function (\w+)/);
      if (componentMatch) {
        const componentName = componentMatch[1];
        content = content.replace(
          new RegExp(`export default function ${componentName}\\(\\) \\{`),
          `export default function ${componentName}() {\n  const { styles, colors } = useScaleStyles();`
        );
        modified = true;
      }
    }

    // Reemplazar colores hardcodeados
    for (const [oldColor, newColor] of Object.entries(colorReplacements)) {
      const regex = new RegExp(`['"]${oldColor.replace('#', '\\#')}['"]`, 'g');
      if (content.match(regex)) {
        content = content.replace(regex, newColor);
        modified = true;
      }
    }

    // Guardar solo si hubo modificaciones
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Migrado: ${filePath}`);
      return true;
    } else {
      console.log(`⏭️  Sin cambios: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
    return false;
  }
}

// Función principal
function migrateThemes() {
  const scalesDir = path.join(__dirname, '../app/(tabs)/scales');
  
  if (!fs.existsSync(scalesDir)) {
    console.error('❌ Directorio de escalas no encontrado:', scalesDir);
    return;
  }

  const files = fs.readdirSync(scalesDir).filter(file => file.endsWith('.tsx'));
  
  console.log(`🔄 Migrando ${files.length} archivos de escalas...`);
  
  let migratedCount = 0;
  for (const file of files) {
    const filePath = path.join(scalesDir, file);
    if (processFile(filePath)) {
      migratedCount++;
    }
  }

  console.log(`\n✨ Migración completada: ${migratedCount}/${files.length} archivos modificados`);
}

// Ejecutar si se llama directamente
if (require.main === module) {
  migrateThemes();
}

module.exports = { migrateThemes, processFile };

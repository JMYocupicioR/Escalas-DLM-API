const fs = require('fs');
const path = require('path');

// SVG del icono como string
const iconSvg = `<svg width="200" height="200" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0891b2;" />
      <stop offset="100%" style="stop-color:#06b6d4;" />
    </linearGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="3" stdDeviation="2" flood-color="#000000" flood-opacity="0.2"/>
    </filter>
  </defs>
  <g style="filter: url(#softShadow);">
    <circle cx="50" cy="50" r="40" fill="url(#iconGradient)"/>
    <circle cx="50" cy="50" r="35" fill="none" stroke="white" stroke-opacity="0.2" stroke-width="1.5"/>
    <path d="M32 50 L45 63 L68 40" fill="none" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;

// Crear directorio assets/images si no existe
const assetsDir = path.join(__dirname, '..', 'assets', 'images');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Generar archivo SVG optimizado
const optimizedSvg = iconSvg.replace(/width="200" height="200"/, 'width="1024" height="1024"');

// Escribir el SVG base
fs.writeFileSync(path.join(assetsDir, 'icon.svg'), optimizedSvg);

// Para generar PNGs, necesitarías usar sharp o canvas
// Por ahora, crearemos los SVGs optimizados para diferentes tamaños

const sizes = [
  { name: 'icon', size: 1024 },
  { name: 'favicon', size: 32 },
  { name: 'icon-192', size: 192 },
  { name: 'icon-512', size: 512 }
];

sizes.forEach(({ name, size }) => {
  const svg = iconSvg
    .replace(/width="200" height="200"/, `width="${size}" height="${size}"`)
    .replace(/viewBox="0 0 100 100"/, `viewBox="0 0 100 100"`);
  
  fs.writeFileSync(path.join(assetsDir, `${name}.svg`), svg);
});

// Crear un HTML simple para convertir SVG a PNG manualmente
const converterHtml = `<!DOCTYPE html>
<html>
<head>
    <title>Icon Converter</title>
    <style>
        body { margin: 20px; font-family: Arial, sans-serif; }
        .icon-container { margin: 20px; display: inline-block; text-align: center; }
        canvas { border: 1px solid #ccc; }
    </style>
</head>
<body>
    <h1>DeepLuxMed Icon Converter</h1>
    <p>Use este archivo para convertir el SVG a PNG. Clic derecho en cada canvas → "Guardar imagen como"</p>
    
    ${sizes.map(({ name, size }) => `
    <div class="icon-container">
        <h3>${name} (${size}x${size})</h3>
        <canvas id="${name}" width="${size}" height="${size}"></canvas>
    </div>
    `).join('')}

    <script>
        const svg = \`${iconSvg.replace(/width="200" height="200"/, 'width="100" height="100"')}\`;
        
        ${sizes.map(({ name, size }) => `
        // ${name}
        const canvas${name} = document.getElementById('${name}');
        const ctx${name} = canvas${name}.getContext('2d');
        const img${name} = new Image();
        const svg${name} = svg.replace(/width="100" height="100"/, 'width="${size}" height="${size}"');
        const blob${name} = new Blob([svg${name}], {type: 'image/svg+xml'});
        const url${name} = URL.createObjectURL(blob${name});
        img${name}.onload = () => {
            ctx${name}.drawImage(img${name}, 0, 0, ${size}, ${size});
            URL.revokeObjectURL(url${name});
        };
        img${name}.src = url${name};
        `).join('\n')}
    </script>
</body>
</html>`;

fs.writeFileSync(path.join(assetsDir, 'icon-converter.html'), converterHtml);

console.log('✅ Archivos de icono generados en assets/images/');
console.log('📝 Abrir assets/images/icon-converter.html para generar archivos PNG');
console.log('💡 Alternativamente, usar el SVG directamente o herramientas como Inkscape/Figma');
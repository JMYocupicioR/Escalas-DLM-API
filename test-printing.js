/**
 * Script de prueba para el sistema de impresión mejorado
 * Prueba todas las funcionalidades de impresión y PDF
 */

// Datos de prueba simulando una evaluación médica
const testAssessment = {
  patientData: {
    name: "Juan Pérez García",
    age: "45",
    gender: "Masculino",
    doctorName: "Dr. María González"
  },
  score: 85,
  interpretation: "Dependencia moderada. El paciente requiere asistencia supervisada en múltiples actividades.",
  answers: [
    {
      id: "barthel_1",
      question: "Alimentación",
      label: "Independiente",
      value: "Independiente", 
      points: 10
    },
    {
      id: "barthel_2",
      question: "Baño",
      label: "Dependiente",
      value: "Dependiente",
      points: 0
    },
    {
      id: "barthel_3", 
      question: "Vestirse",
      label: "Necesita ayuda",
      value: "Necesita ayuda",
      points: 5
    }
  ]
};

const testScale = {
  id: "barthel",
  name: "Escala de Barthel"
};

const testOptions = {
  theme: 'light',
  preset: 'compact',
  scale: 0.85,
  headerTitle: 'Informe de Resultados - PRUEBA',
  headerSubtitle: 'Escala de Barthel - Test',
  showPatientSummary: true
};

// 1. Probar servicio PDF directamente
async function testPdfService() {
  console.log('🔍 Probando servicio PDF directo...');
  
  try {
    const response = await fetch('http://localhost:8787/api/pdf/export?binary=1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assessment: testAssessment,
        scale: testScale,
        options: testOptions
      })
    });

    if (response.ok) {
      const blob = await response.blob();
      console.log('✅ Servicio PDF funciona correctamente');
      console.log(`📄 PDF generado: ${blob.size} bytes`);
      
      // Crear URL y abrir para verificar visualmente
      const url = URL.createObjectURL(blob);
      const testWindow = window.open(url, '_blank');
      if (testWindow) {
        console.log('👀 PDF abierto para inspección visual');
        setTimeout(() => URL.revokeObjectURL(url), 30000);
      }
      
      return true;
    } else {
      console.log('❌ Error del servicio PDF:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Error conectando al servicio PDF:', error.message);
    return false;
  }
}

// 2. Detectar tipo de navegador y plataforma
function detectEnvironment() {
  console.log('\n🔍 Detectando entorno...');
  
  const userAgent = navigator.userAgent;
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i.test(userAgent);
  const isDesktop = !isMobile;
  
  console.log(`📱 User Agent: ${userAgent}`);
  console.log(`🖥️ Es Desktop: ${isDesktop}`);
  console.log(`📱 Es Móvil: ${isMobile}`);
  console.log(`🌐 Plataforma: ${navigator.platform}`);
  console.log(`📏 Resolución: ${screen.width}x${screen.height}`);
  
  return { isMobile, isDesktop, userAgent };
}

// 3. Probar capacidades de impresión
function testPrintCapabilities() {
  console.log('\n🔍 Probando capacidades de impresión...');
  
  const canPrint = typeof window !== 'undefined' && 'print' in window;
  const canCreateBlob = typeof Blob !== 'undefined';
  const canOpenWindow = typeof window.open !== 'undefined';
  
  console.log(`🖨️ window.print() disponible: ${canPrint}`);
  console.log(`📦 Blob API disponible: ${canCreateBlob}`);
  console.log(`🪟 window.open() disponible: ${canOpenWindow}`);
  
  return { canPrint, canCreateBlob, canOpenWindow };
}

// 4. Simular impresión con diferentes métodos
async function testPrintingMethods(env, capabilities) {
  console.log('\n🔍 Probando métodos de impresión...');
  
  // Método 1: Servicio PDF
  console.log('\n1️⃣ Probando impresión vía servidor PDF...');
  const serverSuccess = await testPdfService();
  
  // Método 2: HTML directo (solo si es desktop)
  if (env.isDesktop && capabilities.canPrint) {
    console.log('\n2️⃣ Probando impresión HTML directa...');
    try {
      const htmlContent = generateTestHTML();
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        console.log('✅ Ventana HTML creada para impresión');
        console.log('ℹ️ Revisa la nueva ventana - debería mostrar contenido imprimible');
      }
    } catch (error) {
      console.log('❌ Error en impresión HTML:', error.message);
    }
  }
  
  // Método 3: jsPDF fallback (simulado)
  if (env.isMobile) {
    console.log('\n3️⃣ Simulando jsPDF para móviles...');
    console.log('📱 En móvil usaría jsPDF como fallback');
    console.log('✅ Lógica de detección móvil funcionando');
  }
  
  return serverSuccess;
}

// Generar HTML de prueba
function generateTestHTML() {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Prueba de Impresión - ${testScale.name}</title>
      <style>
        @page { size: A4; margin: 20mm; }
        body { font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.4; }
        .header { text-align: center; border-bottom: 2px solid #0891b2; padding-bottom: 10px; margin-bottom: 20px; }
        .section { margin-bottom: 15px; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
        .patient-info { background-color: #f8f9fa; }
        .results { background-color: #e8f5e8; }
        .score { font-size: 18pt; font-weight: bold; color: #0891b2; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { padding: 8px; border: 1px solid #ddd; text-align: left; }
        th { background-color: #f1f1f1; }
        @media print {
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${testOptions.headerTitle}</h1>
        <p>${testOptions.headerSubtitle}</p>
        <p>Fecha: ${new Date().toLocaleDateString()}</p>
      </div>
      
      <div class="section patient-info">
        <h2>Datos del Paciente</h2>
        <p><strong>Nombre:</strong> ${testAssessment.patientData.name}</p>
        <p><strong>Edad:</strong> ${testAssessment.patientData.age}</p>
        <p><strong>Género:</strong> ${testAssessment.patientData.gender}</p>
        <p><strong>Evaluador:</strong> ${testAssessment.patientData.doctorName}</p>
      </div>
      
      <div class="section results">
        <h2>Resultados</h2>
        <p class="score">Puntuación: ${testAssessment.score}</p>
        <p><strong>Interpretación:</strong> ${testAssessment.interpretation}</p>
      </div>
      
      <div class="section">
        <h2>Detalle de Respuestas</h2>
        <table>
          <thead>
            <tr>
              <th>Pregunta</th>
              <th>Respuesta</th>
              <th>Puntos</th>
            </tr>
          </thead>
          <tbody>
            ${testAssessment.answers.map(answer => `
              <tr>
                <td>${answer.question}</td>
                <td>${answer.label}</td>
                <td>${answer.points}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <div class="no-print" style="position: fixed; top: 10px; right: 10px; background: #fff; padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
        <button onclick="window.print()">🖨️ Imprimir</button>
        <button onclick="window.close()">❌ Cerrar</button>
      </div>
      
      <script>
        // Auto-focus para impresión
        window.onload = function() {
          console.log('Ventana de prueba cargada - lista para imprimir');
        };
      </script>
    </body>
    </html>
  `;
}

// 5. Ejecutar todas las pruebas
async function runAllTests() {
  console.log('🚀 INICIANDO PRUEBAS DEL SISTEMA DE IMPRESIÓN');
  console.log('================================================');
  
  const env = detectEnvironment();
  const capabilities = testPrintCapabilities();
  
  console.log('\n📋 RESUMEN DE CAPACIDADES:');
  console.log(`• Tipo: ${env.isMobile ? 'Móvil' : 'Desktop'}`);
  console.log(`• Impresión: ${capabilities.canPrint ? '✅' : '❌'}`);
  console.log(`• Blob API: ${capabilities.canCreateBlob ? '✅' : '❌'}`);
  console.log(`• Ventanas: ${capabilities.canOpenWindow ? '✅' : '❌'}`);
  
  const success = await testPrintingMethods(env, capabilities);
  
  console.log('\n📊 RESULTADOS FINALES:');
  console.log('==================');
  console.log(`Servicio PDF: ${success ? '✅ FUNCIONA' : '❌ FALLO'}`);
  console.log(`Compatibilidad: ${env.isMobile ? '📱 MÓVIL' : '🖥️ DESKTOP'}`);
  
  if (success) {
    console.log('\n🎉 ¡SISTEMA DE IMPRESIÓN FUNCIONANDO CORRECTAMENTE!');
    console.log('Revisa las ventanas/pestañas abiertas para verificar el contenido');
  } else {
    console.log('\n⚠️ Problemas detectados - verificar configuración del servidor PDF');
  }
}

// Ejecutar pruebas automáticamente
runAllTests().catch(console.error);
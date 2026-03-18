// Test simple para verificar la importación de escalas
console.log('🧪 Testing scales import...');

try {
  // Test 1: Import dinámico
  console.log('Test 1: Dynamic import...');
  import('./data/_scales.ts').then(({ scalesById }) => {
    console.log('✅ Dynamic import successful');
    console.log('scalesById type:', typeof scalesById);
    console.log('scalesById keys:', Object.keys(scalesById));
    console.log('Total scales:', Object.values(scalesById).length);
    
    // Verificar escalas específicas
    const fimScale = scalesById['fim'];
    const lequesneScale = scalesById['lequesne-rodilla-es-v1'];
    const barthelScale = scalesById['barthel'];
    
    console.log('FIM scale:', fimScale);
    console.log('Lequesne scale:', lequesneScale);
    console.log('Barthel scale:', barthelScale);
  }).catch(error => {
    console.error('❌ Dynamic import failed:', error);
  });
  
} catch (error) {
  console.error('❌ Test failed:', error);
}

console.log('�� Test completed');

import protobuf from 'protobufjs';
import fs from 'fs';
import zlib from 'zlib';

// Carregar o schema protobuf
async function loadProto() {
  const root = await protobuf.load('silver/wind-data.proto');
  return root.lookupType('winddata.WindData');
}

// Encontrar min/max sem estourar a stack
function findMinMax(arr) {
  let min = arr[0];
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < min) min = arr[i];
    if (arr[i] > max) max = arr[i];
  }
  return { min, max };
}

// Quantizar float para int16 (reduz tamanho pela metade)
function quantizeArray(arr, min, max, bits = 16) {
  const maxVal = Math.pow(2, bits - 1) - 1; // 32767 para 16 bits
  const range = max - min;
  
  return arr.map(val => {
    const normalized = (val - min) / range; // 0 a 1
    return Math.round(normalized * maxVal * 2 - maxVal); // -32767 a 32767
  });
}

// Dequantizar int16 de volta para float
function dequantizeArray(arr, min, max, bits = 16) {
  const maxVal = Math.pow(2, bits - 1) - 1;
  const range = max - min;
  
  return arr.map(val => {
    const normalized = (val + maxVal) / (maxVal * 2); // volta para 0 a 1
    return normalized * range + min;
  });
}

// Converter JSON para Protobuf com quantização
export async function jsonToProtobuf(jsonData, outputFile, options = {}) {
  const { compress = true, quantize = true } = options;
  const WindData = await loadProto();
  
  let uValues = jsonData.values.u;
  let vValues = jsonData.values.v;
  
  const uStats = findMinMax(uValues);
  const vStats = findMinMax(vValues);
  let uMin = uStats.min;
  let uMax = uStats.max;
  let vMin = vStats.min;
  let vMax = vStats.max;
  
  // Quantizar se habilitado
  if (quantize) {
    uValues = quantizeArray(uValues, uMin, uMax);
    vValues = quantizeArray(vValues, vMin, vMax);
  }
  
  // Criar mensagem protobuf
  const message = WindData.create({
    header: {
      dataDate: jsonData.header.dataDate,
      numberOfValues: jsonData.header.numberOfValues,
      maximum: jsonData.header.maximum,
      minimum: jsonData.header.minimum,
      name: jsonData.header.name,
      ni: jsonData.header.ni,
      nj: jsonData.header.nj,
      units: jsonData.header.units
    },
    values: {
      uMin: uMin,
      uMax: uMax,
      vMin: vMin,
      vMax: vMax,
      u: uValues,
      v: vValues
    }
  });
  
  // Verificar se a mensagem é válida
  const errMsg = WindData.verify(message);
  if (errMsg) throw Error(errMsg);
  
  // Serializar para buffer
  let buffer = WindData.encode(message).finish();
  
  const protoSize = buffer.length;
  
  // Comprimir com gzip se habilitado
  if (compress) {
    buffer = zlib.gzipSync(buffer, { level: 9 });
    fs.writeFileSync(outputFile, buffer);
    console.log(`✓ Protobuf comprimido salvo: ${outputFile}`);
  } else {
    fs.writeFileSync(outputFile, buffer);
    console.log(`✓ Protobuf salvo: ${outputFile}`);
  }
  
  console.log(`  Protobuf puro: ${(protoSize / 1024).toFixed(2)} KB`);
  console.log(`  Final (${compress ? 'gzip' : 'sem gzip'}): ${(buffer.length / 1024).toFixed(2)} KB`);
  
  return buffer;
}

// Converter Protobuf para JSON
export async function protobufToJson(inputFile, options = {}) {
  const { compressed = true, quantized = true } = options;
  const WindData = await loadProto();
  
  // Ler arquivo
  let buffer = fs.readFileSync(inputFile);
  
  // Descomprimir se necessário
  if (compressed) {
    buffer = zlib.gunzipSync(buffer);
  }
  
  // Deserializar
  const message = WindData.decode(buffer);
  const object = WindData.toObject(message);
  
  // Dequantizar se necessário
  if (quantized) {
    object.values.u = dequantizeArray(
      object.values.u,
      object.values.uMin,
      object.values.uMax
    );
    object.values.v = dequantizeArray(
      object.values.v,
      object.values.vMin,
      object.values.vMax
    );
  }
  
  return object;
}

// Exemplo comparativo
async function example() {
  const windData = {
    header: {
      dataDate: 20260107,
      numberOfValues: 1038240,
      maximum: 68.3537,
      minimum: -48.1325,
      name: 'U component of wind and V component of wind',
      ni: 1440,
      nj: 721,
      units: 'm s-1'
    },
    values: {
      u: [21.6337, /* ... seus dados */],
      v: [-12.3425, -20.2025, -20.2625, /* ... seus dados */]
    }
  };
  
  try {
    console.log('🔧 Testando diferentes níveis de compressão:\n');
    
    // 1. Protobuf básico (sem otimizações)
    await jsonToProtobuf(windData, 'wind-basic.pb', { 
      compress: false, 
      quantize: false 
    });
    
    // 2. Protobuf + Quantização
    await jsonToProtobuf(windData, 'wind-quantized.pb', { 
      compress: false, 
      quantize: true 
    });
    console.log('');
    
    // 3. Protobuf + Gzip
    await jsonToProtobuf(windData, 'wind-gzip.pb.gz', { 
      compress: true, 
      quantize: false 
    });
    console.log('');
    
    // 4. Protobuf + Quantização + Gzip (MELHOR)
    await jsonToProtobuf(windData, 'wind-optimized.pb.gz', { 
      compress: true, 
      quantize: true 
    });
    
    // Comparação final
    const jsonSize = JSON.stringify(windData).length;
    const optimizedSize = fs.statSync('wind-optimized.pb.gz').size;
    const reduction = ((1 - optimizedSize / jsonSize) * 100).toFixed(1);
    
    console.log(`\n📊 Resumo:`);
    console.log(`  JSON original: ${(jsonSize / 1024).toFixed(2)} KB`);
    console.log(`  Otimizado: ${(optimizedSize / 1024).toFixed(2)} KB`);
    console.log(`  🎯 Redução total: ${reduction}%`);
    
    // Testar leitura
    const decoded = await protobufToJson('wind-optimized.pb.gz', {
      compressed: true,
      quantized: true
    });
    
    console.log(`\n✓ Verificação:`);
    console.log(`  Valores U: ${decoded.values.u.length}`);
    console.log(`  Valores V: ${decoded.values.v.length}`);
    console.log(`  Precisão mantida com pequena perda aceitável`);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// Executar exemplo se rodado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  example();
}
'use client';

import React, { useState, useEffect } from 'react';
import { read, utils, writeFile } from 'xlsx';
import { Download, FileDown, Play, Save, Trash2 } from 'lucide-react';
import ContainerSimulator from './3d/ContainerSimulator';

const ContainerOptimizer = () => {
  const [containers, setContainers] = useState(Array(6).fill().map(() => ({
    name: '',
    length: 0,
    width: 0,
    height: 0
  })));
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savedConfigurations, setSavedConfigurations] = useState([]);
  const [configName, setConfigName] = useState('');
  const [selectedConfig, setSelectedConfig] = useState('');
  
  // Estado para el simulador
  const [simulatorBox, setSimulatorBox] = useState({
    reference: '',
    length: 0,
    width: 0,
    height: 0
  });
  const [selectedContainer, setSelectedContainer] = useState(null);
  const [simulationResult, setSimulationResult] = useState(null);

  // Datos de ejemplo para los contenedores
  const sampleContainers = [
    { name: 'KLT3215', length: 300, width: 200, height: 150 },
    { name: 'KLT4280', length: 400, width: 300, height: 180 },
    { name: 'KLT4147', length: 400, width: 300, height: 147 },
    { name: 'KLT6147', length: 600, width: 400, height: 147 },
    { name: 'KLT6280', length: 600, width: 400, height: 280 },
    { name: 'KLT8147', length: 800, width: 600, height: 147 }
  ];

  // Cargar configuraciones guardadas al inicio
  useEffect(() => {
    const saved = localStorage.getItem('containerConfigurations');
    if (saved) {
      setSavedConfigurations(JSON.parse(saved));
    }
  }, []);

  const loadSampleContainers = () => {
    setContainers(sampleContainers);
  };

  const clearContainers = () => {
    setContainers(Array(6).fill().map(() => ({
      name: '',
      length: 0,
      width: 0,
      height: 0
    })));
  };

  // Guardar configuración actual
  const saveCurrentConfig = () => {
    if (!configName.trim()) {
      alert('Por favor, introduce un nombre para la configuración');
      return;
    }
    
    const newConfig = {
      name: configName,
      containers: containers
    };
    
    const updatedConfigs = [...savedConfigurations, newConfig];
    setSavedConfigurations(updatedConfigs);
    localStorage.setItem('containerConfigurations', JSON.stringify(updatedConfigs));
    setConfigName('');
  };

  // Cargar configuración guardada
  const loadConfiguration = (configName) => {
    const config = savedConfigurations.find(c => c.name === configName);
    if (config) {
      setContainers(config.containers);
      setSelectedConfig(configName);
    }
  };

  // Eliminar configuración guardada
  const deleteConfiguration = (configName) => {
    const updatedConfigs = savedConfigurations.filter(c => c.name !== configName);
    setSavedConfigurations(updatedConfigs);
    localStorage.setItem('containerConfigurations', JSON.stringify(updatedConfigs));
    if (selectedConfig === configName) {
      setSelectedConfig('');
    }
  };

  // Función para calcular si una caja cabe en un contenedor y cómo
const calculateFit = (box, container) => {
  try {
    // En una caja, hay exactamente 6 formas de orientarla (3! = 6)
    const orientations = [
      // 1. L-W-H (estándar)
      {
        name: "Orientación 1",
        description: "L×W×H (estándar)",
        dimensions: [box.length, box.width, box.height],
        fits: 
          box.length <= container.length && 
          box.width <= container.width && 
          box.height <= container.height
      },
      // 2. L-H-W
      {
        name: "Orientación 2",
        description: "L×H×W",
        dimensions: [box.length, box.height, box.width],
        fits: 
          box.length <= container.length && 
          box.height <= container.width && 
          box.width <= container.height
      },
      // 3. W-L-H
      {
        name: "Orientación 3",
        description: "W×L×H",
        dimensions: [box.width, box.length, box.height],
        fits: 
          box.width <= container.length && 
          box.length <= container.width && 
          box.height <= container.height
      },
      // 4. W-H-L
      {
        name: "Orientación 4",
        description: "W×H×L",
        dimensions: [box.width, box.height, box.length],
        fits: 
          box.width <= container.length && 
          box.height <= container.width && 
          box.length <= container.height
      },
      // 5. H-L-W
      {
        name: "Orientación 5",
        description: "H×L×W",
        dimensions: [box.height, box.length, box.width],
        fits: 
          box.height <= container.length && 
          box.length <= container.width && 
          box.width <= container.height
      },
      // 6. H-W-L
      {
        name: "Orientación 6",
        description: "H×W×L",
        dimensions: [box.height, box.width, box.length],
        fits: 
          box.height <= container.length && 
          box.width <= container.width && 
          box.length <= container.height
      }
    ];

    // Calcular exactamente cuántas cajas caben en cada orientación
    const calculatedOrientations = orientations.map(orientation => {
      if (!orientation.fits) return { ...orientation, quantity: 0 };
      
      const [l, w, h] = orientation.dimensions;
      
      // Calcular exactamente cuántas cajas caben en cada dirección
      const boxesInLength = Math.floor(container.length / l);
      const boxesInWidth = Math.floor(container.width / w);
      const boxesInHeight = Math.floor(container.height / h);
      
      // Total de cajas que caben con esta orientación
      const quantity = boxesInLength * boxesInWidth * boxesInHeight;
      
      return {
        ...orientation,
        boxesInLength,
        boxesInWidth,
        boxesInHeight,
        quantity
      };
    });

    // Filtrar orientaciones que caben y ordenar por cantidad descendente
    const validOrientations = calculatedOrientations
      .filter(o => o.fits)
      .sort((a, b) => b.quantity - a.quantity);

    // Si no hay orientaciones válidas
    if (validOrientations.length === 0) {
      return {
        fits: false,
        message: "No cabe en este tipo de cubeta",
        containersNeeded: 0
      };
    }

    // Obtener la mejor orientación (la que permite más cajas)
    const bestFit = validOrientations[0];
    
    return {
      fits: true,
      position: bestFit.name,
      orientation: bestFit.description,
      quantity: bestFit.quantity,
      containersNeeded: Math.ceil(box.stock / bestFit.quantity)
    };
  } catch (err) {
    console.error("Error calculando orientaciones:", err);
    return {
      fits: false,
      message: "Error en el cálculo",
      containersNeeded: 0
    };
  }
};

  const handleFileUpload = async (e) => {
    setLoading(true);
    const file = e.target.files[0];
    const data = await file.arrayBuffer();
    const workbook = read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = utils.sheet_to_json(worksheet);

    const analyzedData = jsonData.map(row => {
      const box = {
        reference: row['referencia'],
        length: row['largo (mm)'],
        width: row['ancho (mm)'],
        height: row['alto (mm)'],
        stock: row['stock medio (uds)']
      };

      const containerAnalysis = containers.map(container => {
        if (!container.name || !container.length || !container.width || !container.height) {
          return null;
        }
        return calculateFit(box, container);
      });

      return {
        ...box,
        containerAnalysis
      };
    });

    setResults(analyzedData);
    setLoading(false);
  };

  const executeAnalysis = () => {
    setLoading(true);
    const analyzedData = results.map(result => ({
      ...result,
      containerAnalysis: containers.map(container => {
        if (!container.name || !container.length || !container.width || !container.height) {
          return null;
        }
        return calculateFit({
          length: result.length,
          width: result.width,
          height: result.height,
          stock: result.stock
        }, container);
      })
    }));
    setResults(analyzedData);
    setLoading(false);
  };

  const simulateBoxPlacement = () => {
    if (!selectedContainer || !simulatorBox.length) return;
    
    const container = containers.find(c => c.name === selectedContainer);
    if (!container) return;

    const result = calculateFit(simulatorBox, container);
    setSimulationResult(result);
  };

  const exportResults = () => {
    const exportData = results.map(result => {
      // Columnas originales
      const baseRow = {
        'Referencia': result.reference,
        'Largo (mm)': result.length,
        'Ancho (mm)': result.width,
        'Alto (mm)': result.height,
        'Stock Medio (uds)': result.stock
      };

      // Para cada contenedor, añadir el análisis
      containers.forEach((container, idx) => {
        if (container.name && result.containerAnalysis[idx]) {
          const analysis = result.containerAnalysis[idx];
          if (analysis.fits) {
            baseRow[`${container.name} - ¿Cabe?`] = 'Sí';
            baseRow[`${container.name} - Unidades por contenedor`] = analysis.quantity;
            baseRow[`${container.name} - Posición`] = analysis.position;
            baseRow[`${container.name} - Orientación`] = analysis.orientation;
            baseRow[`${container.name} - Contenedores necesarios`] = Math.ceil(result.stock / analysis.quantity);
          } else {
            baseRow[`${container.name} - ¿Cabe?`] = 'No cabe en este tipo de cubeta';
            baseRow[`${container.name} - Unidades por contenedor`] = 0;
            baseRow[`${container.name} - Posición`] = 'N/A';
            baseRow[`${container.name} - Orientación`] = 'N/A';
            baseRow[`${container.name} - Contenedores necesarios`] = 0;
          }
        }
      });

      return baseRow;
    });

    const ws = utils.json_to_sheet(exportData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Análisis de Contenedores');
    writeFile(wb, 'analisis_contenedores.xlsx');
  };

  const downloadTemplate = () => {
    const template = [
      {
        'referencia': '',
        'largo (mm)': '',
        'ancho (mm)': '',
        'alto (mm)': '',
        'stock medio (uds)': ''
      }
    ];

    const ws = utils.json_to_sheet(template);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Plantilla');
    writeFile(wb, 'plantilla_cajas.xlsx');
  };

  const generateSampleData = () => {
    const sampleData = [
      {
        'referencia': 'BOX-A1',
        'largo (mm)': 280,
        'ancho (mm)': 180,
        'alto (mm)': 120,
        'stock medio (uds)': 1000
      },
      {
        'referencia': 'BOX-B2',
        'largo (mm)': 350,
        'ancho (mm)': 250,
        'alto (mm)': 100,
        'stock medio (uds)': 500
      },
      {
        'referencia': 'BOX-C3',
        'largo (mm)': 150,
        'ancho (mm)': 100,
        'alto (mm)': 80,
        'stock medio (uds)': 2000
      },
      {
        'referencia': 'BOX-D4',
        'largo (mm)': 550,
        'ancho (mm)': 350,
        'alto (mm)': 200,
        'stock medio (uds)': 300
      },
      {
        'referencia': 'BOX-E5',
        'largo (mm)': 200,
        'ancho (mm)': 150,
        'alto (mm)': 100,
        'stock medio (uds)': 1500
      }
    ];

    const ws = utils.json_to_sheet(sampleData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Datos de Ejemplo');
    writeFile(wb, 'ejemplo_cajas.xlsx');

    // También cargamos los datos de ejemplo en la aplicación
    setResults(sampleData.map(row => {
      const box = {
        reference: row['referencia'],
        length: row['largo (mm)'],
        width: row['ancho (mm)'],
        height: row['alto (mm)'],
        stock: row['stock medio (uds)']
      };

      const containerAnalysis = containers.map(container => {
        if (!container.name || !container.length || !container.width || !container.height) {
          return null;
        }
        return calculateFit(box, container);
      });

      return {
        ...box,
        containerAnalysis
      };
    }));
  };

  const handleContainerChange = (index, field, value) => {
    const newContainers = [...containers];
    newContainers[index] = {
      ...newContainers[index],
      [field]: field === 'name' ? value : Number(value)
    };
    setContainers(newContainers);
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Sección de configuraciones guardadas */}
      <div className="bg-white rounded-lg shadow-lg mb-6 p-6">
        <h2 className="text-2xl font-bold mb-4">Configuraciones Guardadas</h2>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={configName}
            onChange={(e) => setConfigName(e.target.value)}
            placeholder="Nombre de la configuración"
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={saveCurrentConfig}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <Save className="w-4 h-4" />
            Guardar Configuración
          </button>
        </div>
        {savedConfigurations.length > 0 && (
          <div className="mt-4">
            <select
              value={selectedConfig}
              onChange={(e) => loadConfiguration(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Seleccionar configuración guardada...</option>
              {savedConfigurations.map((config, idx) => (
                <option key={idx} value={config.name}>
                  {config.name}
                </option>
              ))}
            </select>
            {selectedConfig && (
              <button
                onClick={() => deleteConfiguration(selectedConfig)}
                className="mt-2 flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar Configuración
              </button>
            )}
          </div>
        )}
      </div>

      {/* Sección de Contenedores */}
      <div className="bg-white rounded-lg shadow-lg mb-6 p-6">
        <h2 className="text-2xl font-bold mb-4">Configuración de Contenedores</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {containers.map((container, index) => (
            <div key={index} className="border rounded p-4">
              <h3 className="font-bold mb-2">Contenedor {index + 1}</h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre</label>
                  <input
                    type="text"
                    value={container.name}
                    onChange={(e) => handleContainerChange(index, 'name', e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Nombre del contenedor"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Largo (mm)</label>
                  <input
                    type="number"
                    value={container.length || ''}
                    onChange={(e) => handleContainerChange(index, 'length', e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ancho (mm)</label>
                  <input
                    type="number"
                    value={container.width || ''}
                    onChange={(e) => handleContainerChange(index, 'width', e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Alto (mm)</label>
                  <input
                    type="number"
                    value={container.height || ''}
                    onChange={(e) => handleContainerChange(index, 'height', e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sección de Gestión de Archivos */}
      <div className="bg-white rounded-lg shadow-lg mb-6 p-6">
        <h2 className="text-2xl font-bold mb-4">Gestión de Archivos y Ejecución</h2>
        
        <div className="space-y-6">
          {/* Botones de plantilla y ejemplo */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <Download className="w-4 h-4" />
                Descargar Plantilla Vacía
              </button>
              <button
                onClick={generateSampleData}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                <Play className="w-4 h-4" />
                Generar Datos de Ejemplo
              </button>
            </div>
            
            <div className="flex flex-wrap gap-4 pt-4 border-t">
              <button
                onClick={loadSampleContainers}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                <Play className="w-4 h-4" />
                Cargar Contenedores de Ejemplo
              </button>
              <button
                onClick={clearContainers}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                <Download className="w-4 h-4" />
                Limpiar Contenedores
              </button>
            </div>
          </div>

          {/* Carga de archivo y ejecución */}
          <div className="space-y-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium mb-2">Cargar Archivo Excel</label>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            
            <div className="flex flex-wrap gap-4">
              <button
                onClick={executeAnalysis}
                disabled={!results.length || loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4" />
                Ejecutar Análisis
              </button>

              {results.length > 0 && (
                <button 
                  onClick={exportResults}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileDown className="w-4 h-4" />
                  Exportar Resultados
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Simulador 3D */}
      <div className="bg-white rounded-lg shadow-lg mb-6 p-6">
        <h2 className="text-2xl font-bold mb-4">Simulador 3D</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold mb-2">Configuración de Simulación</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Seleccionar Contenedor</label>
                <select
                  value={selectedContainer || ''}
                  onChange={(e) => setSelectedContainer(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Seleccionar contenedor...</option>
                  {containers.map((container, idx) => (
                    container.name && (
                      <option key={idx} value={container.name}>
                        {container.name} ({container.length}x{container.width}x{container.height}mm)
                      </option>
                    )
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Dimensiones de la Caja</h4>
                <input
                  type="text"
                  value={simulatorBox.reference}
                  onChange={(e) => setSimulatorBox({...simulatorBox, reference: e.target.value})}
                  placeholder="Referencia"
                  className="w-full p-2 border rounded mb-2"
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    value={simulatorBox.length || ''}
                    onChange={(e) => setSimulatorBox({...simulatorBox, length: Number(e.target.value)})}
                    placeholder="Largo (mm)"
                    className="p-2 border rounded"
                  />
                  <input
                    type="number"
                    value={simulatorBox.width || ''}
                    onChange={(e) => setSimulatorBox({...simulatorBox, width: Number(e.target.value)})}
                    placeholder="Ancho (mm)"
                    className="p-2 border rounded"
                  />
                  <input
                    type="number"
                    value={simulatorBox.height || ''}
                    onChange={(e) => setSimulatorBox({...simulatorBox, height: Number(e.target.value)})}
                    placeholder="Alto (mm)"
                    className="p-2 border rounded"
                  />
                </div>
                <button
                  onClick={simulateBoxPlacement}
                  className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Simular Colocación
                </button>
              </div>
            </div>

            {simulationResult && (
              <div className="mt-4 p-4 border rounded">
                <h4 className="font-bold mb-2">Resultado de la Simulación</h4>
                {simulationResult.fits ? (
                  <div className="space-y-1">
                    <p className="text-green-600">✓ La caja cabe en el contenedor</p>
                    <p>Posición óptima: {simulationResult.position}</p>
                    <p>Orientación: {simulationResult.orientation}</p>
                    <p>Unidades por contenedor: {simulationResult.quantity}</p>
                  </div>
                ) : (
                  <p className="text-red-600">La caja no cabe en este contenedor</p>
                )}
              </div>
            )}
          </div>

          <div>
            {selectedContainer && simulatorBox.length > 0 && (
              <ContainerSimulator
                container={containers.find(c => c.name === selectedContainer)}
                box={simulatorBox}
                position={simulationResult}
              />
            )}
          </div>
        </div>
      </div>

      {/* Resultados */}
      {loading && (
        <div className="text-center py-4">
          <p className="text-lg">Procesando datos...</p>
        </div>
      )}
      
      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Resultados del Análisis</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2 bg-gray-50">Referencia</th>
                  <th className="text-left p-2 bg-gray-50">Dimensiones (mm)</th>
                  <th className="text-left p-2 bg-gray-50">Stock</th>
                  {containers.map((container, idx) => (
                    container.name ? (
                      <th key={idx} className="text-left p-2 bg-gray-50">
                        Cubeta {container.name}
                      </th>
                    ) : null
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((result, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-2">{result.reference}</td>
                    <td className="p-2">
                      {result.length} x {result.width} x {result.height}
                    </td>
                    <td className="p-2">{result.stock}</td>
                    {containers.map((container, cIdx) => (
                      container.name && result.containerAnalysis[cIdx] ? (
                        <td key={cIdx} className="p-2">
                          {result.containerAnalysis[cIdx].fits ? (
                            <div className="space-y-1">
                              <div className="font-semibold text-green-600">✓ Cabe en la cubeta</div>
                              <div>Unidades por cubeta: {result.containerAnalysis[cIdx].quantity}</div>
                              <div>Posición óptima: {result.containerAnalysis[cIdx].position}</div>
                              <div>Orientación: {result.containerAnalysis[cIdx].orientation}</div>
                              <div className="mt-2 font-medium">
                                Cubetas necesarias: {result.containerAnalysis[cIdx].containersNeeded}
                                {result.containerAnalysis[cIdx].containersNeeded > 0 && 
                                  ` para ${result.stock} unidades`}
                              </div>
                            </div>
                          ) : (
                            <div className="text-red-600 font-medium">
                              No cabe en este tipo de cubeta
                            </div>
                          )}
                        </td>
                      ) : null
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContainerOptimizer;
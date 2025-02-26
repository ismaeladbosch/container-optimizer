'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Define una interfaz más específica para las orientaciones
interface Orientation {
  name: string;
  description: string;
  dimensions: number[]; // Arreglo de números para dimensiones
  fits: boolean; // Indica si la caja cabe en el contenedor
  quantity?: number; // Número opcional de cajas que caben
  boxesInLength?: number; // Número opcional de cajas en longitud
  boxesInWidth?: number; // Número opcional de cajas en ancho
  boxesInHeight?: number; // Número opcional de cajas en altura
}

// Define tipos para las props del componente
interface ContainerSimulatorProps {
  container?: {
    name?: string;
    length: number;
    width: number;
    height: number;
  };
  box?: {
    length: number;
    width: number;
    height: number;
  };
  position?: { x: number; y: number; z: number };
}

// Definir tipo para orientaciones en lugar de any
interface OrientationsArray extends Array<Orientation> {}

const ContainerSimulator: React.FC<ContainerSimulatorProps> = ({ 
  container, 
  box, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  position 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const boxesRef = useRef<THREE.Mesh[]>([]);
  const [currentBoxCount, setCurrentBoxCount] = useState(0);
  const [selectedOrientation, setSelectedOrientation] = useState('optimal');

  // Usar el tipo definido en lugar de any
  const [orientations, setOrientations] = useState<OrientationsArray>([]);
  const animationRef = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Función para generar colores diferentes pero visualmente agradables
  const getBoxColor = (index: number) => {
    const baseColors = [
      0xff4444, 0x44ff44, 0x4444ff, 0xffff44, 
      0xff44ff, 0x44ffff, 0xff8844, 0x88ff44, 
      0x4488ff, 0x8844ff
    ];
    return baseColors[index % baseColors.length];
  };

  // Calcular todas las orientaciones posibles - Envuelto en useCallback
  const calculateAllOrientations = useCallback((): Orientation[] => {
    if (!container || !box) return [];

    try {
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

      return validOrientations;
    } catch (err) {
      console.error("Error calculando orientaciones:", err);
      setError(`Error calculando orientaciones: ${err instanceof Error ? err.message : String(err)}`);
      return [];
    }
  }, [container, box]); // Dependencias para useCallback

  useEffect(() => {
    try {
      const allOrientations = calculateAllOrientations();
      console.log("Orientaciones calculadas:", allOrientations);
      setOrientations(allOrientations);
      if (allOrientations.length > 0) {
        setSelectedOrientation('optimal');
      }
    } catch (err) {
      console.error("Error configurando orientaciones:", err);
      setError(`Error configurando orientaciones: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [calculateAllOrientations]); // Ahora incluye calculateAllOrientations

  useEffect(() => {
    if (!container || !box) return;
    
    // Limpieza previa
    try {
      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            if (object.material) {
              if (Array.isArray(object.material)) {
                object.material.forEach(m => m.dispose());
              } else {
                object.material.dispose();
              }
            }
          }
        });
      }
      
      if (boxesRef.current.length > 0) {
        boxesRef.current.forEach(boxMesh => {
          if (boxMesh && boxMesh.parent) {
            boxMesh.parent.remove(boxMesh);
          }
        });
        boxesRef.current = [];
      }
      
      if (mountRef.current && mountRef.current.firstChild) {
        mountRef.current.removeChild(mountRef.current.firstChild);
      }
    } catch (error) {
      console.warn("Error en limpieza previa:", error);
    }

    try {
      // Comprobar si mountRef está disponible
      if (!mountRef.current) {
        console.warn('El contenedor del montaje no está disponible');
        return;
      }

      // Configuraciones iniciales
      const width = mountRef.current.clientWidth;
      const height = 500;
      const scene = new THREE.Scene();
      sceneRef.current = scene;
      scene.background = new THREE.Color(0xf0f0f0);

      // Configurar cámara
      const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2000);
      const maxDim = Math.max(container.length, container.width, container.height) / 100;
      camera.position.set(maxDim * 2, maxDim * 2, maxDim * 2);

      // Configurar renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      renderer.shadowMap.enabled = true;
      mountRef.current.appendChild(renderer.domElement);

      // Agregar luces
      const ambLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambLight);
      
      const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
      dirLight.position.set(maxDim * 2, maxDim * 3, maxDim * 2);
      dirLight.castShadow = true;
      scene.add(dirLight);

      // Material para el contenedor
      const containerMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x88ccff,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
      });

      // Crear contenedor
      const containerGroup = new THREE.Group();
      
      // Base
      const baseGeometry = new THREE.BoxGeometry(
        container.length / 100,
        0.02,
        container.width / 100
      );
      const baseMesh = new THREE.Mesh(baseGeometry, containerMaterial);
      baseMesh.position.y = 0.01;
      containerGroup.add(baseMesh);
      
      // Paredes
      const wallThickness = 0.01;
      const wallHeight = container.height / 100;
      
      // Pared 1
      const wall1 = new THREE.Mesh(
        new THREE.BoxGeometry(container.length / 100, wallHeight, wallThickness),
        containerMaterial
      );
      wall1.position.set(0, wallHeight / 2, container.width / 200);
      containerGroup.add(wall1);
      
      // Pared 2
      const wall2 = new THREE.Mesh(
        new THREE.BoxGeometry(container.length / 100, wallHeight, wallThickness),
        containerMaterial
      );
      wall2.position.set(0, wallHeight / 2, -container.width / 200);
      containerGroup.add(wall2);
      
      // Pared 3
      const wall3 = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness, wallHeight, container.width / 100),
        containerMaterial
      );
      wall3.position.set(container.length / 200, wallHeight / 2, 0);
      containerGroup.add(wall3);
      
      // Pared 4
      const wall4 = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness, wallHeight, container.width / 100),
        containerMaterial
      );
      wall4.position.set(-container.length / 200, wallHeight / 2, 0);
      containerGroup.add(wall4);
      
      scene.add(containerGroup);

      // Generamos cajas según la orientación seleccionada
      if (orientations.length > 0) {
        // Seleccionamos la configuración actual
        const selectedConfig = selectedOrientation === 'optimal' 
          ? orientations[0] 
          : orientations[parseInt(selectedOrientation)];
        
        console.log("Configuración seleccionada:", selectedConfig);
        
        if (selectedConfig) {
          // Extraer dimensiones
          const [boxLength, boxWidth, boxHeight] = selectedConfig.dimensions;
          const boxesInLength = selectedConfig.boxesInLength || 0;
          const boxesInWidth = selectedConfig.boxesInWidth || 0;
          const boxesInHeight = selectedConfig.boxesInHeight || 0;
          
          console.log(`Distribución ${selectedConfig.name}:`, 
            boxesInLength, 'x', boxesInWidth, 'x', boxesInHeight, 
            '=', selectedConfig.quantity);

          const createBox = (x: number, y: number, z: number, colorIndex: number, index: number) => {
            const geometry = new THREE.BoxGeometry(
              boxLength / 100,
              boxHeight / 100,
              boxWidth / 100
            );
            
            const material = new THREE.MeshPhysicalMaterial({
              color: getBoxColor(colorIndex),
              metalness: 0.1,
              roughness: 0.5,
              transparent: true,
              opacity: 0
            });
                  
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(x, y, z);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            
            scene.add(mesh);
            boxesRef.current.push(mesh);
            
            // Animación de aparición
            setTimeout(() => {
              const startY = y - 1;
              mesh.position.y = startY;
              
              const animate = () => {
                mesh.position.y += 0.05;
                mesh.material.opacity += 0.05;
                
                if (mesh.position.y < y) {
                  requestAnimationFrame(animate);
                } else {
                  mesh.position.y = y;
                  mesh.material.opacity = 1;
                }
              };
              
              animate();
            }, index * 20); // Más rápido para mejor experiencia
          };
          
          // Número máximo de cajas a renderizar (por rendimiento)
          const maxBoxesToRender = 200;
          const spacing = 0.005; // Espacio entre cajas
          
          // Calcular el punto inicial para centrar las cajas
          const startX = -(boxesInLength * (boxLength / 100 + spacing) - spacing) / 2 + (boxLength / 200);
          const startZ = -(boxesInWidth * (boxWidth / 100 + spacing) - spacing) / 2 + (boxWidth / 200);
          const startY = boxHeight / 200 + 0.02; // Empezar desde la base del contenedor
          
          let boxCount = 0;
          let boxIndex = 0;
          
          // Crear las cajas
          for (let h = 0; h < boxesInHeight && boxCount < maxBoxesToRender; h++) {
            for (let l = 0; l < boxesInLength && boxCount < maxBoxesToRender; l++) {
              for (let w = 0; w < boxesInWidth && boxCount < maxBoxesToRender; w++) {
                const x = startX + l * (boxLength / 100 + spacing);
                const y = startY + h * (boxHeight / 100 + spacing);
                const z = startZ + w * (boxWidth / 100 + spacing);
                
                // Usamos una combinación de posiciones para generar índices de color únicos
                const colorIndex = (h * boxesInLength * boxesInWidth + l * boxesInWidth + w);
                
                createBox(x, y, z, colorIndex, boxIndex++);
                boxCount++;
              }
            }
          }
          
          // Actualizar contador
          setCurrentBoxCount(selectedConfig.quantity || 0);
        }
      }
// Controles de cámara
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controlsRef.current = controls;

      // Grid helper
      const gridSize = Math.max(container.length, container.width) / 100;
      const gridHelper = new THREE.GridHelper(gridSize, 20);
      gridHelper.position.y = 0;
      scene.add(gridHelper);

      // Loop de animación
      const animate = () => {
        animationRef.current = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      
      animate();

    } catch (err) {
      console.error("Error en Three.js:", err);
      setError(`Error en el simulador 3D: ${err instanceof Error ? err.message : String(err)}`);
    }

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      try {
        if (sceneRef.current) {
          sceneRef.current.traverse((object) => {
            if (object instanceof THREE.Mesh) {
              object.geometry.dispose();
              if (object.material) {
                if (Array.isArray(object.material)) {
                  object.material.forEach(m => m.dispose());
                } else {
                  object.material.dispose();
                }
              }
            }
          });
        }
        
        boxesRef.current = [];
      } catch (error) {
        console.error("Error en cleanup:", error);
      }
    };
  }, [container, box, selectedOrientation, orientations]);

  // Mostrar error si ocurre
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-300 rounded">
        <h3 className="text-red-700 font-bold mb-2">Error en el simulador</h3>
        <p>{error}</p>
        <button 
          onClick={() => setError(null)} 
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div ref={mountRef} className="rounded-lg overflow-hidden shadow-lg h-[500px]" />
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="font-bold">Contenedor {container?.name}</h3>
          {orientations.length > 0 && (
            <span className="text-green-600">
              {currentBoxCount} unidades en esta orientación
            </span>
          )}
        </div>

        {orientations.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedOrientation('optimal')}
                className={`px-4 py-2 rounded ${
                  selectedOrientation === 'optimal'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Posición Óptima ({orientations[0].quantity} uds)
              </button>
              {orientations.map((orientation, index) => (
                index > 0 && (
                  <button
                    key={index}
                    onClick={() => setSelectedOrientation(index.toString())}
                    className={`px-4 py-2 rounded ${
                      selectedOrientation === index.toString()
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {orientation.name} ({orientation.quantity} uds)
                  </button>
                )
              ))}
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <h4 className="font-medium mb-2">Detalles de la orientación:</h4>
              {selectedOrientation === 'optimal' ? (
                <div>
                  <p>Orientación óptima: {orientations[0].name} - {orientations[0].quantity} unidades</p>
                  <p className="text-sm text-gray-500 mt-1">{orientations[0].description}</p>
                  <p className="text-sm mt-2">
                    Distribución: {orientations[0].boxesInLength} × {orientations[0].boxesInWidth} × {orientations[0].boxesInHeight}
                  </p>
                </div>
              ) : (
                <div>
                  <p>
                    Orientación alternativa: {orientations[parseInt(selectedOrientation)].name} - 
                    {orientations[parseInt(selectedOrientation)].quantity} unidades
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {orientations[parseInt(selectedOrientation)].description}
                  </p>
                  <p className="text-sm mt-2">
                    Distribución: 
                    {orientations[parseInt(selectedOrientation)].boxesInLength} × 
                    {orientations[parseInt(selectedOrientation)].boxesInWidth} × 
                    {orientations[parseInt(selectedOrientation)].boxesInHeight}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded">
          <h4 className="font-medium mb-2">Controles:</h4>
          <ul className="space-y-1 text-sm">
            <li>• Click izquierdo + arrastrar: Rotar vista</li>
            <li>• Click derecho + arrastrar: Mover vista</li>
            <li>• Rueda del ratón: Zoom</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ContainerSimulator;
// ============================================================================
// CALCULADORA DE COMBOS DE MAGIC: THE GATHERING
// ============================================================================
// Este código calcula el daño total de combos iterativos basados en:
// - Hechizos copiadores (spells que copian otros spells)
// - Encantamiento duplicador (duplica el primer spell del turno)
// - Artefacto duplicador (duplica cada copia que se crea)
//
// MATEMÁTICA DEL COMBO:
// Sin artefacto: copias = n + 1 (lineal)
// Con artefacto: copias = 2^(n+1) - 1 (exponencial)
//   - Cada copia genera otra copia via artefacto
//   - Total de copias por artefacto = (total - 1) / 2
// ============================================================================

// ============================================================================
// CONSTANTES
// ============================================================================
const LABELS = {
  EMPTY: '',
  CYCLES: 'Cantidad de Ciclos ',
  ARTIFACT_COPIES: 'Cantidad de copias generadas por el Artefacto en el último ciclo ',
  TOTAL_SPELLS: 'Cantidad total de Hechizos ',
  COPIES: 'Cantidad de Copias ',
};

// Colores para los nodos del grafo
const NODE_COLORS = {
  INITIAL_SPELL: 'orange',      // HC - Hechizo inicial (solo cuando n=0)
  CASTED_SPELL: 'purple',       // HC/HD - Hechizo copiador lanzado
  COPY: 'blue',                 // C - Copia normal
  ARTIFACT_COPY: 'green',       // CA - Copia generada por artefacto
};

// Tipos de nodos
const NODE_TYPES = {
  INITIAL_SPELL: 'HC',
  CASTED_SPELL: 'HC/HD',
  COPY: 'C',
  ARTIFACT_COPY: 'CA',
};

// ============================================================================
// ESTADO DE LA APLICACIÓN
// ============================================================================
class ComboCalculator {
  constructor() {
    this.reset();
  }

  reset() {
    this.spellDamage = 0;
    this.numberOfCopies = 0;
    this.finalSpellsQuantity = 0;
    this.duplicatedByArtifact = 0;
    this.spellsArray = []; // Array con la cantidad de copias por cada iteración
    this.diagram = null;
  }

  // ==========================================================================
  // CÁLCULO DE DAÑO Y COPIAS
  // ==========================================================================

  /**
   * Calcula el daño total del combo
   * @param {number} numberOfCopySpells - Hechizos copiadores lanzados de la mano
   * @param {number} damage - Daño base del último hechizo
   * @param {boolean} isDuplicatorEnchantmentPresent - Encantamiento que duplica primer spell
   * @param {boolean} isFirstSpellOfTurn - Si es el primer spell del turno
   * @param {boolean} isArtifactPresent - Artefacto que duplica cada copia
   * @param {boolean} printLogs - Si se deben imprimir logs
   * @returns {number} Daño total
   */
  calculateDamage(
    numberOfCopySpells,
    damage,
    isDuplicatorEnchantmentPresent,
    isFirstSpellOfTurn,
    isArtifactPresent,
    printLogs = false
  ) {
    this.reset();

    // Calcular cantidad de copias
    this.calculateCopies(
      numberOfCopySpells,
      isDuplicatorEnchantmentPresent,
      isFirstSpellOfTurn,
      isArtifactPresent
    );

    // Calcular daño total
    this.spellDamage = this.finalSpellsQuantity * damage;

    // Imprimir logs si es necesario
    if (printLogs) {
      console.log('Array de hechizos por iteración:', this.spellsArray);
      console.log('Total de hechizos:', this.finalSpellsQuantity);
      console.log('Daño total:', this.spellDamage);
    }

    return this.spellDamage;
  }

  /**
   * Calcula el número total de copias generadas
   * @param {number} numberOfCopySpells - Hechizos copiadores lanzados
   * @param {boolean} isDuplicatorEnchantmentPresent - Encantamiento duplicador
   * @param {boolean} isFirstSpellOfTurn - Si es primer spell del turno
   * @param {boolean} isArtifactPresent - Artefacto duplicador
   */
  calculateCopies(
    numberOfCopySpells,
    isDuplicatorEnchantmentPresent,
    isFirstSpellOfTurn,
    isArtifactPresent
  ) {
    // Si tenemos encantamiento duplicador Y es primer turno, +1 spell gratis
    if (isDuplicatorEnchantmentPresent && isFirstSpellOfTurn) {
      numberOfCopySpells = numberOfCopySpells + 1;
    }

    // Inicializar array de spells
    this.spellsArray = [];

    // Calcular copias para cada iteración (cada spell copiador lanzado)
    for (let iteration = 0; iteration <= numberOfCopySpells; iteration++) {
      if (isArtifactPresent) {
        this.spellsArray[iteration] = this.calculateSpellWithArtifact(iteration);
      } else {
        this.spellsArray[iteration] = this.calculateSpellNormal(iteration);
      }
    }

    // Guardar resultado final
    this.finalSpellsQuantity = this.numberOfCopies;

    // Caso especial: si no lanzamos ningún copiador, igual contamos el spell inicial
    if (numberOfCopySpells === 0) {
      this.finalSpellsQuantity = 1;
    }
  }

  /**
   * Calcula copias CON artefacto duplicador (crecimiento exponencial)
   * Fórmula: 2^(n+1) - 1
   * @param {number} iteration - Número de iteración actual
   * @returns {number} Total de copias hasta esta iteración
   */
  calculateSpellWithArtifact(iteration) {
    const exponent = iteration + 1;
    this.numberOfCopies = Math.pow(2, exponent) - 1;

    // Calcular cuántas copias fueron generadas POR el artefacto
    // (la mitad del total menos el original)
    this.duplicatedByArtifact = (this.numberOfCopies - 1) / 2;

    return this.numberOfCopies;
  }

  /**
   * Calcula copias SIN artefacto (crecimiento lineal)
   * Fórmula: n + 1
   * @param {number} iteration - Número de iteración actual
   * @returns {number} Total de copias hasta esta iteración
   */
  calculateSpellNormal(iteration) {
    this.numberOfCopies = iteration + 1;
    return this.numberOfCopies;
  }

  // ==========================================================================
  // GENERACIÓN DE NODOS Y ENLACES PARA EL GRAFO
  // ==========================================================================

  /**
   * Crea los nodos del grafo basado en spellsArray
   * @param {boolean} isArtifactPresent - Si hay artefacto duplicador
   * @returns {Array} Array de nodos para GoJS
   */
  createNodes(isArtifactPresent) {
    if (!this.spellsArray || this.spellsArray.length === 0) {
      console.warn('No hay datos calculados para crear nodos');
      return [];
    }

    if (isArtifactPresent) {
      return this.createNodesWithArtifact();
    } else {
      return this.createNodesNormal();
    }
  }

  /**
   * Crea nodos NORMALES (sin artefacto)
   * Estructura por columna:
   * - 1 nodo HC/HD (spell lanzado) arriba
   * - N nodos C (copias) abajo
   */
  createNodesNormal() {
    const nodes = [];
    const X_SPACING = 100; // Espaciado horizontal entre columnas
    const Y_SPACING = 30;  // Espaciado vertical entre nodos
    const BASE_X = 100;
    const BASE_Y = 0;

    for (let iteration = 0; iteration < this.spellsArray.length; iteration++) {
      const totalCopies = this.spellsArray[iteration];
      const columnX = BASE_X + (iteration * X_SPACING);

      // Caso especial: primer spell sin copias
      if (totalCopies === 1) {
        nodes.push({
          key: `${NODE_TYPES.INITIAL_SPELL}_${iteration}`,
          color: NODE_COLORS.INITIAL_SPELL,
          location: new go.Point(columnX + 100, BASE_Y - 10),
        });
        continue;
      }

      // Agregar nodo del spell lanzado (HC/HD) en la parte superior
      nodes.push({
        key: `${NODE_TYPES.CASTED_SPELL}_${iteration}`,
        color: NODE_COLORS.CASTED_SPELL,
        location: new go.Point(columnX + 80, BASE_Y - 10),
      });

      // Agregar nodos de copias (C) verticalmente
      const numberOfCopyNodes = totalCopies - 1; // -1 porque el spell lanzado no es copia
      for (let copyIndex = 0; copyIndex < numberOfCopyNodes; copyIndex++) {
        const yPosition = BASE_Y + Y_SPACING + (copyIndex * Y_SPACING);
        nodes.push({
          key: `${NODE_TYPES.COPY}_${iteration}_${copyIndex}`,
          color: NODE_COLORS.COPY,
          location: new go.Point(columnX + 85, yPosition),
        });
      }
    }

    return nodes;
  }

  /**
   * Crea nodos CON artefacto
   * Estructura por columna:
   * - 1 nodo HC/HD (spell lanzado) arriba
   * - N nodos C (copias normales) en medio
   * - N nodos CA (copias de artefacto) abajo
   */
  createNodesWithArtifact() {
    const nodes = [];
    const X_SPACING = 100;
    const Y_SPACING = 30;
    const BASE_X = 100;
    const BASE_Y = 0;

    for (let iteration = 0; iteration < this.spellsArray.length; iteration++) {
      const totalCopies = this.spellsArray[iteration];
      const columnX = BASE_X + (iteration * X_SPACING);

      // Caso especial: primer spell sin copias
      if (totalCopies === 1) {
        nodes.push({
          key: `${NODE_TYPES.INITIAL_SPELL}_${iteration}`,
          color: NODE_COLORS.INITIAL_SPELL,
          location: new go.Point(columnX + 100, BASE_Y - 10),
        });
        continue;
      }

      // Con artefacto: total = 1 (lanzado) + N (copias normales) + N (copias artefacto)
      // Ejemplo: 7 total = 1 + 3 + 3
      const copiesPerType = (totalCopies - 1) / 2;

      // Agregar nodo del spell lanzado (HC/HD)
      nodes.push({
        key: `${NODE_TYPES.CASTED_SPELL}_${iteration}`,
        color: NODE_COLORS.CASTED_SPELL,
        location: new go.Point(columnX + 80, BASE_Y - 10),
      });

      let yPosition = BASE_Y + Y_SPACING;

      // Agregar copias normales (C)
      for (let copyIndex = 0; copyIndex < copiesPerType; copyIndex++) {
        nodes.push({
          key: `${NODE_TYPES.COPY}_${iteration}_${copyIndex}`,
          color: NODE_COLORS.COPY,
          location: new go.Point(columnX + 85, yPosition),
        });
        yPosition += Y_SPACING;
      }

      // Agregar copias de artefacto (CA)
      for (let artifactIndex = 0; artifactIndex < copiesPerType; artifactIndex++) {
        nodes.push({
          key: `${NODE_TYPES.ARTIFACT_COPY}_${iteration}_${artifactIndex}`,
          color: NODE_COLORS.ARTIFACT_COPY,
          location: new go.Point(columnX + 85, yPosition),
        });
        yPosition += Y_SPACING;
      }
    }

    return nodes;
  }

  /**
   * Crea los enlaces entre nodos
   * @param {boolean} isArtifactPresent - Si hay artefacto duplicador
   * @returns {Array} Array de enlaces para GoJS
   */
  createLinks(isArtifactPresent) {
    if (!this.spellsArray || this.spellsArray.length === 0) {
      console.warn('No hay datos calculados para crear enlaces');
      return [];
    }

    if (isArtifactPresent) {
      return this.createLinksWithArtifact();
    } else {
      return this.createLinksNormal();
    }
  }

  /**
   * Crea enlaces NORMALES (sin artefacto)
   * Regla: Todos los nodos de columna anterior (violeta + azules) se vinculan
   * uno-a-uno con los nodos azules (copias) de la siguiente columna
   */
  createLinksNormal() {
    const links = [];

    for (let i = 0; i < this.spellsArray.length - 1; i++) {
      const currentColumnTotal = this.spellsArray[i];
      const nextColumnCopies = this.spellsArray[i + 1] - 1; // -1 porque el spell lanzado no cuenta
      
      // Obtener todos los nodos de la columna actual
      const currentColumnNodes = [];
      
      if (currentColumnTotal === 1) {
        // Solo hay HC inicial
        currentColumnNodes.push(`${NODE_TYPES.INITIAL_SPELL}_${i}`);
      } else {
        // Agregar HC/HD (spell lanzado)
        currentColumnNodes.push(`${NODE_TYPES.CASTED_SPELL}_${i}`);
        
        // Agregar todas las copias (C)
        const numberOfCopies = currentColumnTotal - 1;
        for (let copyIdx = 0; copyIdx < numberOfCopies; copyIdx++) {
          currentColumnNodes.push(`${NODE_TYPES.COPY}_${i}_${copyIdx}`);
        }
      }
      
      // Vincular cada nodo de columna actual con una copia de columna siguiente
      // uno-a-uno hasta que se acaben los nodos
      const maxLinks = Math.min(currentColumnNodes.length, nextColumnCopies);
      
      for (let linkIdx = 0; linkIdx < maxLinks; linkIdx++) {
        links.push({
          from: currentColumnNodes[linkIdx],
          to: `${NODE_TYPES.COPY}_${i + 1}_${linkIdx}`
        });
      }
    }

    return links;
  }

  /**
   * Crea enlaces CON artefacto
   * Regla: Todos los nodos de columna anterior (violeta + azules + verdes) se vinculan
   * uno-a-uno con los nodos azules (copias) de la siguiente columna
   */
  createLinksWithArtifact() {
    const links = [];

    for (let i = 0; i < this.spellsArray.length - 1; i++) {
      const currentColumnTotal = this.spellsArray[i];
      const nextColumnTotal = this.spellsArray[i + 1];
      
      if (nextColumnTotal === 1) continue; // No hay copias en siguiente columna
      
      const nextColumnCopiesPerType = (nextColumnTotal - 1) / 2;
      
      // Obtener todos los nodos de la columna actual
      const currentColumnNodes = [];
      
      if (currentColumnTotal === 1) {
        // Solo hay HC inicial
        currentColumnNodes.push(`${NODE_TYPES.INITIAL_SPELL}_${i}`);
      } else {
        // Agregar HC/HD (spell lanzado)
        currentColumnNodes.push(`${NODE_TYPES.CASTED_SPELL}_${i}`);
        
        // Agregar todas las copias normales (C)
        const copiesPerType = (currentColumnTotal - 1) / 2;
        for (let copyIdx = 0; copyIdx < copiesPerType; copyIdx++) {
          currentColumnNodes.push(`${NODE_TYPES.COPY}_${i}_${copyIdx}`);
        }
        
        // Agregar todas las copias de artefacto (CA)
        for (let artifactIdx = 0; artifactIdx < copiesPerType; artifactIdx++) {
          currentColumnNodes.push(`${NODE_TYPES.ARTIFACT_COPY}_${i}_${artifactIdx}`);
        }
      }
      
      // Vincular cada nodo de columna actual con una copia AZUL (C) de columna siguiente
      // uno-a-uno hasta que se acaben los nodos
      const maxLinks = Math.min(currentColumnNodes.length, nextColumnCopiesPerType);
      
      for (let linkIdx = 0; linkIdx < maxLinks; linkIdx++) {
        links.push({
          from: currentColumnNodes[linkIdx],
          to: `${NODE_TYPES.COPY}_${i + 1}_${linkIdx}`
        });
      }
    }

    return links;
  }
}

// ============================================================================
// INSTANCIA GLOBAL Y FUNCIONES DE INTERFAZ
// ============================================================================

// Instancia global del calculador
const calculator = new ComboCalculator();
let myDiagram = null;

/**
 * Función principal: calcula y dibuja el grafo
 */
function calculateDamageToGraph() {
  // Obtener valores del formulario
  const numberOfSpells = Number(document.getElementById('numberOFSpells').value);
  const damage = Number(document.getElementById('damage').value);
  const duplicatorEnchantment = Boolean(document.getElementById('duplicatorEnchantment').checked);
  const firstTurn = Boolean(document.getElementById('firstTurn').checked);
  const duplicatorArtifact = Boolean(document.getElementById('duplicatorArtifact').checked);
  const writeLogs = Boolean(document.getElementById('writeLogs').checked);

  // Calcular daño
  calculator.calculateDamage(
    numberOfSpells,
    damage,
    duplicatorEnchantment,
    firstTurn,
    duplicatorArtifact,
    writeLogs
  );

  // Actualizar UI
  updateUIStats(numberOfSpells);

  // Dibujar grafo
  draw();
}

/**
 * Actualiza las estadísticas en la UI
 */
function updateUIStats(numberOfSpells) {
  document.getElementById('castedSpells').textContent = numberOfSpells + 1;
  document.getElementById('copiedSpells').textContent = calculator.numberOfCopies;
  document.getElementById('generatedByArtifact').textContent = calculator.duplicatedByArtifact;
  document.getElementById('initialDamage').textContent = document.getElementById('damage').value;
  document.getElementById('totalDamage').textContent = calculator.spellDamage;

  // Actualizar logs
  updateLogs(numberOfSpells);
}

/**
 * Actualiza el contenedor de logs
 */
function updateLogs(numberOfSpells) {
  const isDuplicatorArtifact = Boolean(document.getElementById('duplicatorArtifact').checked);
  const damage = Number(document.getElementById('damage').value);
  const logContainer = document.getElementById('logContainer');

  logContainer.innerHTML = '';
  logContainer.innerHTML += `Hechizos Lanzados de la mano ${numberOfSpells + 1} (Copiadores ${numberOfSpells} + Lanzado 1)<br>`;
  logContainer.innerHTML += `${LABELS.COPIES}${calculator.numberOfCopies}<br>`;
  
  if (isDuplicatorArtifact) {
    logContainer.innerHTML += `${LABELS.ARTIFACT_COPIES}${calculator.duplicatedByArtifact}<br>`;
  }
  
  logContainer.innerHTML += `${LABELS.TOTAL_SPELLS}${calculator.finalSpellsQuantity}<br>`;
  logContainer.innerHTML += `Daño Inicial ${damage} - Daño Final ${calculator.spellDamage}<br>`;
}

/**
 * Dibuja el diagrama de GoJS
 */
function draw() {
  const $ = go.GraphObject.make;

  try {
    // Borrar diagrama anterior
    deleteDiagram();

    // Verificar que hay datos calculados
    if (!calculator.spellsArray || calculator.spellsArray.length === 0) {
      console.log('No hay cálculos realizados. Primero calcula el daño.');
      return;
    }

    // Crear nuevo diagrama
    myDiagram = $(go.Diagram, 'myDiagramDiv', {
      'undoManager.isEnabled': true,
    });

    // Definir template de nodos
    myDiagram.nodeTemplate = $(
      go.Node,
      'Auto',
      new go.Binding('location').makeTwoWay(),
      $(
        go.Shape,
        'RoundedRectangle',
        { fill: 'white', strokeWidth: 0 },
        new go.Binding('fill', 'color')
      ),
      $(
        go.TextBlock,
        { margin: 5 },
        new go.Binding('text', 'key')
      )
    );

    // Definir template de enlaces
    myDiagram.linkTemplate = $(
      go.Link,
      go.Link.Bezier,
      $(go.Shape, { strokeWidth: 1.5 }),
      $(go.Shape, { toArrow: 'Standard' })
    );

    // Layout básico
    myDiagram.layout = new go.Layout();

    // Obtener si hay artefacto
    const isArtifactPresent = Boolean(document.getElementById('duplicatorArtifact').checked);

    // Crear nodos y enlaces
    const nodes = calculator.createNodes(isArtifactPresent);
    const links = calculator.createLinks(isArtifactPresent);

    // Asignar modelo
    myDiagram.model = new go.GraphLinksModel(nodes, links);

  } catch (error) {
    console.error('Error al dibujar diagrama:', error);
    myDiagram.div = null;
    draw(); // Reintentar
  }
}

/**
 * Elimina el diagrama actual
 */
function deleteDiagram() {
  try {
    if (myDiagram) {
      myDiagram.div = null;
      console.log('Diagrama eliminado');
    }
  } catch (error) {
    console.log('No hay diagrama que eliminar');
  }
}

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

// Colores para los nodos del grafo (ahora dinámicos según el tema)
let NODE_COLORS = {
  INITIAL_SPELL: 'orange',      // HC - Hechizo inicial (solo cuando n=0)
  CASTED_SPELL: 'purple',       // HC/HD - Hechizo copiador lanzado
  COPY: 'blue',                 // C - Copia normal
  ARTIFACT_COPY: 'green',       // CA - Copia generada por artefacto
  STORM_COPY: 'red',            // T - Copia generada por tormenta
  STORM_ARTIFACT_COPY: 'green',   // CTA - Copia de artefacto de tormenta
};

// Tipos de nodos
const NODE_TYPES = {
  INITIAL_SPELL: 'HC',
  CASTED_SPELL: 'HC/HD',
  COPY: 'C',
  ARTIFACT_COPY: 'CA',
  STORM_COPY: 'T',
  STORM_ARTIFACT_COPY: 'CTA',
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
    this.duplicatedByStorm = 0;
    this.duplicatedByArtifactForStorm = 0;
    this.duplicatorArtifactsCount = 0;
    this.stormCount = 0;
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
   * @param {number} duplicatorEnchantmentsCount - Cantidad de encantamientos duplicadores
   * @param {number} duplicatorArtifactsCount - Cantidad de artefactos duplicadores
   * @param {number} stormCount - Cantidad de encantamientos de tormenta
   * @param {boolean} printLogs - Si se deben imprimir logs
   * @returns {number} Daño total
   */
  calculateDamage(
    numberOfCopySpells,
    damage,
    duplicatorEnchantmentsCount,
    duplicatorArtifactsCount,
    stormCount,
    printLogs = false
  ) {
    this.reset();

    // Calcular cantidad de copias
    this.calculateCopies(
      numberOfCopySpells,
      duplicatorEnchantmentsCount,
      duplicatorArtifactsCount,
      stormCount
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
   * @param {number} duplicatorEnchantmentsCount - Cantidad de encantamientos duplicadores
   * @param {number} duplicatorArtifactsCount - Cantidad de artefactos duplicadores
   * @param {number} stormCount - Cantidad de encantamientos de tormenta
   */
  calculateCopies(
    numberOfCopySpells,
    duplicatorEnchantmentsCount,
    duplicatorArtifactsCount,
    stormCount
  ) {
    // Cada encantamiento duplicador agrega +1 spell gratis (solo si NO hay tormenta)
    if (duplicatorEnchantmentsCount > 0 && stormCount === 0) {
      numberOfCopySpells = numberOfCopySpells + duplicatorEnchantmentsCount;
    }

    // Guardar las cantidades para uso posterior
    this.duplicatorArtifactsCount = duplicatorArtifactsCount;
    this.stormCount = stormCount;

    // Inicializar arrays
    this.spellsArray = [];

    // Determinar si hay artefactos y tormentas
    const hasArtifact = duplicatorArtifactsCount > 0;
    const hasStorm = stormCount > 0;

    // Calcular copias para cada iteración
    for (let iteration = 0; iteration <= numberOfCopySpells; iteration++) {
      if (hasArtifact && hasStorm) {
        this.spellsArray[iteration] = this.calculateSpellWithArtifactAndStorm(iteration);
      } else if (hasArtifact) {
        this.spellsArray[iteration] = this.calculateSpellWithArtifact(iteration);
      } else if (hasStorm) {
        this.spellsArray[iteration] = this.calculateSpellWithStorm(iteration);
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
   * Calcula copias CON artefacto duplicador (crecimiento exponencial con múltiples artefactos)
   * Con N artefactos: cada copia genera +N copias adicionales
   * Fórmula con 1 artefacto: 2^(n+1) - 1
   * Fórmula con N artefactos: ((N+1)^(n+1) - 1) / N
   * @param {number} iteration - Número de iteración actual
   * @returns {number} Total de copias hasta esta iteración
   */
  calculateSpellWithArtifact(iteration) {
    const N = this.duplicatorArtifactsCount;
    const exponent = iteration + 1;
    
    // Fórmula generalizada para N artefactos
    this.numberOfCopies = (Math.pow(N + 1, exponent) - 1) / N;

    // Calcular cuántas copias fueron generadas POR los artefactos
    // Con N artefactos, cada copia original genera N copias de artefacto
    this.duplicatedByArtifact = (this.numberOfCopies - 1) * N / (N + 1);

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

  /**
   * Calcula copias CON tormenta (sin artefacto)
   * Con N tormentas: cada tormenta crea iteration copias (efecto se dispara N veces)
   * Fórmula: 1 spell + iteration copias normales + (iteration × N) copias de tormenta
   * @param {number} iteration - Número de iteración actual
   * @returns {number} Total de copias hasta esta iteración
   */
  calculateSpellWithStorm(iteration) {
    const castedSpell = 1;
    const normalCopies = iteration; // Las copias normales
    const stormCopiesPerInstance = iteration; // Copias por cada tormenta
    const totalStormCopies = stormCopiesPerInstance * this.stormCount; // Multiplicado por cantidad de tormentas
    
    if (iteration === 0) {
      this.numberOfCopies = 1; // Solo el spell inicial
      this.duplicatedByStorm = 0;
    } else {
      this.duplicatedByStorm = totalStormCopies;
      this.numberOfCopies = this.numberOfCopies + castedSpell + normalCopies + totalStormCopies;
    }
    
    return this.numberOfCopies;
  }

  /**
   * Calcula copias CON artefacto Y tormenta
   * - N artefactos: cada copia genera +N copias (aditivo)
   * - M tormentas: el efecto de tormenta se dispara M veces (multiplicativo)
   * @param {number} iteration - Número de iteración actual
   * @returns {number} Total de copias hasta esta iteración
   */
  calculateSpellWithArtifactAndStorm(iteration) {
    const castedSpell = 1;
    const N = this.duplicatorArtifactsCount; // Cantidad de artefactos
    const M = this.stormCount; // Cantidad de tormentas
    const stormCopiesPerInstance = iteration; // Copias por cada tormenta
    const totalStormCopies = stormCopiesPerInstance * M; // Total de copias de tormenta

    if (iteration === 0) {
      this.numberOfCopies = 1;
      this.duplicatedByStorm = 0;
      this.duplicatedByArtifactForStorm = 0;
      this.duplicatedByArtifact = 0;
    } else if (iteration === 1) {
      // Iteración 1:
      // - 1 spell lanzado
      // - 1 copia normal → N copias de artefacto
      // - M copias de tormenta → M×N copias de artefacto de tormenta
      const normalCopies = 1;
      this.duplicatedByArtifact = normalCopies * N; // Artefactos duplican la copia normal
      this.duplicatedByStorm = totalStormCopies; // M tormentas
      this.duplicatedByArtifactForStorm = totalStormCopies * N; // Artefactos duplican las tormentas
      
      this.numberOfCopies = castedSpell + normalCopies + this.duplicatedByArtifact + 
                           this.duplicatedByStorm + this.duplicatedByArtifactForStorm;
    } else {
      // Iteración N (N >= 2):
      // - Todas las copias previas se multiplican por (N+1) debido a los artefactos
      // - Se agregan las copias de tormenta y sus duplicaciones
      const previousCopies = this.numberOfCopies;
      
      // Los N artefactos duplican todas las copias previas
      this.duplicatedByArtifact = previousCopies * N;
      this.duplicatedByStorm = totalStormCopies;
      this.duplicatedByArtifactForStorm = totalStormCopies * N;
      
      this.numberOfCopies = previousCopies * (N + 1) + castedSpell + 
                           this.duplicatedByStorm + this.duplicatedByArtifactForStorm;
    }

    return this.numberOfCopies;
  }

  // ==========================================================================
  // GENERACIÓN DE NODOS Y ENLACES PARA EL GRAFO
  // ==========================================================================

  /**
   * Crea los nodos del grafo basado en spellsArray
   * @param {boolean} isArtifactPresent - Si hay artefacto duplicador
   * @param {boolean} isStormPresent - Si hay encantamiento de tormenta
   * @returns {Array} Array de nodos para GoJS
   */
  createNodes(isArtifactPresent, isStormPresent) {
    if (!this.spellsArray || this.spellsArray.length === 0) {
      console.warn('No hay datos calculados para crear nodos');
      return [];
    }

    if (isArtifactPresent && isStormPresent) {
      return this.createNodesWithArtifactAndStorm();
    } else if (isArtifactPresent) {
      return this.createNodesWithArtifact();
    } else if (isStormPresent) {
      return this.createNodesWithStorm();
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
   * Crea nodos CON tormenta (sin artefacto)
   * Con M tormentas: se crean M conjuntos de nodos T (todos rojos)
   * Estructura por columna:
   * - 1 nodo HC/HD (spell lanzado) arriba
   * - N nodos C (copias normales) en medio
   * - M×iteration nodos T (copias de tormenta) abajo (rojos)
   */
  createNodesWithStorm() {
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

      // Con tormenta: total = 1 (lanzado) + iteration (copias normales) + iteration×M (copias tormenta)
      const normalCopies = iteration;
      const totalStormCopies = iteration * this.stormCount;

      // Agregar nodo del spell lanzado (HC/HD)
      nodes.push({
        key: `${NODE_TYPES.CASTED_SPELL}_${iteration}`,
        color: NODE_COLORS.CASTED_SPELL,
        location: new go.Point(columnX + 80, BASE_Y - 10),
      });

      let yPosition = BASE_Y + Y_SPACING;

      // Agregar copias normales (C) - azules
      for (let copyIndex = 0; copyIndex < normalCopies; copyIndex++) {
        nodes.push({
          key: `${NODE_TYPES.COPY}_${iteration}_${copyIndex}`,
          color: NODE_COLORS.COPY,
          location: new go.Point(columnX + 85, yPosition),
        });
        yPosition += Y_SPACING;
      }

      // Agregar copias de tormenta (T) - rojas (todas las tormentas juntas)
      for (let stormIndex = 0; stormIndex < totalStormCopies; stormIndex++) {
        nodes.push({
          key: `${NODE_TYPES.STORM_COPY}_${iteration}_${stormIndex}`,
          color: NODE_COLORS.STORM_COPY,
          location: new go.Point(columnX + 85, yPosition),
        });
        yPosition += Y_SPACING;
      }
    }

    return nodes;
  }

  /**
   * Crea nodos CON artefacto Y tormenta
   * Con N artefactos y M tormentas
   * Estructura por columna:
   * - 1 nodo HC/HD (spell lanzado) arriba
   * - X nodos C (copias normales) 
   * - X×N nodos CA (copias de artefacto de las normales)
   * - iteration×M nodos T (copias de tormenta) - rojas
   * - iteration×M×N nodos CTA (copias de artefacto de tormenta) - rojas
   */
  createNodesWithArtifactAndStorm() {
    const nodes = [];
    const X_SPACING = 100;
    const Y_SPACING = 30;
    const BASE_X = 100;
    const BASE_Y = 0;
    const N = this.duplicatorArtifactsCount;
    const M = this.stormCount;

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

      // Calcular cantidad de cada tipo
      const totalStormCopies = iteration * M;
      const totalStormArtifactCopies = iteration * M * N;
      
      // Las copias normales y sus artefactos
      let normalCopies, artifactCopies;
      
      if (iteration === 1) {
        normalCopies = 1;
        artifactCopies = N; // N artefactos duplican la copia normal
      } else {
        // Total - 1 (lanzado) - (storm × M) - (storm × M × N)
        const copiesAndArtifact = totalCopies - 1 - totalStormCopies - totalStormArtifactCopies;
        normalCopies = copiesAndArtifact / (N + 1);
        artifactCopies = normalCopies * N;
      }

      // Agregar nodo del spell lanzado (HC/HD)
      nodes.push({
        key: `${NODE_TYPES.CASTED_SPELL}_${iteration}`,
        color: NODE_COLORS.CASTED_SPELL,
        location: new go.Point(columnX + 80, BASE_Y - 10),
      });

      let yPosition = BASE_Y + Y_SPACING;

      // ORDEN CORRECTO: C -> CA -> T -> CTA
      
      // 1. Agregar copias normales (C) - azules
      for (let copyIndex = 0; copyIndex < normalCopies; copyIndex++) {
        nodes.push({
          key: `${NODE_TYPES.COPY}_${iteration}_${copyIndex}`,
          color: NODE_COLORS.COPY,
          location: new go.Point(columnX + 85, yPosition),
        });
        yPosition += Y_SPACING;
      }

      // 2. Agregar copias de artefacto (CA) - verdes
      for (let artifactIndex = 0; artifactIndex < artifactCopies; artifactIndex++) {
        nodes.push({
          key: `${NODE_TYPES.ARTIFACT_COPY}_${iteration}_${artifactIndex}`,
          color: NODE_COLORS.ARTIFACT_COPY,
          location: new go.Point(columnX + 85, yPosition),
        });
        yPosition += Y_SPACING;
      }

      // 3. Agregar copias de tormenta (T) - rojas
      for (let stormIndex = 0; stormIndex < totalStormCopies; stormIndex++) {
        nodes.push({
          key: `${NODE_TYPES.STORM_COPY}_${iteration}_${stormIndex}`,
          color: NODE_COLORS.STORM_COPY,
          location: new go.Point(columnX + 85, yPosition),
        });
        yPosition += Y_SPACING;
      }

      // 4. Agregar copias de artefacto de tormenta (CTA) - rojas
      for (let stormArtifactIndex = 0; stormArtifactIndex < totalStormArtifactCopies; stormArtifactIndex++) {
        nodes.push({
          key: `${NODE_TYPES.STORM_ARTIFACT_COPY}_${iteration}_${stormArtifactIndex}`,
          color: NODE_COLORS.STORM_ARTIFACT_COPY,
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
   * @param {boolean} isStormPresent - Si hay encantamiento de tormenta
   * @returns {Array} Array de enlaces para GoJS
   */
  createLinks(isArtifactPresent, isStormPresent) {
    if (!this.spellsArray || this.spellsArray.length === 0) {
      console.warn('No hay datos calculados para crear enlaces');
      return [];
    }

    if (isArtifactPresent && isStormPresent) {
      return this.createLinksWithArtifactAndStorm();
    } else if (isArtifactPresent) {
      return this.createLinksWithArtifact();
    } else if (isStormPresent) {
      return this.createLinksWithStorm();
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

  /**
   * Crea enlaces CON tormenta (sin artefacto)
   * Regla: Todos los nodos de columna anterior (violeta + azules + rojos tormenta) se vinculan
   * uno-a-uno con los nodos azules (copias normales) de la siguiente columna
   */
  createLinksWithStorm() {
    const links = [];
    const M = this.stormCount;

    for (let i = 0; i < this.spellsArray.length - 1; i++) {
      const currentColumnTotal = this.spellsArray[i];
      const nextColumnTotal = this.spellsArray[i + 1];
      
      if (nextColumnTotal === 1) continue; // No hay copias en siguiente columna

      // Obtener todos los nodos de la columna actual
      const currentColumnNodes = [];
      
      if (currentColumnTotal === 1) {
        // Solo hay HC inicial
        currentColumnNodes.push(`${NODE_TYPES.INITIAL_SPELL}_${i}`);
      } else {
        // Agregar HC/HD (spell lanzado)
        currentColumnNodes.push(`${NODE_TYPES.CASTED_SPELL}_${i}`);
        
        // Agregar todas las copias normales (C)
        const normalCopies = i; // iteration
        for (let copyIdx = 0; copyIdx < normalCopies; copyIdx++) {
          currentColumnNodes.push(`${NODE_TYPES.COPY}_${i}_${copyIdx}`);
        }
        
        // Agregar todas las copias de tormenta (T)
        const totalStormCopies = i * M;
        for (let stormIdx = 0; stormIdx < totalStormCopies; stormIdx++) {
          currentColumnNodes.push(`${NODE_TYPES.STORM_COPY}_${i}_${stormIdx}`);
        }
      }
      
      // Vincular cada nodo de columna actual con una copia AZUL (C) de columna siguiente
      const nextNormalCopies = i + 1; // Las copias normales de la siguiente columna
      const maxLinks = Math.min(currentColumnNodes.length, nextNormalCopies);
      
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
   * Crea enlaces CON artefacto Y tormenta
   * Regla: Todos los nodos de columna anterior (violeta + azules + verdes + rojos) se vinculan
   * uno-a-uno con los nodos azules (copias normales) de la siguiente columna
   */
  createLinksWithArtifactAndStorm() {
    const links = [];
    const N = this.duplicatorArtifactsCount;
    const M = this.stormCount;

    for (let i = 0; i < this.spellsArray.length - 1; i++) {
      const currentColumnTotal = this.spellsArray[i];
      const nextColumnTotal = this.spellsArray[i + 1];
      
      if (nextColumnTotal === 1) continue; // No hay copias en siguiente columna

      // Obtener todos los nodos de la columna actual (en orden)
      const currentColumnNodes = [];
      
      if (currentColumnTotal === 1) {
        // Solo hay HC inicial
        currentColumnNodes.push(`${NODE_TYPES.INITIAL_SPELL}_${i}`);
      } else {
        // Agregar HC/HD (spell lanzado)
        currentColumnNodes.push(`${NODE_TYPES.CASTED_SPELL}_${i}`);
        
        // Calcular copias de esta columna (índice i)
        const currentTotalStormCopies = i * M;
        const currentTotalStormArtifactCopies = i * M * N;
        
        let normalCopies, artifactCopies;
        
        if (i === 1) {
          normalCopies = 1;
          artifactCopies = N;
        } else {
          const copiesAndArtifact = currentColumnTotal - 1 - currentTotalStormCopies - currentTotalStormArtifactCopies;
          normalCopies = copiesAndArtifact / (N + 1);
          artifactCopies = normalCopies * N;
        }
        
        // Agregar todas las copias normales (C)
        for (let copyIdx = 0; copyIdx < normalCopies; copyIdx++) {
          currentColumnNodes.push(`${NODE_TYPES.COPY}_${i}_${copyIdx}`);
        }
        
        // Agregar todas las copias de artefacto (CA)
        for (let artifactIdx = 0; artifactIdx < artifactCopies; artifactIdx++) {
          currentColumnNodes.push(`${NODE_TYPES.ARTIFACT_COPY}_${i}_${artifactIdx}`);
        }
        
        // Agregar todas las copias de tormenta (T)
        for (let stormIdx = 0; stormIdx < currentTotalStormCopies; stormIdx++) {
          currentColumnNodes.push(`${NODE_TYPES.STORM_COPY}_${i}_${stormIdx}`);
        }
        
        // Agregar todas las copias de artefacto de tormenta (CTA)
        for (let stormArtifactIdx = 0; stormArtifactIdx < currentTotalStormArtifactCopies; stormArtifactIdx++) {
          currentColumnNodes.push(`${NODE_TYPES.STORM_ARTIFACT_COPY}_${i}_${stormArtifactIdx}`);
        }
      }
      
      // Calcular copias normales de la siguiente columna (índice i+1)
      const nextColumnIndex = i + 1;
      const nextTotalStormCopies = nextColumnIndex * M;
      const nextTotalStormArtifactCopies = nextColumnIndex * M * N;
      let nextNormalCopies;
      
      if (nextColumnIndex === 1) {
        nextNormalCopies = 1;
      } else {
        const nextCopiesAndArtifact = nextColumnTotal - 1 - nextTotalStormCopies - nextTotalStormArtifactCopies;
        nextNormalCopies = nextCopiesAndArtifact / (N + 1);
      }
      
      // Vincular cada nodo de columna actual con una copia AZUL (C) de columna siguiente
      // uno-a-uno hasta que se acaben los nodos
      const maxLinks = Math.min(currentColumnNodes.length, nextNormalCopies);
      
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
  const duplicatorEnchantments = Number(document.getElementById('duplicatorEnchantment').value) || 0;
  const duplicatorArtifacts = Number(document.getElementById('duplicatorArtifact').value) || 0;
  const tormentEnchantments = Number(document.getElementById('tormentEnchantment').value) || 0;
  const writeLogs = Boolean(document.getElementById('writeLogs').checked);

  // Calcular daño
  calculator.calculateDamage(
    numberOfSpells,
    damage,
    duplicatorEnchantments,
    duplicatorArtifacts,
    tormentEnchantments,
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
  document.getElementById('totalDamage').textContent = calculator.spellDamage;

  // Actualizar logs
  updateLogs(numberOfSpells);
}

/**
 * Actualiza el contenedor de logs
 */
function updateLogs(numberOfSpells) {
  const duplicatorArtifacts = Number(document.getElementById('duplicatorArtifact').value) || 0;
  const tormentEnchantments = Number(document.getElementById('tormentEnchantment').value) || 0;
  const damage = Number(document.getElementById('damage').value);
  const logContainer = document.getElementById('logContainer');

  logContainer.innerHTML = '';
  logContainer.innerHTML += `Hechizos Lanzados de la mano ${numberOfSpells + 1} (Copiadores ${numberOfSpells} + Lanzado 1)<br>`;
  logContainer.innerHTML += `${LABELS.COPIES}${calculator.numberOfCopies}<br>`;
  
  if (duplicatorArtifacts > 0) {
    logContainer.innerHTML += `${LABELS.ARTIFACT_COPIES}${calculator.duplicatedByArtifact}<br>`;
    logContainer.innerHTML += `Artefactos activos: ${duplicatorArtifacts}<br>`;
  }
  
  if (tormentEnchantments > 0) {
    logContainer.innerHTML += `Copias creadas por tormenta: ${calculator.duplicatedByStorm}<br>`;
    logContainer.innerHTML += `Tormentas activas: ${tormentEnchantments}<br>`;
    
    if (duplicatorArtifacts > 0) {
      logContainer.innerHTML += `Copias de artefacto de tormenta: ${calculator.duplicatedByArtifactForStorm}<br>`;
    }
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

    // Obtener si hay artefacto y tormenta
    const isArtifactPresent = (Number(document.getElementById('duplicatorArtifact').value) || 0) > 0;
    const isStormPresent = (Number(document.getElementById('tormentEnchantment').value) || 0) > 0;

    // Crear nodos y enlaces
    const nodes = calculator.createNodes(isArtifactPresent, isStormPresent);
    const links = calculator.createLinks(isArtifactPresent, isStormPresent);

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

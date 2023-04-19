let spellDamage = 0;
let numberOfCopies = 0;
let finalSpellsQuantityValue = 0;
let duplicatedByArtifact = 0;
let printCopyCalculationLogs = true;
let arrayCiclos = [
  'SinIteracion',
  'Primero',
  'Segundo',
  'Tercero',
  'Cuarto',
  'Quinto',
  'Sexto',
  'Septimo',
];

let mapa = new Map([]);

function graphSpellDamage(
  numberOfCopySpells,
  damage,
  isDuplicatorEnchantmentPresent,
  isFirstSpellOfTurn,
  isArtifactDuplicatorOfDuplicationsPresent
) {
  let finalSpellsQuantityValue = calculateNumberOfCopies(
    numberOfCopySpells,
    isDuplicatorEnchantmentPresent,
    isFirstSpellOfTurn,
    isArtifactDuplicatorOfDuplicationsPresent,
    false
  );

  finalSpellsQuantityValue;
}

function calculateSpellDamage(
  numberOfCopySpells,
  damage,
  isDuplicatorEnchantmentPresent,
  isFirstSpellOfTurn,
  isArtifactDuplicatorOfDuplicationsPresent,
  printDamageCalculationLogs
) {
  let finalSpellsQuantityValue = calculateNumberOfCopies(
    numberOfCopySpells,
    isDuplicatorEnchantmentPresent,
    isFirstSpellOfTurn,
    isArtifactDuplicatorOfDuplicationsPresent,
    false
  );

  spellDamage = finalSpellsQuantityValue * damage;

  if (printDamageCalculationLogs) {
    printDamageDetails(
      damage,
      numberOfCopySpells,
      isArtifactDuplicatorOfDuplicationsPresent
    );
  }

  //Array.from(mapa)[(mapa.size-1)]
  //mapa.get(arrayCiclos[(mapa.size)]).set("HechizoOriginal" + damage)
  console.log(mapa);
  return spellDamage;
}

const CANTIDAD_CICLOS = 'Cantidad de Ciclos ';
const CANTIDAD_COPIAS_ARTEFACTO =
  'Cantidad de copias generadas por el Artefacto en el ultimo ciclo ';
const CANTIDAD_TOTAL_HECHIZOS = 'Cantidad total de Hechizos ';
const CANTIDAD_DE_COPIAS = 'Cantidad de Copias ';

function calculateNumberOfCopies(
  numberOfCopySpells,
  isDuplicatorEnchantmentPresent,
  isFirstSpellOfTurn,
  isArtifactDuplicatorOfDuplicationsPresent,
  printCopyCalculationLogs
) {
  spellDamage = 0;
  numberOfCopies = 0;
  finalSpellsQuantityValue = 0;
  duplicatedByArtifact = 0;
  mapa = new Map([]);

  if (isDuplicatorEnchantmentPresent && isFirstSpellOfTurn) {
    numberOfCopySpells = numberOfCopySpells + 1;
  }

  if (isArtifactDuplicatorOfDuplicationsPresent) {
    calculateSpellDuplicationWithArtifact(numberOfCopySpells);
  } else {
    calculateSpellDuplication(numberOfCopySpells) ;
  }

  finalSpellsQuantityValue = numberOfCopies;

  if (printCopyCalculationLogs) {
    printSpellDetails(
      numberOfCopySpells,
      isArtifactDuplicatorOfDuplicationsPresent
    );
  }

  return finalSpellsQuantityValue;
}

function calculateSpellDuplicationWithArtifact(numberOfCopySpells) {
  console.log('calculateSpellDuplicationWithArtifact');

  let nombreNivel = arrayCiclos[numberOfCopySpells];
  let castedSpell = 1;

  if (numberOfCopySpells === 0) {
    agregarNivel(nombreNivel);
    numberOfCopies = castedSpell;
    agregarItemsAlNivelActualDelMapa(
      numberOfCopySpells,
      nombreNivel,
      numberOfCopies,
      duplicatedByArtifact
    );
  }

  for (let cycleLevel = 1; cycleLevel < numberOfCopySpells + 1; cycleLevel++) {
    nombreNivel = arrayCiclos[cycleLevel];

    if (cycleLevel === 1) {
      agregarNivel(nombreNivel);
      duplicatedByArtifact = cycleLevel;
      numberOfCopies = cycleLevel + duplicatedByArtifact + castedSpell;
      agregarItemsAlNivelActualDelMapa(
        cycleLevel,
        nombreNivel,
        cycleLevel,
        duplicatedByArtifact,
        castedSpell
      );
    } else if (cycleLevel === 2) {
      duplicatedByArtifact = numberOfCopies;
      numberOfCopies = numberOfCopies + duplicatedByArtifact + castedSpell;
      agregarNivel(nombreNivel);
      agregarItemsAlNivelActualDelMapa(
        cycleLevel,
        nombreNivel,
        duplicatedByArtifact,
        duplicatedByArtifact,
        castedSpell
      );
    } else if (cycleLevel >= 3) {
      agregarNivel(nombreNivel);
      duplicatedByArtifact = numberOfCopies;
      numberOfCopies = numberOfCopies * 2 + castedSpell; // numberOfCopies + duplicatedByArtifact
      agregarItemsAlNivelActualDelMapa(
        cycleLevel,
        nombreNivel,
        duplicatedByArtifact,
        duplicatedByArtifact,
        castedSpell
      );
    }
  }
}

function calculateSpellDuplication(numberOfCopySpells) {
  console.log('calculateSpellDuplication');
  numberOfCopies = numberOfCopySpells + 1;
}

function printSpellDetails(
  numberOfCopySpells,
  isArtifactDuplicatorOfDuplicationsPresent
) {
  console.log(
    'Hechizos Lanzados de la mano ' +
      (numberOfCopySpells + 1) +
      (' (Copiadores ' + numberOfCopySpells + ' Otro ' + 1 + ')')
  );
  console.log(CANTIDAD_CICLOS + numberOfCopySpells);

  if (isArtifactDuplicatorOfDuplicationsPresent) {
    console.log(CANTIDAD_COPIAS_ARTEFACTO + duplicatedByArtifact);
  }

  console.log(CANTIDAD_DE_COPIAS + numberOfCopies);
  console.log(CANTIDAD_TOTAL_HECHIZOS + finalSpellsQuantityValue);
}

function printDamageDetails(
  damage,
  numberOfCopySpells,
  isArtifactDuplicatorOfDuplicationsPresent
) {
  console.log(
    'Hechizos Lanzados de la mano ' +
      (numberOfCopySpells + 1) +
      (' (Copiadores ' + numberOfCopySpells + ' Otro ' + 1 + ')')
  );
  console.log(CANTIDAD_CICLOS + numberOfCopySpells);

  if (isArtifactDuplicatorOfDuplicationsPresent) {
    console.log(CANTIDAD_COPIAS_ARTEFACTO + duplicatedByArtifact);
  }
  console.log(CANTIDAD_DE_COPIAS + numberOfCopies);
  console.log(CANTIDAD_TOTAL_HECHIZOS + finalSpellsQuantityValue);
  console.log('Daño Inicial ' + damage + ' Daño Final ' + spellDamage);
}

function agregarNivel(nombreNivel) {
  mapa.set(nombreNivel, new Map([]));
}

function agregarItemsAlNivelActualDelMapa(
  nivel,
  nombreNivel,
  numberOfCopies,
  copiadasDelArtefacto,
  castedSpell
) {
  let currentMap = new Map([]);

  currentMap = mapa.get(nombreNivel);
  for (let i = 0; i < numberOfCopies; i++) {
    let COPIA = 'Copia' + '[' + '(replace)' + ']';

    COPIA = COPIA.replace('(replace)', i);
    currentMap.set(COPIA, COPIA);
  }

  for (let i = 0; i < copiadasDelArtefacto; i++) {
    let COPIA_ARTEFACTO = 'CopiaArtefacto' + '[' + '(replace)' + ']';
    COPIA_ARTEFACTO = COPIA_ARTEFACTO.replace('(replace)', i);
    currentMap.set(COPIA_ARTEFACTO, COPIA_ARTEFACTO);
  }

  for (let i = 0; i < castedSpell; i++) {
    let HECHIZO = 'CastedSpell' + '[' + '(replace)' + ']';
    HECHIZO = HECHIZO.replace('(replace)', nivel);
    currentMap.set(HECHIZO, HECHIZO);
  }
}


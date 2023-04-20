let spellDamage = 0;
let numberOfCopies = 0;
let finalSpellsQuantityValue = 0;
let duplicatedByArtifact = 0;
let printCopyCalculationLogs = true;
let arrayCiclos = [
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
];

let mapa = new Map([]);

function graphSpellDamage() {
  transformMapToObject();
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

    if(mapa.size >0){
      graphSpellDamage();
    }
    
  }

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
    calculateSpellDuplicationWithArtifactGRAPH(numberOfCopySpells);
  } else {
    calculateSpellDuplication(numberOfCopySpells);
  }

  finalSpellsQuantityValue = numberOfCopies;

  if (numberOfCopySpells === 0) {
    finalSpellsQuantityValue = 1;
  }

  if (printCopyCalculationLogs) {
    printSpellDetails(
      numberOfCopySpells,
      isArtifactDuplicatorOfDuplicationsPresent
    );

    if(mapa.size >0){
      graphSpellDamage();
    }
  }

  return finalSpellsQuantityValue;
}

function calculateSpellDuplicationWithArtifactGRAPH(numberOfCopySpells) {
  console.log('calculateSpellDuplicationWithArtifact');

  let castedSpell = 1;
  mapa = new Map([]);

  if (numberOfCopySpells === 0) {
    let nombreNivel = numberOfCopySpells.toString();
    agregarNivel(nombreNivel);
    agregarItemsAlNivelActualDelMapa(
      numberOfCopySpells,
      nombreNivel,
      numberOfCopies,
      duplicatedByArtifact,
      castedSpell
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
    } else if (cycleLevel >= 2) {
      duplicatedByArtifact = numberOfCopies;
      agregarNivel(nombreNivel);
      agregarItemsAlNivelActualDelMapa(
        cycleLevel,
        nombreNivel,
        numberOfCopies,
        duplicatedByArtifact,
        castedSpell
      );
      numberOfCopies = numberOfCopies * 2 + castedSpell;
    }
  }
}

function calculateSpellDuplicationWithArtifact2(numberOfCopySpells) {
  console.log('calculateSpellDuplicationWithArtifact');

  let castedSpell = 1;

  for (let cycleLevel = 1; cycleLevel < numberOfCopySpells + 1; cycleLevel++) {
    nombreNivel = arrayCiclos[cycleLevel];
    if (cycleLevel === 1) {
      duplicatedByArtifact = cycleLevel;
      numberOfCopies = cycleLevel + duplicatedByArtifact + castedSpell;
    } else if (cycleLevel >= 2) {
      duplicatedByArtifact = numberOfCopies;
      numberOfCopies = numberOfCopies * 2 + castedSpell;
    }
  }
}

function calculateSpellDuplicationWithArtifact3(numberOfCopySpells) {
  console.log('calculateSpellDuplicationWithArtifact');

  let exponente = numberOfCopySpells + 1;

  numberOfCopies = Math.pow(2, exponente) - 1;

  duplicatedByArtifact = (numberOfCopies - 1)/2 ;
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

/**
 * Transforms the mapa into a object
 * And returns it.
 *
 * @returns objectified global variable mapa.
 */
function transformMapToObject() {
  /** Transform main Map into object */
  let obj = Array.from(mapa);

  /** Transform submap into object and set it to obj */
  for (let i = 0; i < mapa.size + 1; i++) {
    try {
      let internalObj = Array.from(mapa.get(arrayCiclos[i]));

      //clean duplitaded pair keyvalues
      for (let i = 0; i < internalObj.length; i++) {
        internalObj[i] = internalObj[i][0]; //select first element
      }

      if (i > 0) {
        let varToSearch = i - 1;
        obj[varToSearch] = internalObj;
      } else {
        obj[i] = internalObj;
      }
    } catch (error) {
      console.log('Search for object ' + i + ' is undefined ErrorMessage: ' + error);
    }
  }

  console.log(obj);
  window.arrayFromMap = obj;
  return obj;
}

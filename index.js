let spellDamage = 0;
let numberOfCopies = 0;
let finalSpellsQuantityValue = 0;
let duplicatedByArtifact = 0;
let printCopyCalculationLogs = true;
let arrayCiclos = ["Vacio","Primero", "Segundo", "Tercero","Cuarto","Quinto","Sexto","Septimo"]

let mapa = new Map([])

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
  mapa.get(arrayCiclos[(mapa.size)]).set("HechizoOriginal" + damage)
  console.log(mapa) ; 
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
  mapa = new Map([]) ;

  if (isDuplicatorEnchantmentPresent && isFirstSpellOfTurn) {
    numberOfCopySpells = numberOfCopySpells + 1;
  }

  if (isArtifactDuplicatorOfDuplicationsPresent) {
    calculateSpellDuplicationWithArtifact(numberOfCopySpells);
  } else {
    numberOfCopies = numberOfCopySpells;
  }

  //Sumo el hechizo inicial
  finalSpellsQuantityValue = numberOfCopies + 1;

  if (printCopyCalculationLogs) {
    printSpellDetails(
      numberOfCopySpells,
      isArtifactDuplicatorOfDuplicationsPresent
    );
  }

  return finalSpellsQuantityValue;
}

function calculateSpellDuplicationWithArtifact(numberOfCopySpells) {
  console.log("calculateSpellDuplicationWithArtifact")
  for (let cycleLevel = 1; cycleLevel < numberOfCopySpells + 1; cycleLevel++) {

    let nombreNivel = arrayCiclos[cycleLevel] ; 


    if (cycleLevel === 1) {
      agregarNivel(nombreNivel)
      duplicatedByArtifact = cycleLevel;
      numberOfCopies = cycleLevel + duplicatedByArtifact;
      agregarItemsAlNivelActualDelMapa(cycleLevel,nombreNivel, cycleLevel,duplicatedByArtifact)
    } else if (cycleLevel === 2) {
      duplicatedByArtifact = 1;
      numberOfCopies = cycleLevel + duplicatedByArtifact;
      agregarNivel(nombreNivel)
      agregarItemsAlNivelActualDelMapa(cycleLevel,nombreNivel, cycleLevel,duplicatedByArtifact)
    } else if (cycleLevel >= 3) {
      agregarNivel(nombreNivel)
      duplicatedByArtifact = numberOfCopies;
      numberOfCopies = numberOfCopies * 2; // numberOfCopies + duplicatedByArtifact
      agregarItemsAlNivelActualDelMapa(cycleLevel,nombreNivel, duplicatedByArtifact,duplicatedByArtifact)
    }
  }
}

function calculateSpellDuplication(numberOfCopySpells) {
  console.log("calculateSpellDuplication")
    numberOfCopies = numberOfCopySpells;
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
  mapa.set(nombreNivel, new Map([]))
}

function agregarItemsAlNivelActualDelMapa(nivel, nombreNivel,numberOfCopies, copiadasDelArtefacto ) {
  let currentMap = new Map([]) ;  
  currentMap  = mapa.get(nombreNivel);
  for (let i = 0; i < numberOfCopies; i++) {
    currentMap.set(arrayCiclos[nivel] + "[" + i + "]",arrayCiclos[nivel] +  "[" + i + "]")

  }

  for (let i = 0; i < copiadasDelArtefacto; i++) {
    currentMap.set( "CopiaDe" + arrayCiclos[nivel] + "[" + i + "]" + "CopiaDe" + arrayCiclos[nivel] +  "[" + i + "]")
  }
}
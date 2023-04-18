let spellDamage = 0;
let numberOfCopies = 0;
let finalSpellsQuantityValue = 0;
let duplicatedByArtifact = 0;
let printCopyCalculationLogs = true;

function calculateSpellDamage(
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

  spellDamage = finalSpellsQuantityValue * damage;
  printDamageDetails(damage, numberOfCopySpells);

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

  if (isDuplicatorEnchantmentPresent && isFirstSpellOfTurn) {
    numberOfCopySpells = numberOfCopySpells + 1;
  }

  if (isArtifactDuplicatorOfDuplicationsPresent) {
    for (
      let cycleLevel = 1;
      cycleLevel < numberOfCopySpells + 1;
      cycleLevel++
    ) {
      if (cycleLevel === 1 && numberOfCopySpells === 1) {
        duplicatedByArtifact = 1;
        numberOfCopies = cycleLevel + duplicatedByArtifact;
      } else if (cycleLevel === 2) {
        duplicatedByArtifact = 1;
        numberOfCopies = cycleLevel + duplicatedByArtifact;
      } else if (cycleLevel >= 3) {
        duplicatedByArtifact = numberOfCopies;
        numberOfCopies = numberOfCopies + duplicatedByArtifact;
      }
    }
  } else {
    // asignar numero de copias
    numberOfCopies = numberOfCopySpells;
  }

  //Sumo el hechizo inicial
  finalSpellsQuantityValue = numberOfCopies + 1;

  if (printCopyCalculationLogs) {
    printSpellDetails(numberOfCopySpells);
  }

  return finalSpellsQuantityValue;
}

function printSpellDetails(numberOfCopySpells) {
  console.log(CANTIDAD_CICLOS + numberOfCopySpells);
  console.log(CANTIDAD_COPIAS_ARTEFACTO + duplicatedByArtifact);
  console.log(CANTIDAD_DE_COPIAS + numberOfCopies);
  console.log(CANTIDAD_TOTAL_HECHIZOS + finalSpellsQuantityValue);
}

function printDamageDetails(damage, numberOfCopySpells) {
  console.log(CANTIDAD_CICLOS + numberOfCopySpells);
  console.log(CANTIDAD_COPIAS_ARTEFACTO + duplicatedByArtifact);
  console.log(CANTIDAD_DE_COPIAS + numberOfCopies);
  console.log(CANTIDAD_TOTAL_HECHIZOS + finalSpellsQuantityValue);
  console.log('Daño Inicial ' + damage + ' Daño Final ' + spellDamage);
}

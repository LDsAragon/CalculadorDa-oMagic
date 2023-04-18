function calculateSpellDamage(
  numberOfCopySpells,
  damage,
  isDuplicatorEnchantmentPresent,
  isFirstSpellOfTurn,
  isArtifactDuplicatorOfDuplicationsPresent
) {
  return (
    numberOfCopies(
      numberOfCopySpells,
      damage,
      isDuplicatorEnchantmentPresent,
      isFirstSpellOfTurn,
      isArtifactDuplicatorOfDuplicationsPresent
    ) * damage
  );
}

const CANTIDAD_CICLOS = 'Cantidad de Ciclos ';
const CANTIDAD_COPIAS_ARTEFACTO =
  'Cantidad de copias generadas por el Artefacto en el ultimo ciclo ';
const CANTIDAD_TOTAL_HECHIZOS = 'Cantidad total de Hechizos ';
const CANTIDAD_DE_COPIAS = 'Cantidad de Copias ';

function numberOfCopies(
  numberOfCopySpells,
  damage,
  isDuplicatorEnchantmentPresent,
  isFirstSpellOfTurn,
  isArtifactDuplicatorOfDuplicationsPresent
) {
  let spellDamage = 0;
  let numberOfCopies = 0;
  let finalSpellsQuantityValue = 0;
  let duplicatedByArtifact = 0;
  let result;

  if (isDuplicatorEnchantmentPresent && isFirstSpellOfTurn) {
    numberOfCopySpells = numberOfCopySpells + 1;
  }

  if (isArtifactDuplicatorOfDuplicationsPresent) {
    for (
      let horizontalidad = 1;
      horizontalidad < numberOfCopySpells + 1;
      horizontalidad++
    ) {
      if (horizontalidad === 1 && numberOfCopySpells === 1) {
        duplicatedByArtifact = 1;
        numberOfCopies = horizontalidad + duplicatedByArtifact;
      } else if (horizontalidad === 2) {
        duplicatedByArtifact = 1;
        numberOfCopies = horizontalidad + duplicatedByArtifact;
      } else if (horizontalidad >= 3) {
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

  if (damage === 0) {
    console.log(CANTIDAD_CICLOS + numberOfCopySpells);
    console.log(CANTIDAD_COPIAS_ARTEFACTO + duplicatedByArtifact);
    console.log(CANTIDAD_DE_COPIAS + numberOfCopies);
    console.log(CANTIDAD_TOTAL_HECHIZOS + finalSpellsQuantityValue);

    result = finalSpellsQuantityValue;
  } else {
    spellDamage = finalSpellsQuantityValue * damage;

    console.log(CANTIDAD_CICLOS + numberOfCopySpells);
    console.log(CANTIDAD_COPIAS_ARTEFACTO + duplicatedByArtifact);
    console.log(CANTIDAD_DE_COPIAS + numberOfCopies);
    console.log(CANTIDAD_TOTAL_HECHIZOS + finalSpellsQuantityValue);
    console.log('Daño Inicial ' + damage + ' Daño Final ' + spellDamage);
  }

  return finalSpellsQuantityValue;
}

let spellDamage = 0;
let numberOfCopies = 0;
let finalSpellsQuantityValue = 0;
let duplicatedByArtifact = 0;
let printCopyCalculationLogs = true;
let numeroDeHehizos;

function init() {
  const $ = go.GraphObject.make; // for conciseness in defining templates

  try {
    myDiagram = $(go.Diagram, 'myDiagramDiv', {
      'undoManager.isEnabled': true,
    });
  } catch (error) {
    console.log('Error :' + error);
    console.log('Cleaning Div');
    myDiagram.div = null;
    console.clear();
    init();
  }

  // define the "sample" Node template
  myDiagram.nodeTemplate = $(
    go.Node,
    'Auto',
    new go.Binding('location').makeTwoWay(),
    $(
      go.Shape,
      'RoundedRectangle', // define the node's outer shape
      { fill: 'white', strokeWidth: 0 },
      new go.Binding('fill', 'color')
    ),
    $(
      go.TextBlock, // define the node's text
      { margin: 5 },
      new go.Binding('text', 'key')
    )
  );

  myDiagram.linkTemplate = $(
    go.Link,
    go.Link.Bezier,
    $(go.Shape, { strokeWidth: 1.5 }),
    $(go.Shape, { toArrow: 'Standard' })
  );

  myDiagram.layout = new go.Layout();

  myDiagram.model = new go.GraphLinksModel(
    createArrayOfNodes(formsArray),
    createArrayOfLinks(formsArray)
  );
}

function graphSpellDamage(
  numberOfCopySpells,
  damage,
  isDuplicatorEnchantmentPresent,
  isFirstSpellOfTurn,
  isArtifactDuplicatorOfDuplicationsPresent,
  printDamageCalculationLogs
) {
  calculateSpellDamage(
    numberOfCopySpells,
    damage,
    isDuplicatorEnchantmentPresent,
    isFirstSpellOfTurn,
    isArtifactDuplicatorOfDuplicationsPresent,
    printDamageCalculationLogs
  );

  let formsArray = [];
  for (let i = 0; i < numberOfCopySpells + 1; i++) {
    let emptyArray = [];
    formsArray.push([emptyArray]);
    if (isArtifactDuplicatorOfDuplicationsPresent) {
      numeroDeHehizos = calculateSpellDuplicationWithArtifact(i);
    } else {
      numeroDeHehizos = calculateSpellDuplication(i);
    }
    formsArray[i] = numeroDeHehizos;
  }
  console.log(formsArray);
  window.formsArray = formsArray;
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
    calculateSpellDuplicationWithArtifact(numberOfCopySpells);
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
  }

  return finalSpellsQuantityValue;
}

function calculateSpellDuplicationWithArtifact(numberOfCopySpells) {
  //console.log('calculateSpellDuplicationWithArtifact');

  let exponente = numberOfCopySpells + 1;

  numberOfCopies = Math.pow(2, exponente) - 1;

  duplicatedByArtifact = (numberOfCopies - 1) / 2;

  return numberOfCopies;
}

function calculateSpellDuplication(numberOfCopySpells) {
  //console.log('calculateSpellDuplication');
  numberOfCopies = numberOfCopySpells + 1;
  return numberOfCopies;
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

function createArrayOfNodes(formsArray) {
  let originalXPosition = 100;
  let originalYPosition = 0;
  let nodes = [];

  for (let i = 0; i < formsArray.length; i++) {
    let numeroCopias = formsArray[i];

    if (numeroCopias === 1) {
      numeroCopias = 0;
      nodes.push({
        key: 'HC',
        color: 'orange',
        location: new go.Point(originalXPosition + 100, originalYPosition),
      });
    } else {
      numeroCopias = (formsArray[i] - 1) / 2;

      let contador = 30;
      let variadorX;
      let lugarPrevio;
      for (let z = 0; z < numeroCopias; z++) {
        variadorX = i * 100;

        lugarPrevio = originalYPosition + contador;

        nodes.push({
          key: 'C',
          color: 'blue',
          location: new go.Point(
            originalXPosition + 85 + variadorX,
            originalYPosition + contador
          ),
        });
        contador = lugarPrevio + 30;
      }
      for (let z = 0; z < numeroCopias; z++) {
        variadorX = i * 100;
        lugarPrevio = originalYPosition + contador;
        nodes.push({
          key: 'CA',
          color: 'green',
          location: new go.Point(
            originalXPosition + 85 + variadorX,
            originalYPosition + contador
          ),
        });
        contador = lugarPrevio + 30;
      }
      contador = 30;
      nodes.push({
        key: 'HC/HD',
        color: 'purple',
        location: new go.Point(
          originalXPosition + 90 + variadorX,
          originalYPosition - 10
        ),
      });
    }
  }

  console.log(nodes);
  return nodes;
}

function createArrayOfLinks(formsArray) {
  let links = [];
  let ultimoIndice = 1;
  let contadorC = 0;
  let contadorCA = 0;
  let ultimoIndiceDer = 0;
  let ultimoIndiceIzquierda = 1;

  for (let i = 0; i < formsArray.length - 1; i++) {
    let numeroCopias = formsArray[i];
    let doOnce = true;
    let doOnce2 = true;
    if (numeroCopias === 1) {
      links.push({ from: 'HC', to: 'HC/HD' });
      links.push({ from: 'HC', to: 'C' });
      links.push({ from: 'HC', to: 'CA' });
      ultimoIndiceDer = 1;
    } else if (numeroCopias === 3) {
      doOnce = true;
      for (let z = 1; z < numeroCopias; z++) {
        while (doOnce) {
          links.push({
            from: 'HC/HD',
            to: 'C' + (ultimoIndiceDer + 1),
          });
          doOnce = false;
          ultimoIndiceDer = ultimoIndiceDer + 1;
        }
        if (z % 2 == 0) {
          links.push({
            from: 'CA',
            to: 'C' + (ultimoIndiceDer + 1),
          });
          ultimoIndiceDer = ultimoIndiceDer + 1;
        } else {
          links.push({
            from: 'C',
            to: 'C' + (ultimoIndiceDer + 1),
          });
          ultimoIndiceDer = ultimoIndiceDer + 1;
        }
      }
      doOnce = true;
    } else {
      for (let z = 1; z < numeroCopias; z++) {
        console.log('numeroCopias : ' + numeroCopias);
        while (doOnce) {
          links.push({
            from: 'HC/HD' + i,
            to: 'C' + (ultimoIndiceDer + 1),
          });
          doOnce = false;
          ultimoIndiceDer = ultimoIndiceDer + 1;
          ultimoIndiceIzquierda = ultimoIndice;
        }
        if (z < numeroCopias / 2) {
          links.push({
            from: 'C' + (ultimoIndiceIzquierda + 1),
            to: 'C' + (ultimoIndiceDer + 1),
          });
          ultimoIndiceIzquierda = ultimoIndiceIzquierda + 1;
        } else {
          while (doOnce2) {
            doOnce2 = false;
            ultimoIndiceIzquierda = ultimoIndice;
          }
          console.log('ultimoIndiceIzquierda: ' + ultimoIndiceIzquierda);
          links.push({
            from: 'CA' + (ultimoIndiceIzquierda + 1),
            to: 'C' + (ultimoIndiceDer + 1),
          });
          ultimoIndiceIzquierda = ultimoIndiceIzquierda + 1;
        }
        ultimoIndiceDer = ultimoIndiceDer + 1;
      }
      ultimoIndice = (numeroCopias - 1) / 2 + 1;
      doOnce = true;
      doOnce2 = true;
    }
    //ultimoIndice = ((numeroCopias - 1) / 2) +1;
  }

  console.log(links);
  return links;
}

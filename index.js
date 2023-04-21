let spellDamage = 0;
let numberOfCopies = 0;
let finalSpellsQuantityValue = 0;
let duplicatedByArtifact = 0;
let printCopyCalculationLogs = true;
let numeroDeHehizos;

function init() {
  const $ = go.GraphObject.make; // for conciseness in defining templates

  myDiagram = $(go.Diagram, 'myDiagramDiv', {
    'undoManager.isEnabled': true,
  });

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

  myDiagram.layout = new go.Layout()
  myDiagram.model = new go.GraphLinksModel( createArrayOfNodes(formsArray) );
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
  let links = [];

  
  for (let i = 0; i < formsArray.length; i++) {
    let numeroCopias = formsArray[i];
    
      if (numeroCopias === 1) {
        numeroCopias = 0
        nodes.push({ key: 'HC', color: 'orange', location: new go.Point(originalXPosition+100, originalYPosition) }) ;
      } else {
        numeroCopias = (formsArray[i] - 1) / 2;
    
        let contador = 30 ;   
        let variadorX ; 
        let lugarPrevio = 30
      for (let z = 0; z < numeroCopias; z++) {

        variadorX = i * 100 ;
        variadorY = i * 30 ;        

        // console.log("variadorX: " + variadorX);
        lugarPrevio = originalYPosition + contador
        // console.log("lugarPrevio : " + lugarPrevio)

        nodes.push({key: 'C',color: 'blue',location: new go.Point(originalXPosition + 85 + variadorX, originalYPosition + contador)  });
        nodes.push({ key: 'CA', color: 'green', location: new go.Point(originalXPosition +125 + variadorX, originalYPosition + contador) });
        contador = lugarPrevio + 30 ; 
      }
      contador = 30
      nodes.push({ key: 'HC/HD', color: 'purple', location: new go.Point(originalXPosition +90 +variadorX, originalYPosition - 10)  });
    }
  }

  console.log(nodes)
  return nodes ; 
}

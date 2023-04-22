const CANTIDAD_CICLOS = 'Cantidad de Ciclos ';
const CANTIDAD_COPIAS_ARTEFACTO =
  'Cantidad de copias generadas por el Artefacto en el ultimo ciclo ';
const CANTIDAD_TOTAL_HECHIZOS = 'Cantidad total de Hechizos ';
const CANTIDAD_DE_COPIAS = 'Cantidad de Copias ';
let spellDamage = 0;
let numberOfCopies = 0;
let finalSpellsQuantityValue = 0;
let duplicatedByArtifact = 0;
let printCopyCalculationLogs = true;
let numeroDeHehizos;
let isArtifactDuplicatorPresent = false;
let isStormDuplicatorPresent = false;
let formsArray = undefined;
let stormArray = undefined;
let stormArtifact = undefined;
let duplicatedByStorm = 0;
let duplicatedByArtifactForStorm = 0;

function calculateDamageToGraph() {
  calculateDrawData(
    Number(document.getElementById('numberOFSpells').value),
    Number(document.getElementById('damage').value),
    Boolean(document.getElementById('duplicatorEnchantment').checked),
    Boolean(document.getElementById('firstTurn').checked),
    Boolean(document.getElementById('duplicatorArtifact').checked),
    Boolean(document.getElementById('tormentEnchantment').checked),
    Boolean(document.getElementById('writeLogs').checked)
  );

  draw();
}

function draw() {
  const $ = go.GraphObject.make; // for conciseness in defining templates

  try {
    myDiagram = $(go.Diagram, 'myDiagramDiv', {
      'undoManager.isEnabled': true,
    });

    if (formsArray === undefined) {
      console.log('There was no calculation done, there is nothing to draw');
      return;
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

    let nodesArray;
    let linksArray;

    if (isArtifactDuplicatorPresent = isStormDuplicatorPresent) {
      //linksArray = createArrayOfLinksArtifactStorm(formsArray); //TODO
      //nodesArray = createArrayOfNodesArticaftStorm(formsArray); //TODO
    }
    else if (isArtifactDuplicatorPresent) {
      nodesArray = createArrayOfNodesArticaft(formsArray);
      linksArray = createArrayOfLinksArtifact(formsArray);
    } else if (isStormDuplicatorPresent){
      //nodesArray = createArrayOfNodesStorm(formsArray); //TODO
      //linksArray = createArrayOfLinksStorm(formsArray); //TODO
    } else
    {
      nodesArray = createArrayOfNodes(formsArray);
      linksArray = createArrayOfLinks(formsArray);
    }

    myDiagram.model = new go.GraphLinksModel(nodesArray, linksArray);
  } catch (error) {
    //console.log('Error :' + error);
    console.log('Cleaning Div');
    myDiagram.div = null;
    //console.clear();
    //draw();
  }
}

function deleteDiagram() {
  try {
    myDiagram.div = null;
    console.log('Deleting diagram! ');
  } catch (error) {
    //console.log('Error :' + error);
    console.log('There is no diagram to delete. First calculate, then draw');
  }
}

function calculateDrawData(
  numberOfCopySpells,
  damage,
  isDuplicatorEnchantmentPresent,
  isFirstSpellOfTurn,
  isArtifactDuplicatorOfDuplicationsPresent,
  isStormEnchantmentPresent,
  printDamageCalculationLogs
) {
  spellDamage = calculateSpellDamage(
    numberOfCopySpells,
    damage,
    isDuplicatorEnchantmentPresent,
    isFirstSpellOfTurn,
    isArtifactDuplicatorOfDuplicationsPresent,
    isStormEnchantmentPresent,
    printDamageCalculationLogs
  );

  document.getElementById('castedSpells').textContent = numberOfCopySpells + 1;
  document.getElementById('copiedSpells').textContent = numberOfCopies;
  document.getElementById('generatedByArtifact').textContent =
    duplicatedByArtifact;
  document.getElementById('initialDamage').textContent = damage;
  document.getElementById('totalDamage').textContent = spellDamage;

  if (printDamageCalculationLogs) {
    console.log("Array de los hechizos jugados+copiados");
    console.log(formsArray);
    console.log("Array de los copiados por tormenta");
    console.log(stormArray);
    console.log("Array de los duplicados por artefacto de la copia de tormenta");
    console.log(stormArtifact);
  }
}

function calculateSpellDamage(
  numberOfCopySpells,
  damage,
  isDuplicatorEnchantmentPresent,
  isFirstSpellOfTurn,
  isArtifactDuplicatorOfDuplicationsPresent,
  isStormEnchantmentPresent,
  printDamageCalculationLogs
) {
  let finalSpellsQuantityValue = calculateNumberOfCopies(
    numberOfCopySpells,
    isDuplicatorEnchantmentPresent,
    isFirstSpellOfTurn,
    isArtifactDuplicatorOfDuplicationsPresent,
    isStormEnchantmentPresent,
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

function calculateNumberOfCopies(
  numberOfCopySpells,
  isDuplicatorEnchantmentPresent,
  isFirstSpellOfTurn,
  isArtifactDuplicatorOfDuplicationsPresent,
  isStormEnchantmentPresent,
  printCopyCalculationLogs
) {
  spellDamage = 0;
  numberOfCopies = 0;
  finalSpellsQuantityValue = 0;
  duplicatedByArtifact = 0;
  isArtifactDuplicatorPresent = isArtifactDuplicatorOfDuplicationsPresent;
  isStormDuplicatorPresent = isStormEnchantmentPresent;

  if (isDuplicatorEnchantmentPresent && isFirstSpellOfTurn) {
    numberOfCopySpells = numberOfCopySpells + 1;
  }

  formsArray = [];
  stormArray = [];
  stormArtifact = [];
  for (let i = 0; i < numberOfCopySpells + 1; i++) {
    let emptyArray = [];

    if (
      isArtifactDuplicatorOfDuplicationsPresent &&
      isStormEnchantmentPresent
    ) {
      var object = calculateSpellDuplicationWithArtifactAcountingForStorm(i)
      formsArray[i] = object.numberOfCopies;
      stormArray[i] = object.duplicatedByStorm;
      stormArtifact[i] = object.duplicatedByArtifactForStorm;
    } else if (isArtifactDuplicatorOfDuplicationsPresent) {
      formsArray[i] = calculateSpellDuplicationWithArtifact(i);
    } else {
      formsArray[i] = calculateSpellDuplication(i);
    }
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

function calculateSpellDuplicationWithArtifactAcountingForStorm(
  currentSpellCasted
) {
  let castedSpell = 1;

  let stormDuplication = currentSpellCasted - 1;
  if (currentSpellCasted === 0) {
    numberOfCopies = 1
  } else if (currentSpellCasted === 1) {
    duplicatedByArtifact = currentSpellCasted;
    numberOfCopies =
      currentSpellCasted +
      duplicatedByArtifact +
      castedSpell +
      stormDuplication * 2;
  } else if (currentSpellCasted >= 2) {
    duplicatedByArtifact = numberOfCopies;
    duplicatedByStorm = stormDuplication;
    duplicatedByArtifactForStorm = stormDuplication;
    stormArray;
    numberOfCopies = numberOfCopies * 2 + castedSpell + stormDuplication * 2;
  }

  return {
    numberOfCopies: numberOfCopies,
    duplicatedByStorm: duplicatedByStorm,
    duplicatedByArtifactForStorm: duplicatedByArtifactForStorm,
  };
}

function calculateSpellDuplicationWithArtifact(numberOfCopySpells) {
  let exponente = numberOfCopySpells + 1;

  numberOfCopies = Math.pow(2, exponente) - 1;

  duplicatedByArtifact = (numberOfCopies - 1) / 2;

  return numberOfCopies;
}

function calculateSpellDuplication(numberOfCopySpells) {
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
  console.log(CANTIDAD_DE_COPIAS + " creadas por tormenta "+ duplicatedByStorm);
  console.log(CANTIDAD_DE_COPIAS + " creadas por el artefacto tras tormenta "+ duplicatedByArtifactForStorm);
  console.log(CANTIDAD_TOTAL_HECHIZOS + finalSpellsQuantityValue);
  console.log('Daño Inicial ' + damage + ' Daño Final ' + spellDamage);
}

function createArrayOfNodesArticaft(formsArray) {
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
        location: new go.Point(originalXPosition + 100, originalYPosition - 10),
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
          originalXPosition + 80 + variadorX,
          originalYPosition - 10
        ),
      });
    }
  }

  console.log(nodes);
  return nodes;
}

function createArrayOfLinksArtifact(formsArray) {
  let links = [];
  let ultimoIndice = 1;
  let ultimoIndiceDer = 0;
  let ultimoIndiceIzquierda = 1;

  for (let i = 0; i < formsArray.length - 1; i++) {
    let numeroCopias = formsArray[i];
    let doOnce = true;
    let doOnce2 = true;
    if (numeroCopias === 1) {
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
        } else if (z > numeroCopias / 2) {
          while (doOnce2) {
            doOnce2 = false;
            ultimoIndiceIzquierda = ultimoIndice;
          }
          links.push({
            from: 'CA' + (ultimoIndiceIzquierda + 1),
            to: 'C' + (ultimoIndiceDer + 1),
          });
          ultimoIndiceIzquierda = ultimoIndiceIzquierda + 1;
        }
        ultimoIndiceDer = ultimoIndiceDer + 1;
      }
      ultimoIndice = ultimoIndiceIzquierda;
      doOnce = true;
      doOnce2 = true;
    }
  }

  console.log(links);
  return links;
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
        location: new go.Point(originalXPosition + 100, originalYPosition - 10),
      });
    } else {
      let contador = 30;
      let variadorX;
      let lugarPrevio;
      for (let z = 0; z < numeroCopias - 1; z++) {
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
      contador = 30;
      nodes.push({
        key: 'HC/HD',
        color: 'purple',
        location: new go.Point(
          originalXPosition + 80 + variadorX,
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
  let ultimoIndiceDer = 0;
  let ultimoIndiceIzquierda = 1;

  for (let i = 0; i < formsArray.length - 1; i++) {
    let numeroCopias = formsArray[i];
    let doOnce = true;
    let doOnce2 = true;
    if (numeroCopias === 1) {
      links.push({ from: 'HC', to: 'C' });
      ultimoIndiceDer = 1;
    } else if (numeroCopias === 2) {
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

        links.push({
          from: 'C',
          to: 'C' + (ultimoIndiceDer + 1),
        });
        ultimoIndiceDer = ultimoIndiceDer + 1;
      }
      doOnce = true;
    } else {
      for (let z = 1; z < numeroCopias; z++) {
        while (doOnce) {
          links.push({
            from: 'HC/HD' + i,
            to: 'C' + (ultimoIndiceDer + 1),
          });
          doOnce = false;
          ultimoIndiceDer = ultimoIndiceDer + 1;
          ultimoIndiceIzquierda = ultimoIndice;
        }
        if (z < numeroCopias) {
          links.push({
            from: 'C' + (ultimoIndiceIzquierda + 1),
            to: 'C' + (ultimoIndiceDer + 1),
          });
          ultimoIndiceIzquierda = ultimoIndiceIzquierda + 1;
        }
        ultimoIndiceDer = ultimoIndiceDer + 1;
      }
      ultimoIndice = ultimoIndiceIzquierda;
      doOnce = true;
      doOnce2 = true;
    }
  }

  console.log(links);
  return links;
}

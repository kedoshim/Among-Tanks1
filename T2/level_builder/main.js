const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const START_SCROLL_X_PERCENTAGE = 0.05;
document.addEventListener("contextmenu", function (event) {
  // Previna o comportamento padrão do navegador
  event.preventDefault();
});

class LevelBuilder extends Phaser.Scene {
  preload() {
    this.mousePos = { x: 0, y: 0 };
    this.cameraRefVertical = 0;
    this.currentScrollX = 0;
    this.currentScrollY = 0;
    this.selectedColor = 0x0000ff;
    this.gameWidth = window.innerWidth;
    this.rightButtonIsPressed = false;
    this.gameHeight = window.innerHeight;
    this.blocksArray = [];
    this.gridMouseIndex = {};
    this.mouseIsPressed = false;
    this.colorsData = {};
    this.fetchConfig();
    console.log(this.colorsData);
    this.blocksSelection = [];
    this.tiles = [];
    this.selectedBlock = new EmptyBlock();
    this.availableBlocks = {
      empty_block: () => {
        const block = new EmptyBlock();
        return block;
      },
      ground_block: () => {
        const block = new GroundBlock();
        block.convertColors(
          this.colorsData["ground_block"].r,
          this.colorsData["ground_block"].g,
          this.colorsData["ground_block"].b
        );
        return block;
      },
      collisor: () => {
        const block = new WallBlock();
        block.convertColors(
          this.colorsData["collisor"].r,
          this.colorsData["collisor"].g,
          this.colorsData["collisor"].b
        );
        return block;
      },
      spawn: () => {
        const block = new SpawnBlock();
        block.convertColors(
          this.colorsData["spawn"].r,
          this.colorsData["spawn"].g,
          this.colorsData["spawn"].b
        );
        return block;
      },
      directionalLight: () => {
        const block = new DirectionalLight();
        block.convertColors(
          this.colorsData["directional_light"].r,
          this.colorsData["directional_light"].g,
          this.colorsData["directional_light"].b
        )
        return block;
      }
    };
  }

  calculateGridIndex(mouseX, mouseY, tileSize) {
    const i = Math.floor(mouseX / tileSize);
    const j = Math.floor(mouseY / tileSize);
    return { i, j };
  }

  createModal() {
      const modal = this.rexUI.add.dialog({
          x: this.cameras.main.width / 2,
          y: this.cameras.main.height / 2,
          width: 300,

          background: this.add.rectangle(0, 0, 300, 200, 0x4e342e),

          title: this.rexUI.add.label({
              text: this.add.text(0, 0, 'Título do Modal', {
                  fontSize: '20px'
              }),
              space: { left: 10, right: 10, top: 10, bottom: 10 }
          }),

          content: this.add.text(0, 0, 'Este é o conteúdo do modal.', {
              fontSize: '16px'
          }),

          actions: [
              this.rexUI.add.label({
                  text: this.add.text(0, 0, 'OK', {
                      fontSize: '16px'
                  }),
                  space: { left: 10, right: 10, top: 10, bottom: 10 }
              }),
              this.rexUI.add.label({
                  text: this.add.text(0, 0, 'Cancel', {
                      fontSize: '16px'
                  }),
                  space: { left: 10, right: 10, top: 10, bottom: 10 }
              })
          ],

          space: {
              title: 25,
              content: 25,
              action: 15,
              left: 10,
              right: 10,
              top: 10,
              bottom: 10
          },

          align: {
              actions: 'right'
          }
      })
      .layout()
      .popUp(500);

      modal.on('button.click', (button, groupName, index) => {
          console.log(`Button ${button.text} clicked`);
          modal.scaleDownDestroy(100);
      });
  }

  createGrid(tileSize) {
    const numRows = Math.ceil(4000 / tileSize); // Número de linhas baseado na altura do jogo
    const numCols = Math.ceil(3240 / tileSize); // Número de colunas baseado na largura do jogo

    // Criar um grupo para os tiles do grid
    this.gridGroup = this.add.group();

    // Loop para criar o grid
    for (let i = 0; i < numCols; i++) {
      this.blocksArray.push([]);
      this.tiles.push([]);
      for (let j = 0; j < numRows; j++) {
        // Calcular as coordenadas x e y do tile atual
        const x = i * tileSize;
        const y = j * tileSize;


        // Criar um retângulo para representar o tile
        const tile = this.add.rectangle(x, y, tileSize, tileSize, 0xffffff);
        tile.setStrokeStyle(1, 0xaaaaaa); // Adicionar uma borda branca ao tile

        // Adicionar o tile ao grupo do grid
        this.gridGroup.add(tile);
        this.tiles[i].push(tile);
        this.blocksArray[i].push(new EmptyBlock());

        tile.setInteractive(); // Habilitar interatividade com o tile

        tile.on("pointerover", () => {
          tile.setFillStyle(this.selectedColor); // Definir a cor do tile para azul quando o mouse passar sobre ele
        });
        tile.on("pointerout", () => {
          let original_color = tile.fillColor;
          if (this.blocksArray[i][j].type === "EmptyBlock") {
            tile.setFillStyle(0xffffff);
          } else {
            if (this.selectedBlock.type !== this.blocksArray[i][j].type) {
              tile.setFillStyle(this.blocksArray[i][j].color);
            }
          }
        });
        tile.on("pointerdown", () => {
          // Este código será executado quando o retângulo for clicado
          this.blocksArray[i][j] = this.selectedBlock;
          tile.setFillStyle(this.selectedColor);
        });
      }
    }
  }

  onScroll(pointer, gameObjects, deltaX, deltaY, deltaZ) {
    if (deltaY < 0 && this.cameras.main.scrollY > 0) {
      this.cameraRef.y -= 10;
    } else if (deltaY > 0 && this.cameras.main.scrollY < 4000) {
      this.cameraRef.y += 10;
    }
  }

  rgbToHex(r, g, b) {
    // Garante que os valores estejam no intervalo de 0 a 255
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));

    // Converte cada componente para hexadecimal e os concatena
    return (r << 16) | (g << 8) | b;
  }

  toCamelCase(str) {
      return str.replace(/_./g, (match) => match.charAt(1).toUpperCase());
  }

  setSelectedBlock(color, key) {
    this.selectedColor = color;
    this.selectedBlock = this.availableBlocks[this.toCamelCase(key)]();
    console.log(this.selectedBlock);
  }

  clearNotSelectedBlocks(jumpIndex) {
    this.blocksSelection.forEach((block, index) => {
      if (jumpIndex !== index) block.setStrokeStyle(1, 0x000000);
      index++;
    });
  }

  async fetchConfig() {
    const block = await fetch("blocks.json");
    const data = await block.json();
    const keys = Object.keys(data);
    for (let i = 0; i < keys.length; i++) {
      this.colorsData[keys[i]] = data[keys[i]].color;
    }
  }

  drawTriangle(startX, startY, x1, y1, x2, y2, x3, y3, r, g, b, key, index) {
    let graphics = this.add.graphics();

    // Defina o estilo do triângulo (opcional)
    graphics.fillStyle(0x00FF00, 1); // Cor verde com opacidade 1
    graphics.lineStyle(2, 0x000000, 1); // Linha preta com espessura de 2

    // Comece um novo caminho
    graphics.beginPath();

    // Mova-se para o ponto inicial do triângulo
    graphics.moveTo(startX, startY); // Ponto A (topo do triângulo)

    // Desenhe linhas para os outros pontos
    graphics.lineTo(x1, y1); // Ponto B (canto inferior direito)
    graphics.lineTo(x2, y2); // Ponto C (canto inferior esquerdo)
    graphics.lineTo(x3, y3); // Volte ao ponto A

    // Preencha o triângulo
    graphics.fillPath();

    // Desenhe o contorno do triângulo
    graphics.strokePath();

    // Tornar o triângulo interativo
    const hitArea = new Phaser.Geom.Polygon([
        { x: startX, y: startY },
        { x: x1, y: y1 },
        { x: x2, y: y2 },
        { x: x3, y: y3 }
    ]);
    graphics.setInteractive(hitArea, Phaser.Geom.Polygon.Contains);

    // Adicionar eventos de interação
    graphics.on('pointerdown', (pointer) =>  {
        this.setSelectedBlock(this.rgbToHex(r, g, b), key);
        this.clearNotSelectedBlocks(index);
        
    });

    graphics.on('pointerover', function (pointer) {
        console.log('Pointer sobre o triângulo!');
        graphics.lineStyle(2, 0x00FF00, 1);
        graphics.fillPath();
        graphics.strokePath();
    });

    graphics.on('pointerout', function (pointer) {
        console.log('Pointer saiu do triângulo!');
        graphics.lineStyle(2, 0x000000, 1);
        graphics.fillPath();
        graphics.strokePath();
    });
  }

  async createBlocksSelector() {
    let rectangle = this.add.rectangle(
        window.innerWidth * 0.9,
        350,
        300,
        600,
        0xcccccc,
        0.5
    );

    // Adiciona o texto no centro do retângulo
    const text = this.add.text(rectangle.x, 100, "Seletor de blocos", {
        fontSize: "22px",
        fill: "#000000",
        align: "center",
    });

    // Centraliza o texto no meio do retângulo
    text.setOrigin(0.5);
    const block = await fetch("blocks.json");
    const data = await block.json();
    const keys = Object.keys(data);
    let offset_y = 0;
    let offset_x = 0;
    keys.forEach((key, index) => {
        const blockInfo = data[key];
        const r = blockInfo["color"]["r"];
        const g = blockInfo["color"]["g"];
        const b = blockInfo["color"]["b"];
        let shape = null;
        let shapeX = rectangle.x - 60 + offset_x;
        let shapeY = 220 + offset_y;

        if(blockInfo["render_type"] == "triangle") {
          this.drawTriangle(shapeX, shapeY - 50, shapeX - 50, shapeY + 50, shapeX + 50, shapeY + 50, shapeX, shapeY - 50, r, g, b, key, index);
        }
        
        else if (blockInfo["render_type"] == "circle") {
            shape = this.add.graphics();
            
            // Define o estilo da linha (largura, cor, opacidade)
            shape.lineStyle(2, 0x000000, 1.0);
    
            // Define a cor de preenchimento do círculo (cor, opacidade)
            shape.fillStyle(this.rgbToHex(r, g, b), 1.0);
    
            // Desenha o círculo (x, y, raio)
            shape.fillCircle(shapeX, shapeY, 50);
            shape.strokeCircle(shapeX, shapeY, 50); // Adiciona a borda preta ao círculo
        } else {
            shape = this.add.rectangle(
                shapeX,
                shapeY,
                100,
                100,
                this.rgbToHex(r, g, b),
                1
            );
            shape.setOrigin(0.5); // Ajusta a origem para o centro do retângulo
            shape.setStrokeStyle(2, 0x000000);
        }
        
        if(blockInfo["render_type"] != "circle" && blockInfo["render_type"] != "triangle")
        {
          shape.setInteractive();

        // Adiciona ouvintes de eventos para o retângulo
        shape.on("pointerover", () => {
          
          if (blockInfo["render_type"] == "circle") {
              shape.clear();
              shape.lineStyle(2, 0x77ec65, 1.0);
              shape.fillStyle(this.rgbToHex(r, g, b), 1.0);
              shape.fillCircle(shapeX, shapeY, 50);
              shape.strokeCircle(shapeX, shapeY, 50); // Redesenha a borda com a nova cor
          } else {
              shape.setStrokeStyle(2, 0x77ec65);
          }
        });

        shape.on("pointerout", () => {
          if (blockInfo["render_type"] == "circle") {
              shape.clear();
              shape.lineStyle(2, 0x000000, 1.0);
              shape.fillStyle(this.rgbToHex(r, g, b), 1.0);
              shape.fillCircle(shapeX, shapeY, 50);
              shape.strokeCircle(shapeX, shapeY, 50); // Redesenha a borda com a cor original
          } else {
              const strokeColor = shape.strokeColor;
              if (strokeColor !== 0xec8065) shape.setStrokeStyle(2, 0x000000);
          }
        });

        let selected = false;

        shape.on("pointerdown", () => {
            selected = true;
            if (blockInfo["render_type"] == "circle") {
                shape.clear();
                shape.lineStyle(2, 0xec8065, 1.0);
                shape.fillStyle(this.rgbToHex(r, g, b), 1.0);
                shape.fillCircle(shapeX, shapeY, 50);
                shape.strokeCircle(shapeX, shapeY, 50); // Redesenha a borda com a cor de seleção
            } else {
                shape.setStrokeStyle(2, 0xec8065);
            }
            this.setSelectedBlock(this.rgbToHex(r, g, b), key);
            this.clearNotSelectedBlocks(index);
        });
        }
        

        let blockDescription;
        if (blockInfo["render_type"] == "circle" || blockInfo["render_type"] == "triangle") {
            console.log(shapeX)
            console.log(shapeY + 70)
            blockDescription = this.add.text(
                shapeX,
                shapeY + 70, // Ajuste a posição vertical do texto para aparecer abaixo do círculo
                blockInfo["description"],
                {
                    fontSize: "22px",
                    fill: "#000000",
                    align: "center",
                }
            );
        } else {
            blockDescription = this.add.text(
                shapeX,
                shapeY + shape.height / 2 + 20,
                blockInfo["description"],
                {
                    fontSize: "22px",
                    fill: "#000000",
                    align: "center",
                }
            );
        }

        // Centraliza o texto verticalmente no meio do retângulo
        blockDescription.setOrigin(0.5);
        this.blocksSelection.push(shape);

        if (index % 2 === 1) offset_y += 160;
        offset_x = offset_x === 0 ? 120 : 0;
    });
  }



  findFirstNotEmpty() {
    let block = null;
    for (let i = 0; i < this.blocksArray.length; i++) {
      for (let j = 0; j < this.blocksArray[i].length; j++) {
        if (!(this.blocksArray[i][j] instanceof EmptyBlock)) {
          block = this.blocksArray[i][j];
        }
      }
    }
    return block;
  }

  downloadJSON(jsonData, filename) {
    // Converta o objeto JSON em uma string JSON
    var jsonString = JSON.stringify(jsonData);

    // Crie um novo Blob com o conteúdo JSON
    var blob = new Blob([jsonString], { type: "application/json" });

    // Crie um URL para o Blob
    var url = URL.createObjectURL(blob);

    // Crie um elemento de link para fazer o download
    var link = document.createElement("a");
    link.href = url;
    link.download = filename; // Nome do arquivo que será baixado
    link.click();

    // Limpe o URL criado para o Blob
    URL.revokeObjectURL(url);
  }

  createGenerateJsonButton() {
    let rectangle = this.add.rectangle(
      window.innerWidth * 0.9,
      750,
      300,
      120,
      0xffffff
    );
    rectangle.setStrokeStyle(1, 0x000000);
    const text = this.add.text(rectangle.x, 750, "Gerar JSON", {
      fontSize: "22px",
      fill: "#000000",
      align: "center",
    });

    // Center the text in the middle of the rectangle
    text.setOrigin(0.5);

    rectangle.setInteractive();

    rectangle.on("pointerover", function () {
      rectangle.setFillStyle(0xcccccc); // Define a cor do retângulo para cinza
    });

    rectangle.on("pointerout", function () {
      // Este código será executado quando o mouse sair do retângulo

      rectangle.setFillStyle(0xffffff);
    });

    rectangle.on("pointerdown", () => {
      // Este código será executado quando o retângulo for clicado
      let jsonData = [];
      for (let i = 0; i < this.blocksArray.length; i++) {
        jsonData.push([]);
        for (let j = 0; j < this.blocksArray[i].length; j++) {
          let block = this.blocksArray[i][j];
          jsonData[i].push(block);
        }
      }
      jsonData = this.removeEmptyBorders(jsonData);
      this.downloadJSON(jsonData);
    });
  }

  removeEmptyBorders(jsonData) {
    let firstInZ = 0;
    let firstInX = 0;
    let lastInZ = jsonData.length - 1;
    let lastInX = jsonData[0].length - 1;

    // Analyze z
    for (let i = 0; i < jsonData.length; i++) {
      let hasNonEmptyBlock = false;
      for (let j = 0; j < jsonData[i].length; j++) {
        if (jsonData[i][j].type !== "EmptyBlock") {
          hasNonEmptyBlock = true;
          break;
        }
      }
      if (hasNonEmptyBlock) {
        firstInZ = i;
        break;
      }
    }

    // Analyze x
    for (let i = 0; i < jsonData[0].length; i++) {
      let hasNonEmptyBlock = false;
      for (let j = 0; j < jsonData.length; j++) {
        if (jsonData[j][i].type !== "EmptyBlock") {
          hasNonEmptyBlock = true;
          break;
        }
      }
      if (hasNonEmptyBlock) {
        firstInX = i;
        break;
      }
    }

    // Analyze last z
    for (let i = jsonData.length - 1; i >= 0; i--) {
      let hasNonEmptyBlock = false;
      for (let j = 0; j < jsonData[i].length; j++) {
        if (jsonData[i][j].type !== "EmptyBlock") {
          hasNonEmptyBlock = true;
          break;
        }
      }
      if (hasNonEmptyBlock) {
        lastInZ = i;
        break;
      }
    }

    // Analyze last x
    for (let i = jsonData[0].length - 1; i >= 0; i--) {
      let hasNonEmptyBlock = false;
      for (let j = 0; j < jsonData.length; j++) {
        if (jsonData[j][i].type !== "EmptyBlock") {
          hasNonEmptyBlock = true;
          break;
        }
      }
      if (hasNonEmptyBlock) {
        lastInX = i;
        break;
      }
    }

    // Remove empty rows and columns
    jsonData = jsonData.slice(firstInZ, lastInZ + 1);
    for (let i = 0; i < jsonData.length; i++) {
      jsonData[i] = jsonData[i].slice(firstInX, lastInX + 1);
    }

    return jsonData;
  }

  create() {
    this.gameWidth = window.innerWidth;
    this.gameHeight = window.innerHeight;
    this.cursorKeys = this.input.keyboard.createCursorKeys();
    this.createGrid(32);
    this.cameras.main.setBackgroundColor(0xcccccc);
    this.circle = this.add.circle(
      this.mousePos.x,
      this.mousePos.y,
      4,
      0xaa4a44,
      0.5
    );
    this.cameraRef = this.add.rectangle(900, 490, 200, 200, 0xaa4a44, 0.0);
    this.posX = this.add.text(50, 50, `X: ${this.currentScrollX}`, {
      fontSize: "24px",
      fill: "#000000",
    });
    this.posY = this.add.text(50, 80, `Y: ${this.currentScrollX}`, {
      fontSize: "24px",
      fill: "#000000",
    });
    this.posX.setScrollFactor(0);
    this.posY.setScrollFactor(0);
    this.physics.world.setBounds(0, 0, 4000, 3240); // Define os limites do mundo de física para o tamanho total do seu cenário
    // Isso colocaria seu personagem na posição x=1200, y=0, que está fora dos limites do canvas visível
    this.createBlocksSelector();
    this.createGenerateJsonButton();
    // Configurar a câmera
    this.cameras.main.setBounds(0, 0, 4000, 3240); // Define os limites da câmera para o tamanho total do seu cenário
    this.cameras.main.startFollow(this.cameraRef);
    this.input.on("pointermove", (pointer) => {
      const mouseX = pointer.x;
      const mouseY = pointer.y;

      // Calcula a posição do mouse em relação ao mundo considerando o deslocamento da câmera
      const worldMouseX = mouseX + this.cameras.main.scrollX;
      const worldMouseY = mouseY + this.cameras.main.scrollY;

      this.mousePos.x = worldMouseX;
      this.mousePos.y = worldMouseY;

      if (this.rightButtonIsPressed) {
        let calculated = this.calculateGridIndex(
          this.mousePos.x,
          this.mousePos.y,
          32
        );
        this.gridMouseIndex = calculated;
        this.blocksArray[calculated.i][calculated.j] = this.selectedBlock;
        this.tiles[calculated.i][calculated.j].setFillStyle(this.selectedColor);
      }
    });
    this.input.on("wheel", this.onScroll.bind(this));

    this.cameras.main.setSize(this.gameWidth, this.gameHeight);
    this.cameras.main.setZoom(1);

    // Recalcular o número de linhas e colunas do grid
    const numRows = Math.ceil(this.gameHeight / this.tileSize);
    const numCols = Math.ceil(this.gameWidth / this.tileSize);

    this.input.on("pointerdown", (pointer, gameObjects) => {
      // Verifique se o botão direito do mouse foi pressionado
      if (pointer.rightButtonDown()) {
        // Evite o comportamento padrão do menu de contexto
        event.preventDefault();

        this.rightButtonIsPressed = !this.rightButtonIsPressed;
      }
    });
    this.createModal()
  }

  update() {
    if (this.mouseIsPressed) {
      const tileSize = 32; // Tamanho do tile, ajuste conforme necessário
      const { i, j } = this.calculateGridIndex(
        this.mousePos.x,
        this.mousePos.y,
        tileSize
      );
      this.tiles[i][j].setFillStyle(this.selectedColor);
    }
    this.cameraRef.y += this.cameraRefVertical;
    this.circle.x = this.mousePos.x;
    if (this.cursorKeys.left.isDown) {
      if (this.cameras.main.scrollX > 0) {
        this.cameraRef.x -= 10;
      }
    } else if (this.cursorKeys.right.isDown) {
      if (this.cameras.main.scrollX < WIDTH * 2) {
        this.cameraRef.x += 10;
      }
    }
    this.circle.y = this.mousePos.y;
    this.posY.setText(`Y: ${this.cameras.main.scrollY}`);
    this.posX.setText(`X: ${this.cameras.main.scrollX}`);
  }
}

const config = {
  type: Phaser.AUTO,
  width: WIDTH,
  height: HEIGHT,
  scene: LevelBuilder,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 200 },
    },
  },
  plugins: {
    scene: [{
        key: 'rexUI',
        plugin: window.rexUIPlugin,
        mapping: 'rexUI'
    }]
  }
};

const game = new Phaser.Game(config);

setTimeout(() => {
  const canvas = document.querySelector("canvas");
  canvas.style.position = "absolute";
  canvas.style.left = "50%"; // Define a posição horizontal no centro da tela
  canvas.style.top = "50%"; // Define a posição vertical no centro da tela
  canvas.style.transform = "translate(-50%, -50%)"; // Para centralizar corretamente

  // Também é uma boa prática definir o tamanho do canvas para corresponder à largura e altura do jogo
  canvas.width = config.width;
  canvas.height = config.height;
}, 200);
import Square from './square.js'


export default class Level {
   constructor(levelData) {
      this.levelData = levelData
      this.platforms = []

   }

   generate() {
      for (let j = 0; j < levelData[0].length; j++) {
         for (let i = 0; i < levelData.length; i++) {
            let blockType = levelData[i][j]
            if (blockType === '#') {
               var square = new Square(blockSize, 'black', blockSize * config.BLOCK_DISTANCE_FROM_LEFT_BORDER + blockSize * j, blockSize * i)
               platforms.push(square)
            } else continue

         }
      }
   }
}
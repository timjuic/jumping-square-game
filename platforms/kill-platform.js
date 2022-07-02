import Square from '../square.js'

export default class KillPlatform extends Square {
   constructor(size, posX, posY, image, type) {
      super(size, posX, posY, image, type)
   }

   activate(player) {
      console.log('kill activate');
   }
}
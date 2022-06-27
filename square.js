
export default class Square {
   constructor(size, color, posX, posY) {
      this.size = size
      this.position = {
         x: posX,
         y: posY,
      }
      this.color = color
   }

   draw() {
      ctxLevel.fillStyle = this.color
         
      ctxLevel.fillRect(
         this.position.x,
         this.position.y,
         this.size,
         this.size,
      )
   }
}
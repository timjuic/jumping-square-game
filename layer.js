export default class Layer {
   constructor(image, width, height, speedModifier, gameSpeed) {
      this.x = 0
      this.y = 0
      this.width = width
      this.height = height
      this.x2 = this.width
      this.image = image
      this.speedModifier = speedModifier
      this.speed = gameSpeed * speedModifier
   }

   nextFrame() {
      if (this.x <= -this.width) {
         this.x = this.width + this.x2 - this.speed
      }
      if (this.x2 <= -this.width) {
         this.x2 = this.width + this.x - this.speed
      }
      this.x = Math.floor(this.x - this.speed)
      this.x2 = Math.floor(this.x2 - this.speed)
   }

   draw() {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height)
      ctx.drawImage(this.image, this.x2, this.y, this.width, this.height)
   }

   reset() {
      this.x = 0
      this.x2 = this.width
   }
}
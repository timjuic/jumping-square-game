export default class Particle {
   constructor(posX, posY, size, velX, velY, gravity, color) {
      this.size = size
      this.color = color
      this.gravity = gravity
      this.position = {
         x: posX,
         y: posY
      }
      this.velocity = {
         x: velX,
         y: velY
      }
   }

   update() {
      this.position.x += this.velocity.x
      this.velocity.y += this.gravity
      this.position.y += this.velocity.y
   }

   draw() {
      ctx.fillStyle = this.color
      ctx.fillRect(this.position.x, this.position.y, this.size, this.size)
   }
}
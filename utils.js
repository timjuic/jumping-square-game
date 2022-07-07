export default class Utils {
   static async loadImage(src) {
      return await new Promise((resolve, reject) => {
         const img = new Image()
         img.onload = () => resolve(img)
         img.onerror = reject
         img.src = src
      })
   }


   static getImageChunks(image, posX, posY, size, rotation) {
      let roundedRotation = Math.floor(rotation / 90) * 90
      let invisCanvas = document.createElement('canvas')
      invisCanvas.height = canvas.height
      invisCanvas.width = canvas.width
      let invisibleCtx = invisCanvas.getContext('2d')
      invisibleCtx.save()
      invisibleCtx.translate(
         posX + image.width / 2,
         posY + image.height / 2
      )
      invisibleCtx.rotate(roundedRotation * Math.PI / 180)
      invisibleCtx.translate(
         -(posX + image.width / 2),
         -(posY + image.height / 2)
      )
      invisibleCtx.drawImage(image, posX, posY)
      invisibleCtx.restore()
      
      let chunkSize = 10
      let width = Math.floor(image.width / chunkSize)
      let height = Math.floor(image.height / chunkSize)
      let chunks = []
      let increment = 1
      let start = Date.now()
      for (let i = 0; i < width; i+=increment) {
         for (let j = 0; j < height; j+=increment) {
            let chunk = invisibleCtx.getImageData(posX + j * chunkSize, posY + i * chunkSize, 1, 1)
            let data = chunk.data
            let color = `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`;
            let position = {
               x: Math.round(posX + j * size / image.width * chunkSize),
               y: Math.round(posY + i * size / image.width * chunkSize)
            }
            chunks.push({chunk, color, position, chunkSize})
         }
      }
      console.log('elapsed 1', Date.now() - start, chunks.length);
      return chunks
   }
}
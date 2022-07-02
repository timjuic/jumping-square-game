export default class Utils {
   static async loadImage(src) {
      return await new Promise((resolve, reject) => {
         const img = new Image()
         img.onload = () => resolve(img)
         img.onerror = reject
         img.src = src
      })
   }
}
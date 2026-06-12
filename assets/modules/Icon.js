/** SVG namespace */
const NAMESPACE = "http://www.w3.org/2000/svg"

export class Icon {
  /**
   * @param {import("./Glyphs").IconData} data 
   */
  constructor(data) {
    /** @type {SVGSVGElement} SVG element of icon */
    this.domElement = document.createElementNS(NAMESPACE, "svg")
    /** @type {SVGGElement} Group element */
    this.group = document.createElementNS(NAMESPACE, "g")
    // add group element into svg
    this.domElement.appendChild(this.group)
    // get icon data and view box values
    const view = data.viewBox.split(" ")
    // set dimensions and view box
    this.domElement.setAttribute("width", view[2])
    this.domElement.setAttribute("height", view[3])
    this.domElement.setAttribute("viewBox", data.viewBox)
    // get element tags
    const tags = Object.keys(data.elements)
    // for each tag name
    for (const tag of tags) {
      // get child element
      const elements = data.elements[tag]
      // for each element
      for (const element of elements) {
        // get element attributes and values
        const attributes = Object.keys(element)
        // create child element by tag name
        const child = document.createElementNS(NAMESPACE, tag)
        // for each attribute
        for (const attribute of attributes) {
          // set attribute on child element
          child.setAttribute(attribute, element[attribute])
        }
        // append on group
        this.group.appendChild(child)
      }
    }
  }
}

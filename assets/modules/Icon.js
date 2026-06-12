/** SVG namespace */
const NAMESPACE = "http://www.w3.org/2000/svg"

export class Icon {
  /** @type {number} Width of the SVG */
  #width = 100
  /** @type {number} Height of the SVG */
  #height = 100
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
    // get icon dimensions from view box
    const values = data.viewBox.split(" ")
    this.#width = values[2]
    this.#height = values[3]
    // set dimensions and view box
    this.domElement.setAttribute("width", this.#width)
    this.domElement.setAttribute("height", this.#height)
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
  /**
   * Applies style rules to icon
   * @param {{
   *  fill: string,
   *  opacity: number,
   *  rotate: number,
   *  scale: number | number[]
   * }} options 
   */
  addStyle(options) {
    // set fill attribute
    if ("fill" in options) {
      this.group.setAttribute("fill", options.fill)
    }
    // set opacity attribute
    if ("opacity" in options) {
      this.group.setAttribute("opacity", options.opacity)
    }
    // transform values
    const transform = []
    // check rotate option
    if ("rotate" in options) {
      // append rotate rule
      transform.push(`rotate(${options.rotate})`)
    }
    // check scale option
    if ("scale" in options) {
      // get scale values as an array
      const scale = Array.isArray(options.scale)
        ? options.scale : [options.scale, options.scale]
      // append scale rule
      transform.push(`scale(${scale.join(", ")})`)
    }
    // set transform attribute
    if (transform.length) {
      // transform from center point
      this.group.setAttribute("transform-origin", "center")
      // join transform rules
      this.group.setAttribute("transform", transform.join(" "))
    }
  }
}

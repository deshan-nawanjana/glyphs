/**
 * @typedef {{
 *  type: 'opacity' | 'fill' | 'rotate' | 'scale',
 *  values: (number | string | number[])[],
 *  duration: number,
 *  repeat: number | boolean,
 *  delay: number
 * }} Animation
 */

/** SVG namespace */
const NAMESPACE = "http://www.w3.org/2000/svg"

export class Icon {
  /** @type {string} Random UUID of icon */
  #uuid = crypto.randomUUID()
  /**
   * @param {import("./Glyphs").IconData} data 
   */
  constructor(data) {
    /** @type {SVGSVGElement} SVG element of icon */
    this.domElement = document.createElementNS(NAMESPACE, "svg")
    /** @type {SVGDefsElement} Definitions element */
    this.defs = document.createElementNS(NAMESPACE, "defs")
    /** @type {SVGGElement} Group element */
    this.group = document.createElementNS(NAMESPACE, "g")
    // return if no data
    if (!data) return
    // add group element into svg
    this.domElement.appendChild(this.group)
    // get icon dimensions from view box
    const values = data.viewBox.split(" ")
    // set dimensions and view box
    this.domElement.setAttribute("width", values[2])
    this.domElement.setAttribute("height", values[3])
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
   *  color: string,
   *  gradient: { type: 'linear' | 'radial', rotate: number, stops: string[] },
   *  opacity: number,
   *  rotate: number,
   *  scale: number | number[]
   * }} options 
   */
  addStyle(options) {
    // check color option
    if ("color" in options) {
      // set fill attribute
      this.group.setAttribute("fill", options.color)
      // remove any previous gradient element
      this.defs.querySelector(".gradient")?.remove()
    }
    // check gradient option
    if ("gradient" in options) {
      // get gradient type
      const type = options.gradient.type === "linear"
        ? "linearGradient" : "radialGradient"
      // create id for gradient
      const id = `grad-${this.#uuid}`
      // create gradient element for type
      const gradient = document.createElementNS(NAMESPACE, type)
      // set gradient id attributes
      gradient.setAttribute("id", id)
      gradient.setAttribute("class", "gradient")
      // set rotate attribute
      if ("rotate" in options.gradient) {
        gradient.setAttribute("gradientTransform", `rotate(${options.gradient.rotate}, 0.5, 0.5)`)
      }
      // get color stops
      const colors = options.gradient.stops
      // for each color stop
      for (let i = 0; i < colors.length; i++) {
        // get color by index
        const color = colors[i]
        // create stop element
        const stop = document.createElementNS(NAMESPACE, "stop")
        // set stop color attribute
        stop.setAttribute("stop-color", color)
        // set offset attribute
        stop.setAttribute("offset", `${100 * i / (colors.length - 1)}%`)
        // append to gradient element
        gradient.appendChild(stop)
      }
      // remove any previous gradient element
      this.defs.querySelector(".gradient")?.remove()
      // append to definitions
      this.defs.appendChild(gradient)
      // set fill attribute
      this.group.setAttribute("fill", `url(#${id})`)
      // append definitions element
      if (this.domElement.querySelector("defs") === null) {
        this.group.before(this.defs)
      }
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
  /**
   * Applies animation rules
   * @param {Animation | Animation[] | false} options 
   */
  setAnimations(options) {
    // get selector by uuid
    const selector = `anim-${this.#uuid}`
    // remove all previous animations
    const previous = this.domElement.getElementsByClassName(selector)
    Array.from(previous).forEach(element => element.remove())
    // return if no animation rules
    if (!options) return
    // get animations as array
    const animations = Array.isArray(options) ? options : [options]
    // for each animation
    for (const animation of animations) {
      // select animation transform flag
      const isTransform = ["rotate", "scale"].includes(animation.type)
      // create animate element
      const element = document.createElementNS(NAMESPACE, isTransform ? "animateTransform" : "animate")
      // set animation selector
      element.setAttribute("class", selector)
      // set animation attribute
      element.setAttribute("attributeName", isTransform ? "transform" : animation.type)
      // set animation type
      if (isTransform) element.setAttribute("type", animation.type)
      // get animation values
      const values = animation.values.map(item => Array.isArray(item) ? item.join(" ") : item)
      // set animation rules
      element.setAttribute("values", values.join(";"))
      element.setAttribute("dur", `${animation.duration ?? 1000}ms`)
      element.setAttribute("fill", "freeze")
      // set animation repeat rule
      if ("repeat" in animation) {
        const repeat = typeof animation.repeat === "number" ? animation.repeat
          : animation.repeat ? "indefinite" : 1
        element.setAttribute("repeatCount", repeat)
      }
      // set animation delay rule
      if ("delay" in animation) {
        element.setAttribute("begin", `${animation.delay}ms`)
      }
      // set additive attribute
      if (isTransform) element.setAttribute("additive", "sum")
      // append animate element
      this.group.before(element)
    }
  }
  /**
   * Creates a clone
   * @returns {Icon}
   */
  clone() {
    // create an icon
    const icon = new Icon()
    // get svg inner html
    const html = this.domElement.innerHTML.toString()
    // get original view box
    const viewBox = this.domElement.getAttribute("viewBox").split(" ")
    // update dimensions and view box
    icon.domElement.setAttribute("width", viewBox[2])
    icon.domElement.setAttribute("height", viewBox[3])
    icon.domElement.setAttribute("viewBox", viewBox.join(" "))
    // update svg inner html
    icon.domElement.innerHTML = html.replaceAll(this.#uuid, icon.#uuid)
    // select child elements
    icon.defs = icon.domElement.querySelector("defs") || icon.defs
    icon.group = icon.domElement.querySelector("g") || icon.group
    // return cloned item
    return icon
  }
}

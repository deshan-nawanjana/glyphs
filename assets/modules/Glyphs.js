/**
 * @typedef {{ icons: string[], author: string, url: string }} Meta
 * @typedef {Object.<string, { viewBox: string, elements: Object.<string, Object.<string, string>[]> }>} Data
 */

/** SVG namespace */
const NAMESPACE = "http://www.w3.org/2000/svg"

export class Glyphs {
  /**
   * @param {string} name Name of the collection
   * @param {Meta} meta Indexing and additional details
   * @param {Data} data SVG definitions for the icons
   */
  constructor(name, meta, data) {
    /** @type {string} Name of the collection */
    this.name = name
    /** @type {Meta} Indexing and additional details */
    this.meta = meta
    /** @type {Data} SVG definitions for the icons */
    this.data = data
  }
  /**
   * Returns set of icon results for query string
   * @param {string} query Search query
   * @returns {{ id: string, score: number }[]}
   */
  find(query) {
    // get all result items
    const items = this.meta.icons.map(id => ({ id, score: 1 }))
    // return all items for empty query
    if (query.trim() === "") return items
    // split into query keywords
    const keywords = query.toLowerCase().split(" ").filter(word => word !== "")
    // get scored results by keywords
    const results = items.map(item => ({
      // calculate score by available word count in icon id
      id: item.id, score: keywords.filter(word => item.id.includes(word)).length
    }))
    // return filtered and sorted results
    return results.filter(item => item.score > 0).sort((a, b) => b.score - a.score)
  }
  /**
   * Generates SVG element for an icon
   * @param {string} id Identifier of the icon
   * @returns {SVGSVGElement | null}
   */
  toSVG(id) {
    // return if no such icon
    if (id in this.data === false) return null
    // get icon data and view box values
    const data = this.data[id]
    const view = data.viewBox.split(" ")
    // create svg element
    const svg = document.createElementNS(NAMESPACE, "svg")
    // set dimensions and view box
    svg.setAttribute("width", view[2])
    svg.setAttribute("height", view[3])
    svg.setAttribute("viewBox", data.viewBox)
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
        // append on svg element
        svg.appendChild(child)
      }
    }
    // return svg element
    return svg
  }
}

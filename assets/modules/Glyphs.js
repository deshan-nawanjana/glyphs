import { Icon } from "./Icon.js"

/**
 * @typedef {{ icons: string[], author: string, url: string }} Meta
 * @typedef {{ viewBox: string, elements: Object.<string, Object.<string, string>[]> }} IconData
 * @typedef {Object.<string, IconData>} Data
 */

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
   * Generates icon by id
   * @param {string} id Identifier of the icon
   * @returns {Icon | null}
   */
  toIcon(id) {
    // return if no data
    if (!this.data) return null
    // return if no such icon
    if (id in this.data === false) return null
    // return icon module
    return new Icon(this.data[id])
  }
}

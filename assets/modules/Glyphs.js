/**
 * @typedef {{ icons: string[], author: string, url: string }} Meta
 * @typedef {Object.<string, { viewBox: string, elements: Object.<string, Object.<string, string>[]> }>} Data
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
}

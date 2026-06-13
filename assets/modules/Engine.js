import { Glyphs } from "./Glyphs.js"

export class Engine {
  /**
   * @param {string} baseURL Objects base URL
   */
  constructor(baseURL) {
    /** @type {string} Objects base URL */
    this.baseURL = baseURL
    /** @type {Object.<string, import("./Glyphs").Meta> | null} Collections listing */
    this.data = null
    /** @type {Glyphs[]} Icon data listing */
    this.list = []
  }
  /** Loads collections listing */
  async load() {
    // fetch listing data
    const resp = await fetch(`${this.baseURL}/data.json`)
    // store parsed response
    this.data = await resp.json()
  }
}

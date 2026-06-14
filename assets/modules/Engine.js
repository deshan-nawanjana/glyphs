import { Glyphs } from "./Glyphs.js"
import { Icon } from "./Icon.js"

export class Engine {
  /**
   * @param {string} baseURL Objects base URL
   */
  constructor(baseURL) {
    /** @type {string} Objects base URL */
    this.baseURL = baseURL
    /** @type {Object.<string, import("./Glyphs.js").Meta>} Icon meta data mapping */
    this.data = {}
    /** @type {Object.<string, Glyphs>} Glyphs mapping */
    this.list = {}
  }
  /** Loads collections listing */
  async load() {
    // fetch collections
    const resp = await fetch(`${this.baseURL}/data.json`)
    // get parsed response
    this.data = await resp.json()
    // for each collection
    for (const name of Object.keys(this.data)) {
      // create glyphs collection
      this.list[name] = new Glyphs(name, this.data[name], null)
    }
  }
  /**
   * Returns set of icon results for query string
   * @param {string} query Search query
   * @param {string[] | null} groups Selected collections
   * @returns {{ id: string, collection: Glyphs, score: number }[]}
   */
  find(query, groups) {
    // split query into keywords
    const keywords = query.toLowerCase().split(" ").filter(word => word.length > 0)
    // output array
    const output = []
    // for each meta item
    for (const name of Object.keys(this.data)) {
      // continue if not selected
      if (groups && !groups.includes(name)) continue
      // for each icon in collection
      for (const id of this.data[name].icons) {
        // calculate score levels
        const highScore = keywords.filter(word => id.includes(word)).length
        const lowScore = keywords.filter(word => id.split("-").includes(word)).length * 10
        // calculate final score
        const score = highScore + lowScore
        // continue if no score
        if (keywords.length > 0 && score === 0) continue
        // push to results
        output.push({ id, collection: this.list[name], score })
      }
    }
    // return sorted output output
    return output.sort((a, b) => b.score - a.score)
  }
}

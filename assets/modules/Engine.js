import { Glyphs } from "./Glyphs.js"
import { Icon } from "./Icon.js"

/**
 * Extracts file content
 * @param {Promise<Blob>} blob File object
 * @param {string} name Name of the file
 */
const extractFile = async (blob, name) => {
  // create archive
  const archive = new JSZip()
  // load archive data from blob
  await archive.loadAsync(blob)
  // return parsed content
  return JSON.parse(await archive.files[`${name}.json`].async("text"))
}

/**
 * @typedef {{ id: string, collection: Glyphs, score: number, icon: Icon | null }} IconResult
 */

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
    const resp = await fetch(`${this.baseURL}/listing.zip`)
    // get parsed response
    this.data = await extractFile(resp.blob(), "listing")
    // for each collection
    for (const name of Object.keys(this.data)) {
      // create glyphs collection
      this.list[name] = new Glyphs(name, this.data[name], null)
    }
  }
  /**
   * Returns set of icon results
   * @param {string} query Search query text
   * @returns {Object.<string, IconResult[]>}
   */
  find(query) {
    // split query text into keywords
    const keywords = query.toLowerCase().split(" ").filter(word => word.length > 0)
    // output object
    const output = { All: [] }
    // for each meta item
    for (const name of Object.keys(this.data)) {
      // initiate collection node
      output[name] = []
      // for each icon in collection
      for (const id of this.data[name].icons) {
        // calculate score levels
        const highScore = keywords.filter(word => id.includes(word)).length
        const lowScore = keywords.filter(word => id.split("-").includes(word)).length * 10
        // calculate final score
        const score = highScore + lowScore
        // continue if no score
        if (keywords.length > 0 && score === 0) continue
        // create result item
        const item = { id, collection: this.list[name], score, icon: null }
        // push to results by collection
        output[name].push(item)
        // push to all results
        output.All.push(item)
      }
      // sort collection results by score
      output[name].sort((a, b) => b.score - a.score)
    }
    // sort all results by score
    output.All.sort((a, b) => b.score - a.score)
    // return sorted output
    return output
  }
  /**
   * Loads icons in results
   * @param {IconResult[]} results Set of icon results
   * @param {number} start Starting index to load
   * @param {number} limit Icons limit to load
   * @returns {Promise<boolean>}
   */
  async loadResults(results, start, limit) {
    // calculate last item index
    const last = Math.min(results.length, start + limit)
    // return if no available items
    if (last - start <= 0) return false
    // for each item
    for (let i = start; i < last; i++) {
      // get item by index
      const item = results[i]
      // get glyphs collection of icon
      const list = item.collection
      // check if collection not loaded
      if (!list.data) {
        // fetch collection data
        const resp = await fetch(`${this.baseURL}/packs/${list.name}.zip`)
        // parse icons definitions
        list.data = await extractFile(resp.blob(), list.name)
      }
      // create ad set icon on result
      if (!item.icon) item.icon = list.toIcon(item.id)
    }
    // return as loaded
    return true
  }
}

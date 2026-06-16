import { Engine } from "./assets/modules/Engine.js"

// icons limit per page
const LIMIT = 120

// create glyphs engine
const engine = new Engine("assets/objects")

new Vue({
  // app root
  el: "#app",
  // app data
  data: {
    // loading status
    loading: false,
    // search results
    items: [],
    // listing limit
    limit: LIMIT,
    // query parameters
    query: { text: "", group: "All" },
    // query groups
    groups: ["All"]
  },
  // computed values
  computed: {
    // slice results by listing limit
    results() { return this.items.slice(0, this.limit) }
  },
  // app methods
  methods: {
    // query results
    search() {
      clearTimeout(this.timeout)
      // timeout for search
      this.timeout = setTimeout(() => {
        // reset limit
        this.limit = 0
        // reset scroll position
        document.documentElement.scrollTop = 0
        // update search results
        this.items = engine.find(this.query)
        // load results
        this.load()
      }, 500)
    },
    // load result items
    async load() {
      // return if loading
      if (this.loading) return
      // start loading
      this.loading = true
      // increase limit
      this.limit += LIMIT
      // load items
      await engine.loadResults(this.items, LIMIT)
      // stop loading
      this.loading = false
    },
    // scroll handler
    scroll() {
      // get current scroll position
      const position = document.documentElement.scrollTop
      // get total scroll height
      const height = document.documentElement.scrollHeight - window.innerHeight
      // return if not scrolled to bottom
      if (height - position > 400) return
      // load more items
      this.load()
    }
  },
  // mounted listener
  async mounted() {
    // load engine data listing
    await engine.load()
    // append all groups
    this.groups.push(...Object.keys(engine.data))
    // initial results
    this.search()
    // page scroll listener
    window.addEventListener("scroll", this.scroll)
    // set as ready
    document.body.setAttribute("data-ready", true)
  }
})

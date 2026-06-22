import { Engine } from "./assets/modules/Engine.js"

// icons limit per page
const PAGE = 120

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
    items: null,
    // listing limit
    limit: 0,
    // query parameters
    query: { text: "", group: "All" },
    // query groups
    groups: ["All"],
    // popup opened state
    popup: false,
    // inverted preview
    inverted: false,
    // selected item
    item: null,
    // current icon
    icon: null,
    // engine
    engine
  },
  // computed values
  computed: {
    // slice results by listing limit
    results() {
      return this.items ? this.items[this.query.group].slice(0, this.limit) : []
    }
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
        // update search result items
        this.items = engine.find(this.query.text)
        // reset group if no collection results
        if (this.items[this.query.group].length === 0) this.query.group = "All"
        // load results
        this.load()
      }, 500)
    },
    // select group
    group(name) {
      // return if loading
      if (this.loading) return
      // return if same group
      if (this.query.group === name) return
      // set group on query
      this.query.group = name
      // reset limit
      this.limit = 0
      // reset scroll position
      document.documentElement.scrollTop = 0
      // load list
      this.load()
    },
    // load result items
    async load() {
      // return if loading
      if (this.loading) return
      // start loading
      this.loading = true
      // increase limit
      this.limit += PAGE
      // load items
      await engine.loadResults(this.items[this.query.group], this.limit - PAGE, PAGE)
      // stop loading
      this.loading = false
      // set as ready
      document.body.setAttribute("data-ready", true)
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
    },
    // open icon
    open(item) {
      // return if no icon
      if (!item.icon) return
      // set current item
      this.item = item
      // clone icon from item
      this.icon = item.icon.clone()
      // open popup
      this.popup = true
      // remove previous content
      this.$refs.icon.innerHTML = ""
      // append icon element
      this.$refs.icon.appendChild(this.icon.domElement)
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
    // wheel event listener
    window.addEventListener("wheel", event => {
      // prevent wheel when popup opened
      this.popup && event.preventDefault()
    }, { passive: false })
  }
})

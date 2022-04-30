const qs = x => document.querySelector(x)
const qa = x => Array.from(document.querySelectorAll(x))

const data = {
    time : Date.now(),
    packages : {},
    current : { name : null, index : 0, query : '' }
}

window.addEventListener('load', () => {
    // load package list
    fetch('index.json').then(resp => resp.json()).then(packages => {
        data.packages = packages
        // build side menu
        Object.keys(packages).forEach(name => {
            const e = document.createElement('div')
            e.innerHTML = name
            e.id = name
            e.addEventListener('click', () => openPackage(name))
            qs('.side_menu_inner').appendChild(e)
        })
        // load first package
        openPackage(Object.keys(packages)[0])
    })
    // search box event
    qs('.query_box > input').addEventListener('input', e => {
        if(data.current.name === null) { return }
        data.current.query = e.target.value
        openPackage(data.current.name)
    })
    // scroll and load more event
    qs('.glyphs_box').addEventListener('scroll', e => {
        const tray = e.target
        const rect = tray.getBoundingClientRect()
        if(tray.scrollHeight - tray.scrollTop - rect.height < 100) {
            loadIcons()
        }
    })
})

const loadPackage = (name, time, callback) => {
    if(data.packages[name].glyphs) {
        // return previous data
        callback(time)
    } else {
        // request new data
        const url = data.packages[name].source
        fetch(url, { cache : 'force-cache' })
        .then(resp => resp.json()).then(glyphs => {
            // remap glyphs data
            const names = Object.keys(glyphs)
            const icons = Object.values(glyphs)
            icons.forEach((item, i) => {
                item.name = names[i]
                item.index = i
            })
            data.packages[name].glyphs = icons
            callback(time)
        })
    }
}

const openPackage = name => {
    // set side menu item selection
    if(qs('[selected]')) { qs('[selected]').removeAttribute('selected') }
    qs('#' + name).setAttribute('selected', '')
    // store new time stamp
    data.time = Date.now()
    // load package
    loadPackage(name, data.time, time => {
        // check latest request
        if(data.time === time) {
            // reset current data
            data.current.name = name
            data.current.index = 0
            // reset icon tray
            qs('.glyphs_box').innerHTML = ''
            qs('.glyphs_box').scrollTop = 0
            loadIcons()
        }
    })
}

const loadIcons = () => {
    // get filtered icon list
    const name = data.current.name
    const full = data.packages[name].glyphs
    const find = data.current.query
    const list = full.filter(x => x.name.indexOf(find) > -1)
    // get current icon index
    const index = data.current.index
    // return if fully loaded
    if(index === list.length) { return }
    // append new icons to tray
    for(let i = index; i < index + 40 && i < list.length; i++) {
        // get icon data
        const icon = list[i]
        // create item element
        const item = document.createElement('div')
        item.innerHTML = icon.name
        // create svg icon
        const isvg = new Glyph(icon)
        isvg.style({ fill : 'rgba(255, 255, 255, 0.6)' })
        // load data url to item background
        isvg.toDataURL().then(url => {
            item.style.backgroundImage = `url('${url}')`
        })
        // append element to tray
        qs('.glyphs_box').appendChild(item)
        // add icon open event
        item.addEventListener('click', () => openIcon(icon.index))
        // update current index
        data.current.index = i
    }
    // set next index
    data.current.index += 1
}

const openIcon = index => {
    const icon = data.packages[data.current.name].glyphs[index]
    console.log(icon)
}
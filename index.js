const qs = x => document.querySelector(x)
const qa = x => Array.from(document.querySelectorAll(x))

const data = {
    time : Date.now(),
    packages : {},
    current : { name : null, index : 0, query : '' },
    viewer : {
        type : 'SVG',
        resolution : 1000,
        direction : 'cw',
        duration : 1,
        animation : 'scale',
        opacity : 100,
        color : '#ffffff',
        scale : 0.7,
        angle : 0,
        flipX : false,
        flipY : false
    }
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
        // build mobile side menu
        Object.keys(packages).forEach(name => {
            const e = document.createElement('option')
            e.innerHTML = name
            qs('.side_menu_mobile > select').appendChild(e)
        })
        qs('.side_menu_mobile').addEventListener('change', e => {
            openPackage(e.target.value)
        })
        // load first package
        openPackage(Object.keys(packages)[0])
    })
    // search box event
    qs('.search_bar > input').addEventListener('input', e => {
        if(data.current.name === null) { return }
        data.current.query = e.target.value
        openPackage(data.current.name)
    })
    // desktop scroll and load more event
    qs('.icons_tray').addEventListener('scroll', e => {
        if(window.innerHeight > window.innerWidth) { return }
        const tray = e.target
        const rect = tray.getBoundingClientRect()
        if(tray.scrollHeight - tray.scrollTop - rect.height < 100) {
            loadIcons()
        }
    })
    // mobile scroll and load more event
    window.addEventListener('scroll', () => {
        if(window.innerHeight <= window.innerWidth) { return }
        const tray = document.body
        if(tray.scrollHeight - tray.scrollTop - window.innerHeight < 100) {
            loadIcons()
        }
    })
    // glyph viewer close event
    qs('.glyph_viewer').addEventListener('click', e => {
        if(e.target.className === 'glyph_viewer') {
            closeViewer()
        }
    })
    // send current glyph configuration to viewer
    qs('.glyph_viewer > iframe').addEventListener('load', () => {
        qs('.glyph_viewer > iframe').contentWindow.postMessage(data.viewer)
    })
    // receive current glyph configuration or close event from viewer
    window.addEventListener('message', e => {
        if(e.data.close === true) {
            // close viewer
            closeViewer()
        } else {
            // save configuration
            data.viewer = e.data
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
    // show loading screen
    qs('.loader').style.display = 'block'
    // load package
    loadPackage(name, data.time, time => {
        // check latest request
        if(data.time === time) {
            // reset current data
            data.current.name = name
            data.current.index = 0
            // reset icon tray
            qs('.icons_tray').innerHTML = ''
            qs('.icons_tray').scrollTop = 0
            loadIcons()
            // hide loading screen
            qs('.loader').style.display = 'none'
        }
    })
}

const loadIcons = () => {
    // get filtered icon list
    const name = data.current.name
    const full = data.packages[name].glyphs
    const find = data.current.query.toLowerCase()
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
        qs('.icons_tray').appendChild(item)
        // add icon open event
        item.addEventListener('click', () => openIcon(icon.name))
        // update current index
        data.current.index = i
    }
    // set next index
    data.current.index += 1
}

const openIcon = name => {
    // set glyph viewer url
    const params = `package=${data.current.name}&icon=${name}`
    // popup glyph viewer
    qs('.glyph_viewer > iframe').src = 'tools/viewer/#' + params
    qs('.glyph_viewer').removeAttribute('closed')
    qs('.glyph_viewer').setAttribute('opened', '')
    document.body.style.overflowY = 'hidden'
}

const closeViewer = () => {
    qs('.glyph_viewer').removeAttribute('opened')
    qs('.glyph_viewer').setAttribute('closed', '')
    setTimeout(() => {
        qs('.glyph_viewer > iframe').src = 'about:blank'
    }, 300);
    document.body.style.overflowY = 'auto'
}
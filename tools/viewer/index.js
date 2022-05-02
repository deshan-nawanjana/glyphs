const qs = x => document.querySelector(x)
const qa = x => Array.from(document.querySelectorAll(x))

// current icon configuration
const data = { icon : null, name : null, config : {} }

const randomKey = obj => {
    const keys = Object.keys(obj)
    return keys[Math.floor(Math.random() * keys.length)]
}

window.addEventListener('load', () => {
    // get info from url
    const params = new URLSearchParams(window.location.toString().split('#')[1] || '?')
    // load package list
    fetch('../../index.json').then(resp => resp.json()).then(packages => {
        // package info
        const pack_name = params.get('package') || randomKey(packages)
        const pack_data = packages[pack_name]
        // load package
        fetch('../../' + pack_data.source, { cache : 'force-cache' })
        .then(resp => resp.json()).then(icons => {
            // icon info
            data.name = params.get('icon') || randomKey(icons)
            // load icon info into ui
            loadUIText(pack_name, pack_data)
            // create glyph
            data.icon = new Glyph(icons[data.name])
            // set icon size
            data.icon.resize(200, 200)
            // append icon
            qs('.icon_tray_inner').appendChild(data.icon.domElement)
            // update for current configuration
            configure.update(data.config)
            updateSection()
            // hide loader
            setTimeout(() => {
                qs('.loader').style.opacity = 0
                setTimeout(() => {
                    qs('.loader').style.display = 'none'
                }, 100)
            }, 10)
        })
    })
})

const loadUIText = (pack_name, pack_data) => {
    qs('.icon_name').innerHTML = data.name
    qs('.pack_name').innerHTML = pack_name + ' by ' + pack_data.author
    qs('.pack_name').addEventListener('click', () => {
        window.open(pack_data.github)
    })
}

const updateIcon = conf => {
    // update input range style
    updateRangeInputs()
    // update glyph
    if(conf.type === 'Animated') {
        data.icon.style({
            fill : conf.color,
            opacity : conf.opacity / 100
        })
        data.icon.transform({
            angle : 0,
            scaleX : 1,
            scaleY : 1,
            flipX : false,
            flipY : false
        })
        if(conf.animation === 'scale') {
            data.icon.animate({
                scale : {
                    values : conf.direction === 'cw' ? [1, 0.7, 1] : [0.7, 1, 0.7],
                    duration : conf.duration * 1000
                }
            })
        } else if(conf.animation === 'rotate') {
            data.icon.animate({
                rotate : {
                    from : conf.direction === 'cw' ? 0 : 360,
                    to : conf.direction === 'cw' ? 360 : 0,
                    duration : conf.duration * 1000
                },
                scale : {
                    from : 0.7,
                    to : 0.7,
                    duration : conf.duration * 1000
                }
            })
        }
    } else {
        data.icon.style({
            fill : conf.color,
            opacity : conf.opacity / 100
        })
        data.icon.transform({
            angle : conf.angle,
            scaleX : conf.scale,
            scaleY : conf.scale,
            flipX : conf.flipX,
            flipY : conf.flipY,
        })
        data.icon.animate(false)
    }
    // store config in global
    data.config = conf
    // send configurations to parent window
    window.parent.postMessage(conf)
}

const updateSection = () => {
    // set section tag
    if(qs('[opened]')) { qs('[opened]').removeAttribute('opened') }
    qs(`.section_box [type=${data.config.type}]`).setAttribute('opened', '')
    // hide and unhide inputs
    const type = data.config.type
    qs('#animation').style.display = type === 'Animated' ? 'block' : 'none'
    qs('#duration').style.display = type === 'Animated' ? 'block' : 'none'
    qs('#direction').style.display = type === 'Animated' ? 'block' : 'none'
    qs('#resolution').style.display = type === 'PNG' ? 'block' : 'none'
    qs('#angle').style.display = type === 'Animated' ? 'none' : 'block'
    qs('#scale').style.display = type === 'Animated' ? 'none' : 'block'
    qs('#flip').style.display = type === 'Animated' ? 'none' : 'block'
    // hide and unhide buttons
    qs('#svg').style.display = type !== 'PNG' ? 'inline-block' : 'none'
    qs('#css').style.display = type !== 'PNG' ? 'inline-block' : 'none'
    qs('#png').style.display = type === 'PNG' ? 'inline-block' : 'none'
    // update icon
    updateIcon(data.config)
}

const configure = new Configure(updateIcon)

configure.setBounds({
    angle : { type : 'number', min : 0, max : 360 },
    scale : { type : 'number', min : 0, max : 1 },
    flipX : { type : 'boolean' },
    flipY : { type : 'boolean' },
    color : { type : 'color' },
    opacity : { type : 'number', min : 0, max : 100 },
    animation : { type : 'string' },
    duration : { type : 'number', min : 0.01, max : 5 },
    direction : { type : 'string' },
    resolution : { type : 'number', min : 200, max : 4000 }
})

window.addEventListener('load', () => {
    // toggle type event
    qs('.section_box').addEventListener('click', e => {
        configure.values.type = e.target.innerHTML
        updateSection()
    })
    // configure angle
    configure.addHandler('angle', '#angle [type=text]')
    configure.addHandler('angle', '#angle [type=range]')
    // configure angle
    configure.addHandler('scale', '#scale [type=text]')
    configure.addHandler('scale', '#scale [type=range]',
        value => value * 100,
        value => value / 100
    )
    // configure flip
    configure.addHandler('flipX', '#flip .x')
    configure.addHandler('flipY', '#flip .y')
    // configure color
    configure.addHandler('color', '#color [type=text]')
    configure.addHandler('color', '#color [type=color]')
    // configure opacity
    configure.addHandler('opacity', '#opacity [type=text]')
    configure.addHandler('opacity', '#opacity [type=range]')
    // configure opacity
    configure.addHandler('animation', '#animation select')
    // configure duration
    configure.addHandler('duration', '#duration [type=text]')
    configure.addHandler('duration', '#duration [type=range]',
        value => value * 100,
        value => value / 100
    )
    // configure direction
    configure.addHandler('direction', '#direction select')
    // configure resolution
    configure.addHandler('resolution', '#resolution [type=text]')
    configure.addHandler('resolution', '#resolution [type=range]')
    // download and copy event
    qs('#svg').addEventListener('click', downloadSVG)
    qs('#png').addEventListener('click', downloadPNG)
    qs('#css').addEventListener('click', copyCSS)
    // clsoe event
    qs('.close').addEventListener('click', () => {
        window.parent.postMessage({ close : true })
    })
})

// input range style
const updateRangeInputs = () => {
    qa('input[type=range]').forEach(e => {
        const min = parseFloat(e.getAttribute('min'))
        const max = parseFloat(e.getAttribute('max'))
        const val = parseFloat(e.value)
        const def = max - min
        const css = ((val - min) / def) * e.getBoundingClientRect().width
        e.style.boxShadow = `inset ${css}px 0px 0px #FFF2`
    })
}

// download svg method
const downloadSVG = () => {
    data.icon.toDataURL().then(url => {
        const a = document.createElement('a')
        a.setAttribute('href', url)
        a.setAttribute('download', data.name + '.svg')
        a.click()
    })
}

// download png method
const downloadPNG = () => {
    const size = configure.values.resolution
    data.icon.toDataURL('image/png', size, size).then(url => {
        const a = document.createElement('a')
        a.setAttribute('href', url)
        a.setAttribute('download', data.name + '.png')
        a.click()
    })
}

// copy css method
const copyCSS = () => {
    data.icon.toDataURL().then(url => {
        const e = document.createElement('textarea')
        e.value = `background-image: url('${url}');`
        e.select()
        e.setSelectionRange(0, e.value + 1000)
        navigator.clipboard.writeText(e.value)
    })
}

// receive and update current glyph configuration
window.addEventListener('message', e => data.config = e.data)
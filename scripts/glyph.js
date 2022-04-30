class Glyph {

	constructor(data) {
        // data type conversion
        if(typeof data === 'string') {
            // html string
            this.domElement = Glyph.stringtoDomElement(data)
        } else if(typeof data === 'object' && data.tagName === 'svg') {
            // dom element
            this.domElement = Glyph.stringtoDomElement(data.outerHTML)
        } else if(typeof data === 'object' && data.elements) {
            // glyph object
            const root = document.createElement('svg')
            // version
            root.setAttribute('version', '1.1')
            // viewbox
            root.setAttribute('viewBox', data.viewBox)
            // dimensions
            Glyph.viewBoxtoDimensions(root)
            // xml namesapce
            root.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
            root.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
            // child elements
            Object.keys(data.elements).forEach(tagname => {
                data.elements[tagname].forEach(tag => {
                    const child = document.createElement(tagname)
                    Object.keys(tag).forEach(attribute => {
                        child.setAttribute(attribute, tag[attribute])
                    })
                    root.appendChild(child)
                })
            })
            // outerHTML pareser
            this.domElement = Glyph.stringtoDomElement(root.outerHTML)
        }
    }

    async load(url) {
        return new Promise(resolve => {
            // fetch from url
            fetch(url, { cache : 'force-cache' })
            .then(resp => resp.text()).then(text => {
                // dom pareser
                this.domElement = Glyph.stringtoDomElement(text)
                resolve(this)
            })
        })
    }

    async toDataURL(type = 'image/svg', new_width, new_height) {
        // methods
        const toSVGURL = text => {
            text = text.split('\n').join('')
            return `data:image/svg+xml,${decodeURIComponent(text)}`
        }
        // dimensions
        const svg_width = parseInt(this.domElement.getAttribute('width'))
        const svg_height = parseInt(this.domElement.getAttribute('height'))
        new_width = new_width || svg_width
        new_height = new_height || svg_height
        // select data url type
        if(type === 'image/svg') {
            return toSVGURL(this.domElement.outerHTML)
        } else if(type === 'image/png' || type == 'image/jpeg') {
            return new Promise(resolve => {
                // create image
                const img = new Image()
                // dimensions
                img.width = svg_width
                img.height = svg_height
                // blob url
                const html = this.domElement.outerHTML
                const blob = new Blob([html], { type : 'image/svg+xml'} )
                img.src = URL.createObjectURL(blob)
                // onload image
                img.addEventListener('load', () => {
                    const cnv = document.createElement('canvas')
                    cnv.width = new_width
                    cnv.height = new_height
                    cnv.getContext('2d').drawImage(img,
                        0, 0, svg_width, svg_height,
                        0, 0, new_width, new_height
                    )
                    URL.revokeObjectURL(img.src)
                    resolve(cnv.toDataURL(type))
                })
            })
        }
    }

    transform(data) {
        // default values
        if(data.angle === undefined) { data.angle = 0 }
        if(data.flipX === undefined) { data.flipX = false }
        if(data.flipY === undefined) { data.flipY = false }
        if(data.scaleX === undefined) { data.scaleX = 1 }
        if(data.scaleY === undefined) { data.scaleY = 1 }
        // update transform
        this.domElement.style.transform = `
            rotate(${data.angle}deg)
            scale(
                ${data.scaleX * (data.flipY ? -1 : 1)},
                ${data.scaleY * (data.flipX ? -1 : 1)}
            )
        `
        return this
    }

    style(data) {
        Object.keys(data).forEach(prop => {
            this.domElement.style[prop] = data[prop]
        })
        return this
    }

    resize(width, height) {
        this.domElement.setAttribute('width', width)
        this.domElement.setAttribute('height', height)
        return this
    }

    clone() {
        return new Glyph(this.domElement.outerHTML)
    }

    animate(animations) {
        // remove all animatin elements
        Glyph.removeAnimateElements(this.domElement)
        // for each animation
        Object.keys(animations).forEach(name => {
            let d = animations[name]
            let e = null
            // set tag name by aniamtion type
            if(name === 'scale' || name === 'rotate') {
                e = Glyph.createAnimateElement(this.domElement, 'animateTransform')
                e.setAttribute('attributeName', 'transform')
                e.setAttribute('type', name)
            } else {
                e = Glyph.createAnimateElement(this.domElement, 'animate')
                e.setAttribute('attributeName', name)
            }

            // common attributs
            if(undefined !== d.duration) { e.setAttribute('dur', d.duration / 1000 + 's') }
            if(undefined !== d.values) { e.setAttribute('values', d.values.join(';')) }
            if(undefined !== d.from) { e.setAttribute('from', d.from) }
            if(undefined !== d.to) { e.setAttribute('to', d.to) }
            // repeat count
            if(d.repeat === true || d.repeat === undefined) {
                e.setAttribute('repeatCount', 'indefinite')
            } else if(d.repeat === false) {
                e.setAttribute('repeatCount', '1')
            } else {
                e.setAttribute('repeatCount', d.repeat)
            }

        })
    }

}

Glyph.stringtoDomElement = text => {
    const div = document.createElement('div')
    div.innerHTML = text.trim()
    const svg = div.querySelector('svg') || document.createElement('svg')
    // root container element
    const gbx = document.createElement('g')
    gbx.innerHTML = svg.innerHTML
    svg.innerHTML = gbx.outerHTML
    return Glyph.viewBoxtoDimensions(svg)
}

Glyph.viewBoxtoDimensions = root => {
    const dime = root.getAttribute('viewBox').split(' ').map(x => parseInt(x))
    root.setAttribute('width', dime[2] - dime[0])
    root.setAttribute('height', dime[3] - dime[1])
    return root
}

Glyph.removeAnimateElements = root => {
    while(root.querySelector('.glyph_animate')) {
        const g = root.querySelector('.glyph_animate')
        const i = g.getAttribute('index')
        g.querySelector('#glyph_animate_element_' + i).outerHTML = ''
        g.outerHTML = g.innerHTML
    }
}

Glyph.createAnimateElement = (root, tag) => {
    const leng = root.querySelectorAll('g').length
    const name = 'glyph_animate_element_' + leng
    const tray = root.querySelector('g')
    tray.innerHTML =`
    <g
        style="transform-origin: center center;"
        class="glyph_animate"
        index="${leng}"
        >${tray.innerHTML}
        <${tag} id="${name}" />
    </g>
    `
    return tray.querySelector(`#${name}`)
}
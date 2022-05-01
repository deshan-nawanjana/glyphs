class Configure {

    constructor(callback) {
        this.handlers = {}
        this.callback = callback
        this.values = {}
        this.bounds = {}
    }

    addHandler(name, selector, input, output) {
        // input output handlers
        input = input ? input : x => x
        output = output ? output : x => x

        const element = document.querySelector(selector)
        // set bounds
        if(this.bounds[name]) {
            element.setAttribute('min', input(this.bounds[name].min))
            element.setAttribute('max', input(this.bounds[name].max))
        }
        // input event listener
        element.addEventListener('input', () => {
            this.values[name] = output(Configure.getInputValue(element))
            this.update(this.values, false)
            this.callback(Configure.getAllIntoBounds(this.values, this.bounds))
        })
        // on blur check value bounds
        element.addEventListener('blur', () => {
            let value = output(Configure.getInputValue(element))
            value = Configure.getIntoBounds(name, value, this.bounds)
            Configure.setInputValue(element, input(value))
            this.update(this.values, false)
        })
        // create new handler value
        if(this.handlers[name] === undefined) { this.handlers[name] = [] }
        // store handler
        this.handlers[name].push({ element, input, output })
    }

    setBounds(bounds) {
        this.bounds = bounds
        this.update(this.values, false)
    }

    update(values, call = true) {
        Object.keys(values).forEach(name => {
            // return undefined values
            if(this.handlers[name] === undefined) {
                this.values[name] = values[name]
                return
            }
            // update handler elements
            this.handlers[name].forEach(handler => {
                Configure.setInputValue(handler.element, handler.input(values[name]))
            })
            // update values
            this.values[name] = values[name]
        })
        // callback on update
        if(call) {
            this.callback(Configure.getAllIntoBounds(this.values, this.bounds))
        }
    }

}

Configure.getIntoBounds = (name, value, bounds) => {
    const bound = bounds[name]
    if(bound) {
        // type check
        if(bound.type === 'number') {
            value = parseFloat(value)
            if(isNaN(value)) { value = 0 }
        } else if(bound.type === 'string') {
            value = value.toString()
        } else if(bound.type === 'color') {
            const style = new Option().style
            style.color = value
            if(style.color == value.toLowerCase() || value.length !== 7) {
                value = '#000000'
            }
        }
        // max check
        if(bound.max !== undefined) {
            if(value > bound.max) { value = bound.max }
        }
        // min check
        if(bound.min !== undefined) {
            if(value < bound.min) { value = bound.min }
        }
        // values check
        if(bound.values !== undefined) {
            if(bound.values.indexOf(value) === -1) { value = bound.values[0] }
        }
    }
    return value
}

Configure.getAllIntoBounds = (values, bounds) => {
    Object.keys(values).forEach(name => {
        values[name] = Configure.getIntoBounds(name, values[name], bounds)
    })
    return values
}

Configure.getInputValue = element => {
    if(element.getAttribute('type') === 'checkbox') {
        return element.checked
    } else {
        return element.value
    }
}

Configure.setInputValue = (element, value) => {
    if(element.getAttribute('type') === 'checkbox') {
        element.checked = value
    } else {
        element.value = value
    }
}
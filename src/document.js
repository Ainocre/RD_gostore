

const Vue = require('vue')
const {
    cloneDeep,
    isArray,
    isObject,
} = require('lodash')
const { initState } = require('./types')

const observable = (obj) => {
    if (typeof obj !== 'object') return obj

    return new Proxy(obj, {
        get(obj, prop) {
            if (prop in obj) return obj[prop]
            return observable(obj[prop])
        },
        set(obj, prop, value) {
            if (prop in obj) {
                if (isArray(obj[prop])) {
                    
                } else if (isObject(obj[prop])) {
                    const newValue = obj[prop].validate(value)
                    const schema = obj[prop].schema
                    const validate = obj[prop].validate
                    Object.defineProperty(newValue, 'schema', {
                        get() {
                            return schema
                        },
                        enumerable: false,
                    })
                    Object.defineProperty(newValue, 'validate', {
                        get() {
                            return validate
                        },
                        enumerable: false,
                    })
                    obj[prop] = newValue
                } else {
                    const newValue = obj.schema[prop].validate(value)
                    obj[prop] = newValue
                }
                return true
            } else
                throw new Error('This field does not exist')
        },
    })
}

class Document {
    type = 'session'
    collectionName = null

    constructor(store, stateName, state, options) {
        this.store = store
        this.raw = this

        // Init helpers
        this.computed = options.computed || {}
        this.methods = options.methods || {}

        // Init validator and default state
        this.state = Vue.observable(initState(state))

        const proxy = new Proxy(this, {
            get(obj, prop) {
                // Prohibits direct use state field
                if (prop === 'state') throw new Error('Cannot access state directly')

                // Normal obj behavior
                if (prop in obj) return obj[prop]

                // Shortcut computed to root
                if (prop in obj.computed) return obj.computed[prop].bind(proxy)()

                // Shortcut methods to root
                if (prop in obj.methods) return obj.methods[prop].bind(proxy)
    
                // Shortcut state fields to root document
                if (prop in obj.state) {
                    return observable(obj.state[prop])
                }
            },
            set(obj, prop, value) {
                if (prop === 'state') throw new Error('Cannot write state directly')

                // Write state fields
                if (prop in obj.state){
                    const newValue = obj.state.schema[prop].validate(value)
                    obj.state[prop] = newValue
                    return true
                }
    
                // Prohibits to write anything else
                throw new Error('This field does not exist')
            },
        })
        this.proxy = proxy

        return proxy
    }

    // save() {

    // }

    // initStaging() {

    // }

    // saveStaging() {

    // }

    toJS() {
        return cloneDeep(this.raw.state)
    }
}

module.exports = (...params) => new Document(...params)

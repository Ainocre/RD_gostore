

const Vue = require('vue')
const {
    forEach,
    set,
    get,
    cloneDeep,
} = require('lodash')
const { createValidationSchema } = require('./types')

const observer = (document, route, obj) => {
    if (typeof obj !== 'object') return obj

    return new Proxy(obj, {
        get(obj, prop) {
            if (prop in obj) return obj[prop]
            return observer(document, [...route, prop], obj[prop])
        },
        set(obj, prop, value) {
            if (prop in obj) {
                document.update({ [[...route, prop].join('.')]: value })
            } else
                throw new Error('This field does not exist')
        },
    })
}

class Document {
    type = 'session'
    collectionName = null

    constructor(store, stateName, state, options) {
        this.options = options
        this.store = store

        // Init validator and default state
        this.validationSchema = createValidationSchema(state)
        this.state = Vue.observable(this.validationSchema.defaultState)

        // Init helpers
        this.computed = options.computed || {}
        this.methods = options.methods || {}
        this.watchers = options.watch || {}

        const proxy = new Proxy(this, {
            get(obj, prop) {
                if (prop in obj) return obj[prop]
                if (prop in obj.computed) return obj.computed[prop].bind(proxy)()
                if (prop in obj.methods) return obj.methods[prop].bind(proxy)
    
                if (prop in obj.state) {
                    return observer(proxy, [prop], obj.state[prop])
                }
            },
            set(obj, prop, value) {
                if (prop in obj){
                    obj[prop] = value
                    return true
                }
    
                // Temporary
                throw new Error('Cannot write this field')
            },
        })
        this.proxy = proxy

        return proxy
    }

    update(state) {
        const newState = {}

        // validation
        forEach(state, (field, key) => {
            const validator = get(this.validationSchema, key)
            if (validator) {
                newState[key] = validator.validate(field)
            }
        })

        forEach(newState, (field, key) => {
            // Trigger watchers
            if (get(this.watchers, key)) {
                get(this.watchers, key)(cloneDeep(field), this[key])
            }

            // Update state
            set(this.state, key, field)
        })

        return this.proxy
    }

    toJS() {
        return cloneDeep(this.state)
    }
}

module.exports = (...params) => new Document(...params)

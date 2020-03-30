

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
        this.store = store
        this.raw = this

        // Init helpers
        this.computed = options.computed || {}
        this.methods = options.methods || {}
        this.watchers = options.watch || {}

        // Init validator and default state
        this.validationSchema = createValidationSchema(state)
        this.state = Vue.observable(this.validationSchema.defaultState)

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
                    return observer(proxy, [prop], obj.state[prop])
                }
            },
            set(obj, prop, value) {
                // Write state fields
                if (prop in obj.state){
                    obj.update({ [prop]: value })
                    return true
                }
    
                // Prohibits to write anything else
                throw new Error('Cannot write this field')
            },
        })
        this.proxy = proxy

        return proxy
    }

    update(state) {
        console.log('update', state)
        const newState = state

        // validation
        // forEach(state, (field, key) => {
        //     const validator = get(this.validationSchema, key)
        //     if (validator) {
        //         newState[key] = validator.validate(field)
        //     }
        // })

        forEach(newState, (field, key) => {
            // Trigger watchers
            if (get(this.watchers, key)) {
                get(this.watchers, key)(cloneDeep(field), this[key])
            }

            // Update state
            set(this.raw.state, key, field)
        })

        return this.proxy
    }

    toJS() {
        return cloneDeep(this.raw.state)
    }
}

module.exports = (...params) => new Document(...params)

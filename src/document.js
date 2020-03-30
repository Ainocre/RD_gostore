

const Vue = require('vue')
const {
    forEach,
    set,
    get,
    cloneDeep,
} = require('lodash')
const { createValidationSchema } = require('./types')

class Document {
    type = 'session'
    collectionName = null
    watchers = {}

    constructor(store, stateName, state, options) {
        this.options = options
        this.store = store

        // Init validator and default state
        this.validationSchema = createValidationSchema(state)
        this.state = Vue.observable(this.validationSchema.defaultState)

        // Init watchers
        forEach(options.watch, (func, watcher) => {
            this.watchers[watcher] = func.bind(this)
        })

        // Init computed
        forEach(options.computed, (computed, computedName) => {
            Object.defineProperty(this, computedName, {
                get: function () {
                    return computed.bind(this)()
                },
            })
        })

        // Init methods
        forEach(options.methods, (method, methodName) => {
            this[methodName] = method.bind(this)
        })
    }

    update(state) {
        const newState = {}

        // validation
        forEach(state, (field, key) => {
            const validator = get(this.validationSchema, key)
            if (validator) {
                newState[key] = validator.validate(this.store, this, key, field)
            }
        })

        forEach(state, (field, key) => {
            // Trigger watchers
            if (get(this.watchers, key)) {
                get(this.watchers, key)(cloneDeep(field), this[key])
            }

            // Update state
            set(this.state, key, field)
        })
    }
}

module.exports = (...params) => {
    const document = new Document(...params)

    const observer = (route, obj) => {
        if (typeof obj !== 'object') return obj

        return new Proxy(obj, {
            get(obj, prop) {
                return observer([...route, prop], obj[prop])
            },
            set(obj, prop, value) {
                if (prop in obj) {
                    document.update({ [[...route, prop].join('.')]: value })
                } else
                    throw new Error('This field does not exist')
            },
        })
    }

    return new Proxy(document, {
        get(obj, prop) {
            if (prop in obj) return obj[prop]
            if (prop in obj.state) {
                return observer([prop], obj.state[prop])
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
}

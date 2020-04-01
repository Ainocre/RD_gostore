

const Vue = require('vue')
const {
    cloneDeep,
    isArray,
    isObject,
} = require('lodash')
const { initState, setHelpMethods } = require('./types')

const observable = (obj) => {
    if (typeof obj !== 'object') return obj

    return new Proxy(obj, {
        get(obj, prop) {
            console.log(34, prop)
            switch(prop) {
                case 'push':
                case 'pop':
                case 'shift':
                case 'unshit':
                case 'splice':
                    return () => true
                default:
                    return observable(obj[prop])
            }
        },
        set(obj, prop, value) {
            if (prop in obj) {
                if (isObject(obj[prop])) {
                    const newObj = obj[prop].validate(value)
                    setHelpMethods(obj[prop].schema, newObj)
                    // set to subelements too
                    obj[prop] = newObj
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
                    if (isObject(obj.state[prop])) {
                        const newObj = obj.state[prop].validate(value)
                        setHelpMethods(obj.state[prop].schema, newObj)
                        obj[prop] = newObj
                    } else {
                        const newValue = obj.state.schema[prop].validate(value)
                        obj.state[prop] = newValue
                    }
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

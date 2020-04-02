import Document from './document.js'

let Vue

const {
    isObject,
    isArray,
    isUndefined,
    cloneDeep,
} = require('lodash')

class Store {
    state = {}
    collections = {}
    models = {}

    constructor(options) {
        // Options
        // -- localStorage: Boolean => save state into browser
        // -- firebase: firebase => save into firebase
        // -- cryptCode: String => key to decrypt encrypted data
        this.options = options
        this.Vue = Vue
    }

    addState(...params) {
        if (isObject(params[0])) {
            params.unshift('default')
        }
        if (!isObject(params[2])) {
            params[2] = {}
        }

        this.state[params[0]] = Document(this, ...params)

        return this
    }

    addCollection(name, schema, options) {
        this.collections[name] = Object.assign(Vue.observable({ items: [] }), {
            options,
            name,
            schema,
        })

        return this
    }

    setCryptCode(newCryptCode) {
        this.options.cryptCode = newCryptCode
    }

    // auth() {
        
    // }

    // ready() {

    // }

    // signin() {

    // }

    // signup() {

    // }

    // signout() {

    // }

    // resetHard() {

    // }

    // resetSoft() {

    // }
}

export default (...params) => {
    const store = new Store(...params)
    const proxy = new Proxy(store, {
        get(obj, prop) {
            // object methods
            const res = obj[prop]
            if (res) return res

            // Shortcut default state methods to store
            if (obj.state.default && !isUndefined(obj.state.default[prop])) {
                return obj.state.default[prop]
            }

            // Shortcut named states to store
            if (prop in obj.state) return obj.state[prop]

            // Shortcut collections to store
            if (prop in obj.collections) return new Proxy(obj.collections[prop].items, {
                get(arr, arrProp) {
                    switch(arrProp) {
                        case 'add':
                            return (...items) =>
                                arr.push(...items.map((item) => {
                                    if (!isObject(item) || isArray(item)) {
                                        throw new Error('A collection item must be an object')
                                    }
                                    return Document(store, obj.collections[prop].schema, {
                                        ...obj.collections[prop].options,
                                        defaultState: item,
                                    })
                                }))
                        case 'reset':
                            return () => obj.collections[prop].items = []
                        case 'toJS':
                            return () => cloneDeep(arr.map(item => item.toJS()))
                    }

                    if (arrProp in arr) return arr[arrProp]
                },
                set(obj, prop, value) {
                    if (prop in obj) {
                        obj[prop] = value
                        return true
                    }
                    return true
                },
            })
        },
        set(obj, prop, value) {
            // normal behavior of obj methods and vars
            if (prop in obj){
                obj[prop] = value
                return true
            }

            // Shortcut default state to store
            if (obj.state.default && obj.state.default[prop]) {
                obj.state.default[prop] = value
                return true
            }

            throw new Error('You cannot write this field')
        },
    })

    Vue.prototype.$store = proxy

    return proxy
}

export const install = (_Vue, options) => {
    Vue = _Vue
}

import Document from './document.js'

const {
    isObject,
    isUndefined,
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

    addCollection(collectionName, collectionModel) {

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
    return new Proxy(store, {
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
            if (prop in obj.collections) return obj.collections[prop]
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

            throw new Error('This field does not exist')
        },
    })
}

const Document = require('./document')

const {
    isObject,
    isFunction,
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

module.exports = (...params) => {
    const store = new Store(...params)
    return new Proxy(store, {
        get(obj, prop) {
            const res = obj[prop]
            if (res) return res

            if (obj.state.default && obj.state.default[prop]) {
                return obj.state.default[prop]
            }

            if (prop in obj.state) return obj.state[prop]

            if (prop in obj.collections) return obj.collections[prop]
        },
        set(obj, prop, value) {
            if (prop in obj){
                obj[prop] = value
                return true
            }

            if (obj.state.default && obj.state.default.state[prop]) {
                return obj.state.default.update({ [prop]: value })
            }

            throw new Error('This field does not exist')
        },
    })
}

const State = require('./state')

const {
    isObject,
    forEach,
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

        this.state[params[0]] = new State(this, ...params)
        if (params[0] === 'default') {
            // Set state shortcuts to store root

            forEach(params[1], (field, key) => {
                Object.defineProperty(this, key, {
                    set: function (value) {
                        this.state.default[key] = value
                    },
                    get: function () {
                        return this.state.default[key]
                    },
                })
            })

            forEach(params[2].computed, (computed, computedName) => {
                Object.defineProperty(this, computedName, {
                    get: function () {
                        return this.state.default[computedName]
                    },
                })
            })

            forEach(params[2].methods, (method, methodName) => {
                this[methodName] = (...params) => this.state.default[methodName](...params)
            })
        } else {
            Object.defineProperty(this, params[0], {
                set: function (value) {
                    this.state[params[0]] = value
                },
                get: function () {
                    return this.state[params[0]]
                },
            })
        }

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

module.exports = Store

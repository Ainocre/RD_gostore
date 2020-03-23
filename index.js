const Vue = require('vue')
const { forEach, cloneDeep, isObject, isArray } = require('lodash')

class Store {
    constructor(schema) {
        // Init state
        const state = {}
        forEach(schema, (field, key) => {
            if (isObject(field)) {

            } else if (isArray(field)) {

            } else {
                state[key] = field
            }

            Object.defineProperty(this, key, {
                set: function (value) {
                    this.update({ [key]: cloneDeep(value) })
                },
                get: function () {
                    return this.state[key]
                },
            })
        })
        this.state = Vue.observable(state)

        return this
    }

    update(obj) {
        forEach(obj, (field, key) => {
            this.state[key] = field
        })
    }

    computed(obj) {
        forEach(obj, (computed, computedName) => {
            Object.defineProperty(this, computedName, {
                get: function () {
                    return computed.bind(this)()
                },
            })
        })

        return this
    }

    methods(obj) {
        forEach(obj, (method, methodName) => {
            this[methodName] = method.bind(this)
        })

        return this
    }
}

module.exports.Store = (...params) => new Store(...params)

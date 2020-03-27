

const Vue = require('vue')
const {
    forEach,
    cloneDeep,
} = require('lodash')
const { parseType } = require('./types')

class State {
    type = 'session'
    collectionName = null
    watchers = {}
    schema = {}

    constructor(store, stateName, state, options) {
        this.options = options
        this.store = store
        this.name = stateName

        // Init state
        const tempState = {}
        forEach(state, (field, key) => {
            // Prepare schema
            this.schema[key] = parseType(field)

            // tempState[key] = this.schema[key].getDefaultValue()

            Object.defineProperty(this, key, {
                set: function (value) {
                    this.update({ [key]: cloneDeep(value) })
                },
                get: function () {
                    return this.state[key]
                },
            })
        })

        this.state = Vue.observable(tempState)

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
            newState[key] = this.schema[key].validate(this.store, this, key, field)
        })

        forEach(state, (field, key) => {
            // Trigger watchers
            if (this.watchers[key]) {
                this.watchers[key](cloneDeep(field), this[key])
            }

            // Update state
            this.state[key] = field
        })
    }
}

module.exports = State

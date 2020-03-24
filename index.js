const Vue = require('vue')
const {
    cloneDeep,
    forEach,
    isArray,
    isBoolean,
    isFunction,
    isNumber,
    isObject,
    isString,
} = require('lodash')

const getValidator = ({ store, schema }) => (obj) => {
    const newObj = cloneDeep(obj)

    // alert unwanted extra fields and format obj
    forEach(newObj, (field, key) => {
        if (!schema[key])
            throw new Error(`${key} field is missing in store schema`)
        if (isFunction(schema[key].format)) {
            newObj[key] = schema[key].format({ store, value, key, obj })
        }
    })

    // default and required
    forEach(schema, (field, key) => {
        if (field.default && !newObj[key]) {
            newObj[key] = isFunction(field.default)
                ? field.default({ store })
                : field.default
        }
        if (field.required && !newObj[key])
            throw new Error(`${key} field is required`)
    })

    // Validations
    forEach(newObj, (field, key) => {
        // type

        // oneOf
        if (isArray(field.oneOf)) {
            if (!field.oneOf.includes(newObj[key]))
                throw new Error(`${key} field is ${newObj} and must be one of "${field.oneOf.join(', ')}"`)
        }

        // validation function
        if (isFunction(field.validation)) {
            if (!field.validation({ store, value: newObj[key], key, newObj }))
                throw new Error(`${key} field is not valid"`)
        }
    })
}

const prepareSchema = (schema) => {
    const newSchema = {}

    forEach(schema, (field, key) => {
        if (isObject(field)) {
            newSchema[key] = field

        } else if (isArray(field)) {

        } else if (isString) {
            
        }
    })
}

class Store {
    watchers = {}
    schema = null

    constructor(schema) {
        this.schema = prepareSchema(schema)
        this.state(schema)
        this.validate = getValidator({ store: this, schema })
    }

    isValid(obj) {
        try {
            this.validate(obj)
            return true
        } catch(err) {
            return false
        }
    }

    update(obj) {
        forEach(obj, (field, key) => {
            this.state[key] = field
        })
    }

    state(obj) {
        // Init state
        const state = {}
        forEach(obj, (field, key) => {
            if (isObject(field)) {

            } else if (isArray(field)) {

            } else {
                state[key] = field
            }

            Object.defineProperty(this, key, {
                set: function (value) {
                    // Trigger watchers
                    if (this.watchers[key]) {
                        this.watchers[key](cloneDeep(value), this[key])
                    }
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

    watch(obj) {
        forEach(obj, (func, watcher) => {
            this.watchers[watcher] = func.bind(this)
        })

        return this
    }
}

const types = {
    text: {
        type: 'string',
        validation: isString,
    }
}

// validation
// detection

module.exports.Store = (...params) => new Store(...params)

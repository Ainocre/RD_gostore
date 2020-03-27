const Vue = require('vue')
const moment = require('moment')
const emailRegex = require('email-regex')
const {
    isObject,
    forEach,
    isArray,
    isString,
    isFunction,
    isBoolean,
    isNumber,
    isDate,
    keys,
    isNil,
    isUndefined,
    constant,
    cloneDeep,
} = require('lodash')

// Validation des champs

console.log('________________________')
console.log('')

const typeDict = {
    any: constant(true),
    date: (val) => moment(val).isValid(),
    time: (val) => moment(val).isValid(),
    datetime: (val) => moment(val).isValid(),
    email: (val) => isString(val) && emailRegex({ exact: true }).test(val),
    text: (val) => isString(val),
    textarea: (val) => isString(val),
    toggle: (val) => isBoolean(val),
    checkbox: (val) => isBoolean(val),
    number: (val) => isNumber(val),
}

// [
//     'file',
//     'html',
//     'canvas',
//     'sound',
//     'video',
//     'dropZone',
//     'slider',
//     'code',
//     'markdown',
//     'radio',
//     'phone',
//     'pic',
//     'rating',
//     'ref',
//     'select',
//     'snapshot',
//     'tabs',
// ]

class Type {
    options = {}

    constructor(type) {
        if (!keys(typeDict).includes(type)) throw new Error(`${type} type is not supported`)
        this.type = type
    }

    // ________________________________________________
    // Options setters
    default(defaultValue = null) {
        this.options.default = defaultValue
        return this
    }

    min(val) {
        if (!isNumber(val)) throw new Error('"min" must be of type Number')
        this.options.min = val
        return this
    }

    max(val) {
        if (!isNumber(val)) throw new Error('"max" must be of type Number')
        this.options.max = val
        return this
    }

    spread(val) {
        if (!isNumber(val)) throw new Error('"spread" must be of type Number')
        this.options.spread = val
        return this
    }

    meta(val) {
        if (!isObject(val)) throw new Error('"meta" must be of type Object')
        this.options.metas = val
        return this
    }

    fileFormats(val) {
        if (!isArray(val)) throw new Error('"fileFormats" must be of type Array')
        this.options.fileFormats = val
        return this
    }

    encodings(val) {
        if (!isArray(val)) throw new Error('"encodings" must be of type Array')
        this.options.encodings = val
    }

    validation(func) {
        if (!isFunction(func)) throw new Error('"validation" must be of type Function')
        this.options.validation = func
        return this
    }

    format(func) {
        if (!isFunction(func)) throw new Error('"format" must be of type Function')
        this.options.format = val
        return this
    }

    oneOf(arr) {
        if (!isArray(arr)) throw new Error('"oneOf" must be of type Array')
        this.options.oneOf = arr
        return this
    }

    // Todo
    crypted(val = true) {
        if (!isBoolean(val)) throw new Error('"crypted" must be of type Boolean')
        this.options.crypted = val
        return this
    }

    options(val) {
        if (!isArray(val) && !isFunction(val)) throw new Error('"options" must be of type Array or Function')
        this.options.options = val
        return this
    }

    of(val) {
        if (!isString(val)) throw new Error('"of" must be of type String')
        this.options.of = val
        return this
    }

    // Works only in collections
    mine(val = true) {
        if (!isBoolean(val)) throw new Error('"mine" must be of type Boolean')
        this.options.mine = val
        return this
    }

    // Works only in collections
    uniq(val = true) {
        if (!isBoolean(val)) throw new Error('"uniq" must be of type Boolean')
        this.options.uniq = val
        return this
    }

    required(val = true) {
        if (!isBoolean(val)) throw new Error('"required" must be of type Boolean')
        this.options.required = val
        return this
    }

    length(len) {
        if (!isNumber(len)) throw new Error('"length" must be of type Number')
        this.options.length = len
        return this
    }

    minLength(len) {
        if (!isNumber(len)) throw new Error('"minLength" must be of type Number')
        this.options.minLength = len
        return this
    }

    maxLength(len) {
        if (!isNumber(len)) throw new Error('"maxLength" must be of type Number')
        this.options.maxLength = len
        return this
    }

    isNaN(val = true) {
        if (!isBoolean(val)) throw new Error('"isNaN" must be of type Boolean')
        this.isNaNValue = val
        return this
    }

    // ________________________________________________
    // Getters

    validate(store, document, fieldName, field) {
        const res = field

        // format
        if (this.options.format) {
            res = this.options.format({ store, document, fieldName, field })
        }

        // undefined
        if (isUndefined(res)) throw new Error(`${fieldName} is undefined. A field cannot be undefined`)

        // default and required
        if (res === null) {
            if (!isNil(this.options.default)) res = this.options.default
            else if (this.options.required) throw new Error(`${fieldName} field is required`)
        }

        // type validation
        if (res !== null && !typeDict[this.type](field))
            throw new Error(`${fieldName} field must be ${this.type} type`)

        // isNaN
        if (isBoolean(this.options.isNaN) && isNaN(field) !== this.options.isNaN) {
            if (this.options.isNaN) {
                throw new Error(`${fieldName} field must not be a Number`)
            }
            throw new Error(`${fieldName} field must be a Number`)
        }

        // min, max and spread
        if (isNumber(field)) {
            const { min, max, spread } = this.options
            if (isNumber(min) && field < min) throw new Error(`${fieldName} must be equal or higher than ${min}`)
            if (isNumber(max) && field > max) throw new Error(`${fieldName} must be equal or lower than ${max}`)
            if (isNumber(spread) && field % spread) throw new Error(`${fieldName} must be a multiple of ${spread}`)
        }

        // oneOf, length, minLength and maxLength
        if (isString(field)) {
            const { oneOf, length, minLength, maxLength } = this.options
            if (isArray(oneOf) && !oneOf.includes(field))
                throw new Error(`${fieldName} must be one of : ${oneOf.join(', ')}`)
            if (isNumber(length) && field.length !== length) 
                throw new Error(`${fieldName} length must be ${length}`)
            if (isNumber(minLength) && field.length < minLength) 
                throw new Error(`${fieldName} length must be equal or higher than ${minLength}`)
            if (isNumber(maxLength) && field.length > maxLength) 
                throw new Error(`${fieldName} length must be equal or lower than ${maxLength}`)
        }

        // validation
        if (isFunction(this.options.validation) && !this.options.validation({ store, document, fieldName, field}))
            throw new Error(`${fieldName} didn't pass schema validation function`)
    }
}

const type = (...params) => new Type(...params)

const parseType = (ele) => {
    if (ele.constructor.name === 'Type') return ele

    if (typeof ele === 'object') throw new Error('Object and Array are not allowed')

    if (ele === null) return type('any')
    if (isString(ele)) return type('text').default(ele)
    if (isBoolean(ele)) return type('toggle').default(ele)
    if (isNumber(ele)) return type('number').default(ele)
    if (isDate(ele)) return type('datetime').default(ele)
    return type('any')
}

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

    auth() {
        
    }

    ready() {

    }

    signin() {

    }

    signup() {

    }

    signout() {

    }

    setCryptCode(newCryptCode) {
        this.options.cryptCode = newCryptCode
    }

    resetHard() {

    }

    resetSoft() {

    }
}

module.exports.Store = Store

const store = new Store().addState({
    firstName: 'Gui',
    lastName: 'Bou',
    cp: type('text').length(5),
    description: type('text').maxLength(10),
    name: type('text').minLength(3),
    count: type('number').min(3),
})

store.cp = '69005'

// console.log(store)


// checkbox group
// subdocuments
// array
// collections
// online
// observables
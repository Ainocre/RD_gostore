

import {
    cloneDeep,
} from 'lodash'
import { initState } from './types.js'

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
        this.state = store.Vue.observable(initState(state))

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
                if (obj.state[prop]) {
                    return obj.state[prop]
                }
            },
            set(obj, prop, value) {
                if (prop === 'state') throw new Error('Cannot write state directly')

                // Write state fields
                if (obj.state[prop]){
                    obj.state[prop] = value
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

export default (...params) => new Document(...params)

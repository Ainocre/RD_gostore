import {
  cloneDeep,
  uniqueId,
} from 'lodash'
import { initState } from './types.js'

class Document {
  meta = {
    _removed: false,
    _hardRemoved: false,
    _createdAt: Date.now(),
    _updatedAt: Date.now(),
    _id: uniqueId('doc_'),
  }

  constructor(store, schema, options) {
    this.store = store
    this.raw = this

    // Init helpers
    this.computed = options.computed || {}
    this.methods = options.methods || {}

    // Init validator and default state
    this.state = store.Vue.observable(initState(schema, options.defaultState))

    const proxy = new Proxy(this, {
      get(obj, prop) {
        // Prohibits direct use state field
        // if (prop === 'state') throw new Error('Cannot access state directly')

        // if (prop === 'meta') throw new Error('Cannot access to meta data directly')

        // Normal obj behavior
        if (prop in obj) return obj[prop]

        // Shortcut computed to root
        if (prop in obj.computed) return obj.computed[prop].bind(proxy)()

        // Shortcut methods to root
        if (prop in obj.methods) return obj.methods[prop].bind(proxy)

        // Shortcut state fields to root document
        if (prop in obj.state) {
            return obj.state[prop]
        }
      },
      set(obj, prop, value) {
        if (prop === 'state') throw new Error('Cannot write state directly')

        // Write state fields
        if (prop in obj.state){
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

  hardRemove() {
    this.meta._hardRemoved = true
  }

  softRemove() {
    this.meta._removed = true
  }

  recover() {
    this.meta._removed = false
  }

  toJS() {
    return cloneDeep({
      ...this.raw.meta,
      ...this.raw.state
    })
  }
}

export default (...params) => new Document(...params)

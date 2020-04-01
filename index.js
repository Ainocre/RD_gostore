const Store = require('./src/store.js')
const { type } = require('./src/types')
const { get } = require('lodash')

module.exports.Store = Store
module.exports.type = type

const store = Store().addState({
    user: {
        tasks: [{ name: type('text') }],
    },
}, {
    methods: {
        addItem(item) {
            return this.user.tasks.push(item)
        }
    }
})

// Vue observables
// collections

// Auto modale
// Jointures
// checkbox group


// Améliorer le système de typage
// Tout pouvoir faire par fonctions et non valeurs brutes
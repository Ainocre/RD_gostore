const Store = require('./src/store.js')
const { type } = require('./src/types')

module.exports.Store = Store
module.exports.type = type

const store = Store().addState({
    tasks: [{
        name: type('text').required(),
    }],
})

// store.tasks.push('ok')
// console.log(2, store.state.default.state.tasks)

// les arrays

// Vue observables
// collections

// Auto modale
// Jointures
// checkbox group


// Améliorer le système de typage
// Tout pouvoir faire par fonctions et non valeurs brutes
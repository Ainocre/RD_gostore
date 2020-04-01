const Store = require('./src/store.js')
const { type } = require('./src/types')

module.exports.Store = Store
module.exports.type = type

const store = Store().addState({
    user: {
        tasks: [{ name: type('text') }],
    },
})

store.user.tasks.push({ name: 'todo' })
console.log(0, store.user.tasks[0].schema)



// tester computed et methods


// types
// obj et arrays
// observers chainés



// les arrays
// refacto
// Vue observables
// collections

// Auto modale
// Jointures
// checkbox group


// Améliorer le système de typage
// Tout pouvoir faire par fonctions et non valeurs brutes
const Store = require('./src/store.js')
const { type } = require('./src/types')

module.exports.Store = Store
module.exports.type = type

const store = Store().addState({
    active: true,
    user: {
        firstName: 'Gui',
        lastName: 'Bou',
        address: {
            city: 'Lyon'
        },
    },
})

store.user.address = { city: 'Paris' }
console.log(store.user.address.schema)

// tester computed et methods


// types
// obj et arrays
// observers chainés



// les arrays

// Vue observables
// collections

// Auto modale
// Jointures
// checkbox group


// Améliorer le système de typage
// Tout pouvoir faire par fonctions et non valeurs brutes
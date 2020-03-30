const Store = require('./src/store.js')
const { type } = require('./src/types')

module.exports.Store = Store
module.exports.type = type

const store = Store().addState({
    firstName: 'Gui',
    lastName: 'Bou',
    age: 20,
}, {
    methods: {
        addAge() {
            this.age++
        },
    },
})




// types
// watchers
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
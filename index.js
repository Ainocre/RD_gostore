const Store = require('./src/store.js')
const { type } = require('./src/types')

module.exports.Store = Store
module.exports.type = type

const store = Store().addState({
    test: 'ok',
    firstName: 'gui',
    lastName: 'bou',
    user: {
        address: {
            city: 'Lyon',
        },
        // tasks: [{ name: type('text').required() }]
    },
    // tasks: [{
    //     name: type('text').required(),
    // }],
}, {
    computed: {
        fullName() {
            return `${this.firstName} ${this.state.lastName}`
        }
    }
})

// store.user.address.city = 'Paris'
console.log(2, store.fullName)

// Peut etre tout mettre en proxy direct pas au moment du get
// Vérifier que c'est bien watché de partout
// update
// Si c'est un array
// Si c'est un sous objet complet
// watch array methods


// collections
// checkbox group

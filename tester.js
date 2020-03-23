const { Store, type } = require('./index.js')

// const store = new Store({
//     firstName: '',
//     lastName: '',
//     categories: [{ name: '' }],
//     tasks: [{
//         checked: false,
//         title: '',
//         category: type.ref('categories'),
//     }]
// })
//     .computed({
//         fullName() {
//             return this.firstName + ' ' + this.lastName
//         },
//     })
//     .methods({
//         alert() {
//             alert('ok')
//         },
//     })
//     .modals({
//         categories: true,
//         tasks: { title: type.string },
//     })

// const test = {
//     default: 0,
//     min,
//     max,
//     validation,
//     format,
//     type,
//     oneOf,
//     encryption,
//     required,
// }

// On peut mettre un number, string, boolean ou date direct (tout sauf object)
// Pour faire une collection on utilise []

const store = Store({
    firstName: 'Gui',
    lastName: 'Bou',
    counter: 1,
    client: true,
})
    .computed({
        fullName() {
            return this.firstName + ' ' + this.lastName
        },
    })
    .methods({
        alert() {
            console.log('33, ok')
        },
    })

console.log(store.alert())

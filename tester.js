const { Store, type } = require('./index.js')

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
//     length
//     isNaN
// }


// ______________________________________________________________________________
// Todolist exemple
const todoStore = new Store({ cryptCode: 'azerty', firebase: {} })

todoStore
    .addCollection('users', {
        firstName: type('text').required(),
        lastName: type('text').required(),
        role: type('select').default('user').oneOf(['admin', 'manager', 'user']).options([
            { value: 'admin', label: 'Administrateur' },
            { value: 'manager', label: 'Manager' },
            { value: 'user', label: 'Utilisateur' },
        ]),
        email: type('email').required().namespace('private'),
        phone: type('phone').meta({ countryCode: 'fr' }).namespace('private')
    }, {
        form: ['firstName', 'lastName', 'phone'],
        computed: {
            fullName() {
                return `${this.firstName} ${this.lastName}`
            },
        },
        rules: {
            default: {
                read: true,
                write: ({ rules }) => [rules.isMine(), rules.me('role', ['admin', 'manager'])]
            },
            private: {
                all: ({ rules }) => rules.isMine()
            },
        },
    })
    .addCollection('tags', {
        name: type('text').required(),
        color: type('color'),
    }, {
        form: ['name'],
        mine: true,
        rules: {
            all: ({ rules }) => rules.isMine(),
        },
    })
    .addCollection('tasks', {
        checked: false,
        description: type('textarea').crypted(),
        name: type('text').required().crypted(),
        tags: [type('ref').of('tags')],
    }, {
        form: ['name', 'description'],
        mine: true,
        rules: {
            all: ({ rules }) => rules.isMine(),
        },
    })
    .auth()


// ______________________________________________________________________________
// ecommerce exemple

const ecommerceStore = new Store({ cryptCode: 'azerty', firebase: {} })

ecommerceStore
    .addState({
        startSession: new Date(),
        visitesProductsNb: 0,
    })
    .addModel('settings', {
        name: 'Mon magasin !',
        color: 'light-blue',
    }, {
        read: true,
        write: ({ rules }) => rules.me('role', 'admin'),
    })
    .addCollection('users', {
        email: type('email').required(),
        firstName: type('text').required(),
        lastName: type('text').required(),
        address: type('address'),
        role: type('select').default('user').oneOf(['admin', 'seller', 'user']).options([
            { value: 'admin', label: 'Administrateur' },
            { value: 'seller', label: 'Vendeur' },
            { value: 'user', label: 'Utilisateur' },
        ]),
    }, {
        form: ({ user }) => user.role.is('admin')
            ? ['firstName', 'lastName', 'address', 'role']
            : ['firstName', 'lastName', 'address'],
        rules: {
            read: ({ rules }) => [rules.mine(), rules.document('role', '==', 'seller')],
            write: ({ rules }) => [ryles.mine(), rules.me('role', 'admin')],
        },
    })
    .addCollection('products', {
        active: true,
        name: type('text').required(),
        description: type('markdown').required(),
        price: type('integer').min(5).max(500).spread(5),
        photos: [type('photos').fileFormats(['jpg', 'png']).encoding({
            thumb: { maxWidth: 150, maxHeight: 150, quality: 0.5 },
            mobile: { maxWidth: 800, maxHeight: 600, quality: 0.5 },
            desktop: { maxWidth: 1920, maxHeight: 1080, quality: 0.8 },
        })],
    }, {
        read: ({ rules }) => rules.document('active', '==', true),
        write: ({ rules }) => rules.and([rules.mine(), rules.me('role', ['admin', 'seller'])]),
    })
    .addCollection('commands', {
        wantedDelivery: type('datetime').required(),
        product: type('snapshot').of('products'),
        user: type('snapshot').of('users').mine(),
        seller: type('ref').of('users'),
        status: type('text').oneOf(['waiting', 'paid', 'sent', 'done']),
        payment: {
            date: type('datetime'),
            amount: type('number'),
            paymentSolution: type('text').oneOf(['cash', 'cb']),
            address: {
                street: type('text'),
                city: type('text'),
                postalCode: type('text').length(5).isNaN(false),
            },
        },
        rating: {
            _namespace: 'public',
            note: type('rating').max(5),
            details: type('textarea'),
        },
    }, {
        rules: {
            read: ({ rules }) => [rules.mine(), rules.me('role', 'admin'), rules.and([rules.me('role', 'seller'), rules.mine('seller')])],
            write: ({ rules }) => [rules.me('role', 'admin'), rules.and([rules.me('role', 'seller'), rules.mine('seller')])],
        }
    })
    .addCollection('cart', {
        product: type('ref').of('products'),
        quantity: 1,
    }, {
        type: 'localStorage',
    })
    .auth()


// ______________________________________________________________________________
// chat exemple without login
const chatStore = new Store({ firebase: {} })

chatStore
    .addState({
        pseudo: 'Invité',
        selectedRoom: null,
    })
    .addCollection('room', {
        name: type('text').uniq().required(),
    }, {
        subscrib: true,
        form: ['name'],
        mine: true,
        rules: {
            read: true,
            write: ({ rules }) => rules.mine(),
        },
    })
    .addCollection('messages', {
        message: type('markdown').required(),
    }, {
        mine: true,
        form: ['message'],
        subscrib: true,
        rules: {
            read: true,
            write: ({ rules }) => rules.mine(),
        },
    })
    .start()

// ______________________________________________________________________________
// misc exemple
const miscStore = new Store({ localStorage: true })

miscStore
    .addCollection('actors', { name: type('text').required() })
    .addCollection('films', { name: type('text').required() })
    .addMtm('actors', 'films')



// hooks
// watch
// fetch, sync, async
// Reset logout qui ne reset pas tout
// Vuejs ou quasarjs
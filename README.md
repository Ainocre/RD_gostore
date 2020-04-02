# Gostore

## Description

Gostore is a global store for vuejs and quasarjs. Inspired by Mobx State Tree.
Data are typed, reactives and validated before to be muted to prevent data inconsistency.
## installation
`npm i -S gostore` ou `yarn add gostore`

Gostore is under beta version. Do not use for production yet

## Usage

```js
import gostore, { Store, type } from 'gostore'
import Vue from 'vue'

Vue.use(gostore)

const store = Store().addState({
	firstName: 'Foo',
	lastName: 'Bar',
})

console.log(store.firstName) // -> Foo

Vue.prototype.$store = store
```

You can now use it in yours views
```html
<div>
	{{$store.firstName}}
</div>
```
Anytime if you change the store all views will be updated
```js
store.firstName = 'bazz'
```

## Computed
You can create computed in an options object like so
```js
const store = Store().addState({
	firstName: 'Foo',
	lastName: 'Bar',
}, {
	computed: {
		fullName() {
			return `${this.firstName} ${this.lastName}`
		}
	}
})

console.log(store.fullName) // -> 'Foo Bar'
```
## Methods
You can add methods in the options object
```js
const store = Store().addState({
	age: 20,
}, {
	methods: {
		incrementAge() {
			return this.age++
		}
	}
})

store.incrementAge()
console.log(store.age) // -> 21
```

## Nested Objects and Arrays
You can create a deep state. The data structure can't be changed in the future
```js
const store = Store().addState({
	user: {
		name: 'Foo',
		address: {
			city: 'NY',
		},
		tasks: ['']
	},
})

// __________________________________________
// These will throw an error

store.whatever = true
// ALERT ! This field doesnt exists

store.user = 'John'
// ALERT ! This field must be an object

store.user.tasks.push(21)
// ALERT ! This field must be a string

// __________________________________________
// These will work perfectly

store.user.tasks.push('clean my computer')
console.log(store.user.tasks) // -> ['clean my computer']

store.user.tasks = ['test']
console.log(store.user.tasks) // -> ['test']

store.user.tasks.push('clean my computer')
console.log(store.user.tasks) // -> ['clean my computer']

store.user.address.city = 'LA'
store.user.address = { city: 'SF' }
```
## Typed state
You can create a detailed schema to validate all new values. If no default values are set, the value will be null by default.
```js
import gostore, { Store, type } from 'gostore'

Vue.use(gostore)

const store = Store().addState({
	user: {
		name: type('text')
			.minLength(2)
			.required()
			.default('invited'),
		age: type('number')
			.min(18)
			.max(100)
			.spread(2), // just for example
		role: type('text').oneOf(['admin', 'owner', 'user']),
		description: type('textarea'),
	}
})
```
Current allowed types : text, textarea, number, checkbox, toggle
Lot more explanations and types coming soon !
Teasing : photo, file, select, radio, toggle, checkbox, etc.

## Type shortcuts
In first examples we declared types as pure data. In fact they are shortcuts for a type and a default value. Example :
```js
Store().addState({
	task: 'No name',
	checked: false,
	order: 3,
})
```
Is exactly the same as :
```js
Store().addState({
	task: type('text').default('No name'),
	checked: type('checkbox').default(false),
	order: type('number').default(3),
})
```
## Multiple states
Sometime you want more than one store. You can create namespaced stores giving them a name. If they haven't a name, so they are default store, and there properties are proxied to the root of the store.
```js
Store()
	.addState({
		name: 'Invited',
	})
	addState('cart', {
		productName: 'computer',
	})
	
console.log(store.name) // -> 'Invited'
console.log(store.cart.productName) // -> 'computer

// These are shortcuts to the real store state here :
console.log(store.state)
// -> { default: { name: 'Invited' }, cart: { productName: 'computer' } }
```

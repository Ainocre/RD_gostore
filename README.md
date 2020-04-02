# Gostore

## Description

Gostore is a global store inspired by MobX state tree for Vue.js and the Quasar Framework.
Data is typed, reactive, and validated before being muted to prevent inconsistency.

⚠️ Gostore is in beta, don't use it for production yet! ⚠️

## installation

`npm i -S gostore` or `yarn add gostore`

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

You can now use it in your views

```html
<div>
	{{$store.firstName}}
</div>
```

At any time if you change the store all views will be updated.

```javascript
store.firstName = 'bazz'
```

## Computed values

You can create computed values in an option object like this:

```javascript
=======
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
You can add methods in the option object

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
You can create deep states. The structure of the data cannot be changed later.

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
// ALERT! This field doesn't exist

store.user = 'John'
// ALERT! This field must be an object

store.user.tasks.push(21)
// ALERT! This field must be a string

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
You can create detailed schemas to validate all new values. If no default value is set, the value will be null by default.

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

Current allowed types:
* text
* textarea
* number
* checkbox
* toggle

Explanations and types to come:
* photo
* file
* select
* radio
* toggle
* checkbox
* many more!

## Type shortcuts
In the first examples, we declared the types as pure data. In fact, they are shortcuts for a type and a default value. For example:

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
Sometimes you want more than one store. You can create stores in a namespace by giving them a name. If they don't have a name, then they are default stores, and their properties are linked to the root store.

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

// These are shortcuts to the actual store state:
console.log(store.state)
// -> { default: { name: 'Invited' }, cart: { productName: 'computer' } }
```

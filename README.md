# Create model relationships with mobx

modeled-mobx is a lightweight layer on top of MobX 6 to easily serialize and hydrate javascript classes to/from JSON 


## Introduction

modeled-mobx replaces mobx's `makeObservable` with a `modelize` function.  `modelize` adds "field" and "model" properties to 
configure the model's fields as observables that get and set their values when `serialize` and `hydrate` respectively are called.

It also includes a `field` and `model` decorator that can optionally be used instead of specifiying each property on the
options passed to `modelize`

## Example

```typescript
import { modelize, field, model, hydrateModel, serialize, getParentOf } from 'modeled-mobx'
import { observable, computed } from 'mobx'

class Item {
    name = '' 
    material = ''
    get box() { return getParentOf<Box>(this) }
    constructor() {
        modelize(this, {
            name: field,
            material: observable,
        })
    }
}

// an example using decorators
export class Box {

    @field width = 0;
    @field height = 0;
    @field depth = 0;

    @observable serial: number = 0; // observable from mobx will be set by hydrate
                                    // and initialized by modelize.  It will not be serialized
    @computed get volume() {
        return this.width * this.height * this.depth;
    }

    @model(Item) items: Item[] = []; // note: this is an array of "item" models
    @model(Item) defaultItem?: Item; // and this one is a single model

    constructor() {
        modelize(this) // individual fields do not need to be specified when using decorators
    }
}


const box = hydrateModel(Box, {
    width: 10, height: 10, depth: 10, serial: 1234,
    items: [{ name: 'Box #1' }, { name: 'Box #2' }],
    defaultItem: { name: 'Fruit' },
})

console.log(box.items[1].name, box.volume) // Box #2, 1000
console.log(box.items[1].box === box) // true 
console.log(serialize(box))
// {
//   width: 10, height: 10, depth: 10,
//   items: [{ name: 'Box #1' }, { name: 'Box #2' }],
//    defaultItem: { name: 'Fruit' }
//  }

```

## Edge cases and limitations

#### properties must be assigned a value 

When using Javascript decorators and uninitialized properties, Mobx may raise an exception: `Cannot apply 'observable' to '<property name>': Field not found`. This is caused by an incorrect babel configuration.  More info: https://github.com/nathanstitt/modeled-mobx/issues/1

#### there must be properties to decorate


An exception will be raised if modelize is called with no properties and none are decorated.

```js

class EmptyThing {
   name = 'empty'
   constructor() {
      modelize(this);
   }
}

new EmptyThing() // raises "[MobX] No annotations were passed to makeObservable, but no decorated members have been found either"
```

#### inheritance is tricky

There have been multiple bugs worked around in attempting to inherit from a modelized base class.  It now seems to be working but there may still be lingering bugs.  Please open issues if you note any weirdness. 

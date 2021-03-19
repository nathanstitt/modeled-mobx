import { modelize } from './modelize'
import { hydrate } from './serialize-hydrate'
import { getParentOf } from './inverse'
import { field, model } from './decorators'

class Parent {

    faveChild?: Child
    children: Child[] = []

    constructor() {
        modelize(this, {
            faveChild: model(Child),
            children: model(Child),
        })
    }
}

class Child {
    name = ''

    get parent() {  return getParentOf<Parent>(this) }

    constructor() {
        modelize(this, {
            name: field,
        })
    }
}

describe('inverse', () => {
    it('records and gets the parent for a child', () => {
        const parent = hydrate(Parent, {
            faveChild: { name: 'my favorite' },
            children: [
                { name: 'One' },
                { name: 'Two' },
                { name: '11' },
            ]
        })
        expect(parent.faveChild?.name).toEqual('my favorite')
        expect(parent.faveChild!.parent).toBe(parent)
        expect(parent.children).toHaveLength(3)
        expect(parent.children[0].parent).toBe(parent)
    })
})

import { modelize } from './modelize'
import { hydrateModel } from './serialize-hydrate'
import { getParentOf } from './inverse'
import { field, model } from './schema'

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
        const parent = hydrateModel(Parent, {
            faveChild: { name: 'my favorite' },
            children: [
                { name: 'One' },
                { name: 'Two' },
                { name: '11' },
            ]
        })
        expect(parent.faveChild).toBeInstanceOf(Child)
        expect(parent.faveChild?.name).toEqual('my favorite')
        expect(parent.faveChild?.parent).toBe(parent)
        expect(parent.children).toHaveLength(3)
        parent.children.forEach(c => expect(c.parent).toBe(parent))
    })
})

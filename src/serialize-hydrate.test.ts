import { modelize } from './modelize'
import { hydrate, serialize } from './serialize-hydrate'
import { model, field } from './decorators'
import { getParentOf } from './inverse'

class AssociatedModel {
    name?: string
    constructor() {
        modelize(this, {
            name: field,
        })
    }
}

class SerializeTestModel {
    unModeled = ''
    hasOne?: AssociatedModel
    hasMany: AssociatedModel[] = []
    constructor() {
        modelize(this, {
            hasOne: model(AssociatedModel),
            hasMany: model(AssociatedModel),
        })
    }
}

class HydratedModel {
    hydrate = jest.fn(function(attrs) {
        expect(attrs).toEqual({ foo: 'bar' })
    })
    serialize = jest.fn(function() {
        return { name: 'foo' }
    })
    constructor() {
        modelize(this, {}) // shouldn't error with empty properties
    }
}


describe('Serialize/Hydrate', () => {
    let m!: SerializeTestModel

    beforeEach(() => {
        m = hydrate(SerializeTestModel, { unModeled: 'was set', hasOne: { name: 'baz' }, hasMany: [{ name: 'foo' }] })
    })

    it('hydrates from JSON', () => {
        expect(m.hasOne).toBeInstanceOf(AssociatedModel)
        expect(m.hasOne?.name).toEqual('baz')
        expect(m.hasMany.length).toEqual(1)
        expect(m.hasMany[0].name).toEqual('foo')
        expect(m.unModeled).toEqual('was set')
    })

    it('serializes', () => {
        expect(serialize(m)).toEqual({
            hasOne: { name: 'baz' },
            hasMany: [{ name: 'foo' }]
        })
    })

    it('uses hydrate/serialize methods if present', () => {
        const parent = {}
        const h = hydrate(HydratedModel, { foo: 'bar' }, parent)
        expect(h.hydrate).toHaveBeenCalled()
        expect(getParentOf(h)).toEqual(parent)
        expect((h as any).foo).toBeUndefined()
        expect(serialize(h)).toEqual({ name: 'foo' })
        expect(h.serialize).toHaveBeenCalled()
    })

    it('hydrates arrays', () => {
        // malformed, not given an array
        const m = hydrate(SerializeTestModel, { hasMany: { name: 'Bob' } })
        expect(m.hasMany).toHaveLength(1)
        expect(m.hasMany[0].name).toEqual('Bob')

        const tm = hydrate(SerializeTestModel, { hasMany: [{ name: 'Jim' }, {name: 'Jill'} ] })
        expect(tm.hasMany).toHaveLength(2)
        expect(tm.hasMany[0].name).toEqual('Jim')
        expect(tm.hasMany[1].name).toEqual('Jill')
    })
})

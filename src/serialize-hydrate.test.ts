import { modelize } from './modelize'
import { hydrateModel, hydrateInstance, serialize } from './serialize-hydrate'
import { model, field } from './schema'
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
}


describe('Serialize/Hydrate', () => {
    let m!: SerializeTestModel

    beforeEach(() => {
        m = hydrateModel(SerializeTestModel, { unModeled: 'was set', hasOne: { name: 'baz' }, hasMany: [{ name: 'foo' }] })
    })

    it('hydrates from JSON', () => {
        expect(m.hasOne).toBeInstanceOf(AssociatedModel)
        expect(m.hasOne?.name).toEqual('baz')
        expect(m.hasMany.length).toEqual(1)
        expect(m.hasMany[0].name).toEqual('foo')
        expect(m.unModeled).toEqual('was set')
    })

    it('skips hydration if already a model', () => {
        const hasOne = new AssociatedModel()
        const m2 = hydrateModel(SerializeTestModel, { hasOne })
        expect(m2.hasOne).toBe(hasOne)
    })

    it('hydrates already instantiated model', () => {
        const stm = new SerializeTestModel()
        const existingHM = stm.hasMany
        expect(existingHM).toBeInstanceOf(Array)
        expect(existingHM.length).toEqual(0)
        hydrateInstance(stm,  { unModeled: 'was set', hasOne: { name: 'baz' }, hasMany: [{ name: 'foo' }] })
        expect(stm.hasOne).toBeInstanceOf(AssociatedModel)
        expect(stm.hasOne?.name).toEqual('baz')
        expect(stm.hasMany).toBe(existingHM)
        expect(stm.hasMany.length).toEqual(1)
        expect(stm.hasMany[0].name).toEqual('foo')
        expect(stm.unModeled).toEqual('was set')
    })

    it('serializes', () => {
        expect(serialize(m)).toEqual({
            hasOne: { name: 'baz' },
            hasMany: [{ name: 'foo' }]
        })
    })

    it('uses hydrate/serialize methods if present', () => {
        const parent = {}
        const h = hydrateModel(HydratedModel, { foo: 'bar' }, parent)
        expect(h.hydrate).toHaveBeenCalled()
        expect(getParentOf(h)).toEqual(parent)
        expect((h as any).foo).toBeUndefined()
        expect(serialize(h)).toEqual({ name: 'foo' })
        expect(h.serialize).toHaveBeenCalled()
    })

    it('hydrates arrays', () => {
        // malformed, not given an array
        const m = hydrateModel(SerializeTestModel, { hasMany: { name: 'Bob' } })
        expect(m.hasMany).toHaveLength(1)
        expect(m.hasMany[0].name).toEqual('Bob')

        const tm = hydrateModel(SerializeTestModel, { hasMany: [{ name: 'Jim' }, {name: 'Jill'} ] })
        expect(tm.hasMany).toHaveLength(2)
        expect(tm.hasMany[0].name).toEqual('Jim')
        expect(tm.hasMany[1].name).toEqual('Jill')
    })

    it('skips creating model if already an instance', () => {
        const child = new AssociatedModel()
        const m = hydrateModel(SerializeTestModel, {
            hasMany: [ child ]
        })
        expect(m.hasMany[0]).toBe(child)
    })

    it('can hydrate repeatedly', () => {
        const m = hydrateModel(SerializeTestModel, { hasMany: [{ name: 'Bob' }]})
        hydrateInstance(m, { hasMany: [{ name: 'Tom' }, { name: 'Jane' }] })
        expect(m.hasMany).toHaveLength(2)
        const m2 = hydrateModel(SerializeTestModel, { hasMany: [{ name: 'Bob' }]})
        expect(m2.hasMany[0]).toBeInstanceOf(AssociatedModel)
        m2.hasMany.push({ name: 'Rob' })
        expect(m2.hasMany[1]).toBeInstanceOf(AssociatedModel)
    })

    it('returns empty object when attrs are null/undefined', () => {
        const m = hydrateModel(SerializeTestModel, { hasMany: [null]})
        expect(m.hasMany).toHaveLength(1)
        expect(m.hasMany[0]).toBeInstanceOf(AssociatedModel)
        expect(m.hasMany[0].name).toBeUndefined()
    })
})

import { modelize } from './modelize'
import { hydrate, serialize } from './serialize-hydrate'

class AssociatedModel {
    bar?: string
    constructor() {
        modelize(this, {
            bar: 'field',
        })
    }
}

class SerializeTestModel {
    unModeled: string = ''
    hasOne?: AssociatedModel
    hasMany: AssociatedModel[] = []
    constructor() {
        modelize(this, {
            hasOne: { type: 'model', model: AssociatedModel },
            hasMany: { type: 'model', model: AssociatedModel },
        })
    }
}

describe('Serialize/Hydrate', () => {
    let m!: SerializeTestModel

    beforeEach(() => {
        m = hydrate(SerializeTestModel, { unModeled: 'was set', hasOne: { bar: 'baz' }, hasMany: [{ bar: 'foo' }] })
    })

    it('hydrates from JSON', () => {
        expect(m.hasOne).toBeInstanceOf(AssociatedModel)
        expect(m.hasOne?.bar).toEqual('baz')
        expect(m.hasMany.length).toEqual(1)
        expect(m.hasMany[0].bar).toEqual('foo')
        expect(m.unModeled).toEqual('was set')
    })

    it('serializes', () => {
        expect(serialize(m)).toEqual({
            hasOne: { bar: 'baz' },
            hasMany: [{ bar: 'foo' }]
        })
    })
})

import { modelize } from './modelize'
import { hydrate, serialize } from './serialize-hydrate'
import { model, field } from './decorators'

class AssociatedModel {
    bar?: string
    constructor() {
        modelize(this, {
            bar: field,
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

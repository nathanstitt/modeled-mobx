import { modelize } from './modelize'
import { field, model } from './schema'
import { observable, autorun, runInAction } from "mobx"
import { hydrateModel } from './serialize-hydrate'

class AssociatedModel {
    @observable name = ''
    constructor() {
        modelize(this)
    }
}

class Base {
    @observable afield = 1

    constructor() {
        modelize(this)
    }
}

class SimpleTestModel extends Base {
    @observable energy = 1
    @field bar = 'baz'
    @model(AssociatedModel) hasOne!: AssociatedModel
    @model(AssociatedModel) hasMany: AssociatedModel[] = []

    constructor() {
        super()
        modelize(this)
    }
}

describe('Simple Model test', () => {
    it('can decorate mobx-only', () => {
        const m = hydrateModel(SimpleTestModel, { hasOne: { name: 'jill' }, hasMany: [ { name: 'jack' } ] })
        expect(m.hasMany).toHaveLength(1)
        expect(m.hasMany[0]).toBeInstanceOf(AssociatedModel)
        m.hasMany.push({ name: 'two' });
        expect(m.hasMany[1]).toBeInstanceOf(AssociatedModel)

        const m2 = hydrateModel(SimpleTestModel, { hasOne: { name: 'jill' }, hasMany: [ { name: 'jack' } ] })
        m2.hasMany.push({ name: 'two' });
        expect(m.hasMany[1]).toBeInstanceOf(AssociatedModel)

        const spy = jest.fn(() => m.afield)
        autorun(spy)
        runInAction(() => m.afield = 42)
        expect(spy).toHaveBeenCalledTimes(2)

    })
})

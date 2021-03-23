import { modelize } from './modelize'
import { getSchema } from './schema'
import { autorun, observable, runInAction } from "mobx"
import { field, model } from './decorators'
import { hydrate } from './serialize-hydrate'

class OnlyMobX {
    @observable name = ''
    constructor() {
        modelize(this)
    }
}

class AssociatedModel {
    @field name = ''
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

describe('Model using Decorators', () => {
    it('can decorate mobx-only', () => {
        const mbx = new OnlyMobX()
        const spy = jest.fn(() => { mbx.name })
        autorun(spy)
        expect(spy).toHaveBeenCalledTimes(1)
        runInAction(() => mbx.name = 'a new value')
        expect(spy).toHaveBeenCalledTimes(2)
        expect(getSchema(OnlyMobX)).toBe(false)
    })

    it('records schema independantly', () => {
        expect(getSchema(SimpleTestModel)).not.toBe(getSchema(Base))
    })

    it('sends non-fields to mobx', async () => {
        const m = new SimpleTestModel()
        const s = getSchema(SimpleTestModel)
        expect(s).not.toBe(false)
        if (s === false) return; // typeguard
        const spy = jest.fn(() => { m.energy })
        autorun(spy)
        expect(spy).toHaveBeenCalledTimes(1)
        runInAction(() => m.energy = 3)
        expect(spy).toHaveBeenCalledTimes(2)
    })

    it('handles fields', async () => {
        const m = new SimpleTestModel()
        const spy = jest.fn(() => { m.bar })
        autorun(spy)
        expect(spy).toHaveBeenCalledTimes(1)
        runInAction(() => m.bar = 'two')
        expect(spy).toHaveBeenCalledTimes(2)
    })

    it('handles models', () => {
        const m = hydrate(SimpleTestModel, { hasOne: { name: 'jill' }, hasMany: [ { name: 'jack' } ] })
        expect(m.hasMany).toHaveLength(1)
        expect(m.hasMany[0].name).toEqual('jack')
        const spy = jest.fn(() => { m.hasOne?.name })
        autorun(spy)
        expect(spy).toHaveBeenCalledTimes(1)
        runInAction(() => m.hasOne.name = 'bob')
        expect(spy).toHaveBeenCalledTimes(2)
        expect(m.hasOne).toBeInstanceOf(AssociatedModel)
    })
})

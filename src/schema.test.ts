import { modelize } from './modelize'
import { field, model, getSchema } from './schema'
import { autorun, observable, runInAction } from "mobx"
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

class SecondTestModel extends Base {
    @field baz = 'bar'
    constructor() {
        super()
        modelize(this)
    }
}

class SuperModel extends SimpleTestModel {
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
        expect(getSchema(OnlyMobX)).toBeUndefined()
    })

    it('records schema independantly', () => {
        const m1 = new SimpleTestModel()
        const m2 = new SecondTestModel()
        expect(getSchema(m1)).not.toBe(getSchema(m2))
        expect(Array.from(getSchema(m1)?.properties.keys() || [])).toContain('bar')
        expect(Array.from(getSchema(m2)?.properties.keys() || [])).toContain('baz')
    })

    it('honors models on subclass', () => {
        const m = hydrate(SuperModel, { hasOne: { name: 'jill' }, hasMany: [ { name: 'jack' } ] })
        expect(m.hasOne).toBeInstanceOf(AssociatedModel)
    })

    it('sends non-fields to mobx', async () => {
        const m = new SimpleTestModel()
        const s = getSchema(m)
        expect(s).not.toBeUndefined()
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

        const hmSpy = jest.fn(() => { m.hasMany[0]?.name })
        autorun(hmSpy)
        runInAction(() => m.hasMany = [ hydrate(AssociatedModel, { name: 'sara' }) ] )
        expect(hmSpy).toHaveBeenCalledTimes(2)
        expect(m.hasMany[0].name).toEqual('sara')

        const hoSpy = jest.fn(() => { m.hasOne?.name })
        autorun(hoSpy)
        expect(hoSpy).toHaveBeenCalledTimes(1)
        runInAction(() => m.hasOne.name = 'bob')
        expect(hoSpy).toHaveBeenCalledTimes(2)
        expect(m.hasOne).toBeInstanceOf(AssociatedModel)
    })
})

import { modelize } from './modelize'
import { getSchema } from './schema'
import { autorun, observable, runInAction } from "mobx"
import { field, model } from './decorators'

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
class WithOnlyModel {
    @model(AssociatedModel) hasOne!: AssociatedModel
    constructor() {
        modelize(this)
    }
}

class Base {

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

    it('installs interceptors', () => {
        const m = new WithOnlyModel()
        const spy = jest.fn(() => { m.hasOne })
        autorun(spy)
        expect(spy).toHaveBeenCalledTimes(1)
        runInAction(() => m.hasOne = {} as any)
        expect(spy).toHaveBeenCalledTimes(2)
        expect(m.hasOne).toBeInstanceOf(AssociatedModel)
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
        const m = new SimpleTestModel()
        const spy = jest.fn(() => { m.hasOne })
        autorun(spy)
        expect(spy).toHaveBeenCalledTimes(1)
        runInAction(() => m.hasOne = {} as any)
        expect(spy).toHaveBeenCalledTimes(2)
        expect(m.hasOne).toBeInstanceOf(AssociatedModel)
    })
})

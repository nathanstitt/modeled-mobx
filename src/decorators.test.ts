import { modelize } from './modelize'
import { getSchema } from './schema'
import { autorun, observable, runInAction } from "mobx"
import { field, model } from './decorators'

class AssociatedModel {

}


class SimpleTestModel {
    @observable energy = 1
    @field bar = 'baz'
    @model(AssociatedModel) hasOne!: AssociatedModel

    constructor() {
        modelize(this)
    }
}

describe('Model using Decorators', () => {
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
        runInAction(() => m.hasOne = {})
        expect(spy).toHaveBeenCalledTimes(2)
        expect(m.hasOne).toBeInstanceOf(AssociatedModel)
    })
})

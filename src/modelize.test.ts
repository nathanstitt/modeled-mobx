import { hydrateModel } from './serialize-hydrate'
import { modelize } from './modelize'
import { field, model } from './schema'
import { observable, autorun, runInAction } from "mobx"

class AssociatedModel {
    avalue = 1
}

class SimpleTestModel {
    mbx = 'unset'
    energy = 1
    bar: AssociatedModel[] = []
    baz!: AssociatedModel
    _sharedArray = observable.array()

    constructor() {
        this.bar = this._sharedArray
        modelize(this, {
            mbx: observable,
            energy: field,
            bar: model(AssociatedModel),
            baz: model(AssociatedModel),
        })
    }
}

describe('Models', () => {

    it('forwards unknown to mobx', () => {
        const m = new SimpleTestModel()
        const spy = jest.fn(() => m.mbx)
        autorun(spy)
        expect(spy).toHaveBeenCalledTimes(1)
        runInAction(() => m.mbx = 'set')
        expect(spy).toHaveBeenCalledTimes(2)
    })

    it('sets fields', () => {
        const m = new SimpleTestModel()
        const spy = jest.fn(() => m.energy)
        autorun(spy)
        expect(spy).toHaveBeenCalledTimes(1)
        runInAction(() => m.energy = 3)
        expect(spy).toHaveBeenCalledTimes(2)
    })

    it('sets hasMany', () => {
        const sm = hydrateModel(SimpleTestModel, {
            bar: [{ avalue: 42 }],
        })
        expect(sm.bar).toHaveLength(1)
        expect(sm.bar[0]).toBeInstanceOf(AssociatedModel)
        expect(sm.bar[0].avalue).toEqual(42)
        const spy = jest.fn(() => sm.bar.length)
        autorun(spy)
        runInAction(() => sm.bar.push({} as any as AssociatedModel))
        expect(spy).toHaveBeenCalledTimes(2)
        expect(sm.bar).toHaveLength(2)
        expect(sm.bar[1]).toBeInstanceOf(AssociatedModel)

        // should not create new array
        runInAction(() => sm.bar = [{ avalue: 1 }, { avalue: 2 }])
        expect(sm._sharedArray).toBe(sm.bar)
        expect(sm._sharedArray[0]).toBe(sm.bar[0])
    })

    it('sets hasOne', () => {
        const sm = hydrateModel(SimpleTestModel, {
            baz: { avalue: 12 },
        })
        expect(sm.baz).toBeInstanceOf(AssociatedModel)
        expect(sm.baz.avalue).toEqual(12)
        const spy = jest.fn(() => sm.baz.avalue)
        autorun(spy)
        runInAction(() => sm.baz = {} as any as AssociatedModel)
        expect(spy).toHaveBeenCalledTimes(2)
        expect(sm.baz).toBeInstanceOf(AssociatedModel)
    })
})

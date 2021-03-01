import { modelize } from './modelize'
import { field, model } from './decorators'
import { observable, autorun, runInAction } from "mobx"

class AssociatedModel {

}

class SimpleTestModel {
    mbx = 'unset'
    energy = 1
    bar: AssociatedModel[] = []
    baz!: AssociatedModel

    constructor() {
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
        const m = new SimpleTestModel()
        expect(m.bar).toBeInstanceOf(Array)
        const obj = m.bar
        m.bar.push({ f: 1 })
        expect(m.bar).toHaveLength(1)
        expect(m.bar[0]).toBeInstanceOf(AssociatedModel)

        m.bar = [{ f: 2 }]
        expect(m.bar === obj).toBeTruthy() // shouldn't actually replace the array object
        expect(m.bar).toHaveLength(1)
        expect(m.bar[0]).toBeInstanceOf(AssociatedModel)
    })

    it('sets hasOne', () => {
        const m = new SimpleTestModel()
        const spy = jest.fn(() => m.baz)
        autorun(spy)
        expect(spy).toHaveBeenCalledTimes(1)
        runInAction(() => {
            m.baz = {}
        })
        expect(spy).toHaveBeenCalledTimes(2)
        expect(m.baz).toBeInstanceOf(AssociatedModel)
    })
})

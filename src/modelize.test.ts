import { hydrate } from './serialize-hydrate'
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

    constructor() {
        modelize(this, {
            mbx: observable,
            energy: field,
            bar: model(AssociatedModel),
            baz: model(AssociatedModel),
        })
    }
}

class SuperModel extends SimpleTestModel {
    foo = 1
    constructor() {
        super()
        modelize(this, {
            foo: observable
        })
    }
}

describe('Models', () => {
    it('inherits', () => {
        const m = new SuperModel()
        const energySpy = jest.fn(() => m.energy )
        const fooSpy = jest.fn(() => m.foo )
        const avalueSpy = jest.fn(() => m.baz?.avalue)
        autorun(energySpy)
        autorun(fooSpy)
        autorun(avalueSpy)

        runInAction(() => m.energy = 12)
        expect(energySpy).toHaveBeenCalledTimes(2)

        runInAction(() => m.foo = 23)
        expect(fooSpy).toHaveBeenCalledTimes(2)

        runInAction(() => m.baz = new AssociatedModel())
        expect(avalueSpy).toHaveBeenCalledTimes(2) // baz is observable
        runInAction(() => m.baz.avalue = 42)
        // avalue is not observable autorun won't be called but also shouldn't error or anything
        expect(avalueSpy).toHaveBeenCalledTimes(2)

    })

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
        const sm = hydrate(SuperModel, {
            bar: [{ avalue: 42 }],
        })
        expect(sm.bar).toHaveLength(1)
        expect(sm.bar[0]).toBeInstanceOf(AssociatedModel)
        expect(sm.bar[0].avalue).toEqual(42)
    })

    it('sets hasOne', () => {
        const sm = hydrate(SuperModel, {
            baz: { avalue: 12 },
        })
        expect(sm.baz).toBeInstanceOf(AssociatedModel)
        expect(sm.baz.avalue).toEqual(12)
    })
})

import { intercept, observable, IObservableArray, isObservableArray } from "mobx"
import { hydrate } from './serialize-hydrate'
import { Model, ModelInstance } from './types'
import { recordParentOf } from './inverse'

export function configureHasOne(parent: ModelInstance, property: string, desiredModel: Model) {
    intercept(parent, property, (change: any) => {

        if (change.newValue) {
            if (!(change.newValue instanceof desiredModel)) {
                change.newValue = hydrate(desiredModel, change.newValue)
            }
            recordParentOf(change.newValue, parent)
        }
        return change
    })
}

export function configureHasMany(parent: ModelInstance, property: string, desiredModel: Model) {
    let value:IObservableArray = parent[property] //
    if (!isObservableArray(value)) {
        value = observable.array()
        parent[property] = value
    }

    const toModel = (attrs: Record<string, any>) => {
        let child: any
        if (attrs instanceof desiredModel) {
            child = attrs
        } else {
            child = hydrate<any>(desiredModel, attrs)
        }
        recordParentOf(child, parent)
        return child
    }
    intercept(value, (change) => {
        if (change.type == 'splice') {
            change.added = change.added.map(toModel)
        }
        return change
    })
    intercept(parent, property, (change: any) => {
        (parent[property] as any).replace(change.newValue.map(toModel))
        return null
    })
}

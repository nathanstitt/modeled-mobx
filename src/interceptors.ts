import { intercept, observable } from "mobx"
import { hydrate } from './serialize-hydrate'
import { Model, ModelSchema } from './types'
import { recordParentOf } from './inverse'

function configureHasOne<T extends object, K extends keyof T>(parent: T, property: K, desiredModel: Model) {
    intercept<T, K>(parent, property, (change: any) => {
        if (change.newValue) {
            if (!(change.newValue instanceof desiredModel)) {
                change.newValue = hydrate(desiredModel, change.newValue)
            }
            recordParentOf(change.newValue, parent)
        }
        return change
    })
}

function configureHasMany<T extends object, K extends keyof T>(parent: T, property: K, desiredModel: Model) {
    const value = observable.array()
    parent[property] = value as any
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
    intercept<T, K>(parent, property, (change: any) => {
        (parent[property] as any).replace(change.newValue.map(toModel))
        return null
    })
}

export function addModelInterceptors<T extends object>(model: T, schema: ModelSchema<T, keyof T>) {
    schema.properties.forEach((options, property) => {
        if (options.type === 'model') {
            if (Array.isArray(model[property])) {
                configureHasMany<T, keyof T>(model, property, options.model)
            } else {
                configureHasOne<T, keyof T>(model, property, options.model)
            }
        }
    })
}

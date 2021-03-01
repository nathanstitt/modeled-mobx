import { intercept, observable } from "mobx"
import { hydrate } from './serialize-hydrate'
import { Model, ModelSchema } from './types'

function configureHasOne<T extends object, K extends keyof T>(model: T, property: K, desiredModel: Model) {
    intercept<T, K>(model, property, (change: any) => {
        if (change.newValue && !(change.newValue instanceof desiredModel)) {
            change.newValue = hydrate(desiredModel, change.newValue)
        }
        return change
    })
}

function configureHasMany<T extends object, K extends keyof T>(model: T, property: K, desiredModel: Model) {
    const value = observable.array()
    model[property] = value as any
    const toModels = (attrs: Record<string, any>) => attrs instanceof desiredModel ? attrs : hydrate<any>(desiredModel, attrs)
    intercept(value, (change) => {
        if (change.type == 'splice') {
            change.added = change.added.map(toModels)
        }
        return change
    })
    intercept<T, K>(model, property, (change: any) => {
        (model[property] as any).replace(change.newValue.map(toModels))
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

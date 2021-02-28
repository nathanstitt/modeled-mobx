import { findOrCreateSchema } from './schema'
import { observable, makeObservable, AnnotationsMap, CreateObservableOptions } from "mobx"
import { Model, PropertyOptions, PropertyTypes } from './types'
import { addModelInterceptors } from './interceptors'

declare type ModelProperties<T> = {
    [P in keyof T]: PropertyOptions | PropertyTypes
}


// function configureHasOne<T extends object, K extends keyof T>(model: T, property: K, desiredModel: Model<T>) {
//     intercept<T, K>(model, property, (change: any) => {
//         if (change.newValue && !(change.newValue instanceof desiredModel)) {
//             change.newValue = hydrate(desiredModel, change.newValue)
//         }
//         return change
//     })
// }

// function configureHasMany<T extends object, K extends keyof T>(model: T, property: K, desiredModel: Model<T>) {
//     const value = observable.array()
//     model[property] = value as any
//     const toModels = (attrs: Record<string, any>) => attrs instanceof desiredModel ? attrs : hydrate(desiredModel, attrs)

//     intercept(value, (change) => {
//         if (change.type == 'splice') {
//             change.added = change.added.map(toModels)
//         }
//         return change
//     })
//     intercept<T, K>(model, property, (change: any) => {
//         (model[property] as any).replace(change.newValue.map(toModels))
//         return null
//     })
// }

function optionToSchema({
    options,
}: {
    options: PropertyOptions | PropertyTypes
}): PropertyOptions {
    if (options === 'field') {
        return { type: options }
    }
    return options as PropertyOptions
}

export function modelize<T extends Model>(
    model: InstanceType<T>,
    properties?: ModelProperties<InstanceType<T>>,
    options?: CreateObservableOptions,
) {
    const schema = findOrCreateSchema<T>(model.constructor)
    if (!properties) {
        makeObservable(model)
        addModelInterceptors<T>(model, schema)
        return
    }

    Object.keys(properties).forEach(property => {
        const ps = optionToSchema({ options: properties[property] })
        schema.properties.set(property as keyof T, ps)
    })

    const mobxAnnotations: AnnotationsMap<object, PropertyKey> = {}
    schema.properties.forEach((_options, key) => {
        mobxAnnotations[key] = observable
    })
    makeObservable(model, mobxAnnotations, options)
    addModelInterceptors<T>(model, schema)
}

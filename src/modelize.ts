import { findOrCreateSchema } from './schema'
import { observable, makeObservable, AnnotationsMap, CreateObservableOptions } from "mobx"
import { Model, PropertyOptions } from './types'
import { addModelInterceptors } from './interceptors'
import { field } from './decorators'

declare type ModelizeProperties<T> = {
    [P in keyof T]: Function
}

interface ModelOption extends Function {
    model?: Model
}

function optionToSchema({
    options,
}: {
    options: ModelOption
}): PropertyOptions | null {
    if (options === field) {
        return { type: 'field' }
    }
    if (typeof options === 'function' && options.model) {
        return { type: 'model', model: options.model }
    }
    return null
}

export function modelize<T extends Model>(
    model: InstanceType<T>,
    properties?: ModelizeProperties<InstanceType<T>>,
    options?: CreateObservableOptions,
) {
    const schema = findOrCreateSchema<T>(model.constructor)
    if (!properties) {
        makeObservable(model)
        addModelInterceptors<T>(model, schema)
        return
    }

    const mobxAnnotations: AnnotationsMap<object, PropertyKey> = {}
    Object.keys(properties).forEach(property => {
        const ps = optionToSchema({ options: properties[property] })
        if (ps) {
            schema.properties.set(property as keyof T, ps)
        } else {
            mobxAnnotations[property] = properties[property] as any
        }
    })

    schema.properties.forEach((_options, key) => {
        mobxAnnotations[key] = observable
    })

    makeObservable(model, mobxAnnotations, options)
    addModelInterceptors<T>(model, schema)
}

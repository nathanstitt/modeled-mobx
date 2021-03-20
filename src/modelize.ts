import { findOrCreateSchema, getSchema } from './schema'
import { observable, makeObservable, AnnotationsMap, CreateObservableOptions } from "mobx"
import { Model, ModelInstance, PropertyOptions } from './types'
import { addModelInterceptors } from './interceptors'
import { field } from './decorators'

declare type ModelizeProperties<T> = {
    [P in keyof T]: Function // eslint-disable-line @typescript-eslint/ban-types
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
    model: ModelInstance,
    properties?: ModelizeProperties<ModelInstance>,
    options?: CreateObservableOptions,
) {
    let schema = getSchema<T>(model.constructor)
    if (!properties) {
        makeObservable(model)
        if (!schema) {
            return  // no decorators have created schema
        }
        addModelInterceptors<ModelInstance>(model, schema)
        return
    }
    if (!schema) schema = findOrCreateSchema<T>(model.constructor)
    const mobxAnnotations: AnnotationsMap<Record<string, unknown>, PropertyKey> = {}
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
    addModelInterceptors<ModelInstance>(model, schema)
}

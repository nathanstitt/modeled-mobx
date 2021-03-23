import { findOrCreateSchema, getSchema } from './schema'
import { observable, makeObservable, CreateObservableOptions } from "mobx"
import { Model, ModelInstance, PropertyOptions, AnnotationEntries } from './types'
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
        return { type: 'field', annotated: false }
    }
    if (typeof options === 'function' && options.model) {
        return { type: 'model', annotated: false, model: options.model }
    }
    return null
}

export function modelize<T extends Model>(
    model: ModelInstance,
    properties?: ModelizeProperties<ModelInstance>,
    options?: CreateObservableOptions,
) {
    const decoratedSchema = getSchema<T>(model.constructor)

    if (!properties) {
        makeObservable(model)
        if (!decoratedSchema) {
            return  // no decorators have created schema
        }
        return
    }
    const schema = decoratedSchema || findOrCreateSchema<T>(model.constructor)

    const mobxAnnotations: AnnotationEntries = {}
    Object.keys(properties).forEach(property => {
        const ps = optionToSchema({ options: properties[property] })
        if (ps) {
            schema.properties.set(property as keyof T, ps)
        } else {
            mobxAnnotations[property] = properties[property] as any
        }
    })
    schema.properties.forEach((options, key) => {
        if (!options.annotated) {
            mobxAnnotations[key] = observable
            options.annotated = true
        }
    })
    makeObservable(model, mobxAnnotations, options)
  }

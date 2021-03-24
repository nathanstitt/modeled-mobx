import { findOrCreateSchema, getSchema } from './schema'
import { observable, makeObservable, CreateObservableOptions } from "mobx"
import { ModelInstance, AnnotationEntries } from './types'
import { configureHasMany, configureHasOne } from './interceptors'

declare type ModelizeProperties<T> = {
    [P in keyof T]: Function // eslint-disable-line @typescript-eslint/ban-types
}

export function modelize(
    model: ModelInstance,
    properties?: ModelizeProperties<ModelInstance>,
    options?: CreateObservableOptions,
) {

    const decoratedSchema = getSchema(model)

    if (!properties) {
        makeObservable(model)
        if (!decoratedSchema) {
            return  // no decorators have created schema
        }
        return
    }
    const schema = decoratedSchema || findOrCreateSchema(model)

    const mobxAnnotations: AnnotationEntries = {}
    Object.keys(properties).forEach(property => {
        if (!schema.recordProperty(property, properties[property])) {
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

    Object.keys(mobxAnnotations).forEach(property => {
        const options = schema.properties.get(property)
        if (options && options.type == 'model') {
            if (Array.isArray(model[property])) {
                 configureHasMany(model, property, options.model)
             } else {
                 configureHasOne(model, property, options.model)
             }
        }
    })
    // schema.properties.forEach((options, key) => {
    //     if (options.annotated = true
    //     //

    // })

  }

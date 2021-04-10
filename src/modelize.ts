import { findOrCreateSchema, getSchema } from './schema'
import { observable, makeObservable, CreateObservableOptions, isObservableProp } from "mobx"
import { ModelInstance, AnnotationEntries } from './types'
import { addInterceptors } from './interceptors'

declare type ModelizeProperties<T> = {
    [P in keyof T]: Function // eslint-disable-line @typescript-eslint/ban-types
}



export function modelize(model: ModelInstance): void
export function modelize(model: ModelInstance, properties: ModelizeProperties<ModelInstance>, options?: CreateObservableOptions): void
export function modelize(model: ModelInstance, properties?: ModelizeProperties<ModelInstance>, options?: CreateObservableOptions): void {

    const decoratedSchema = getSchema(model)
    if (!properties && !decoratedSchema) {
        makeObservable(model)
        return
    }

    const schema = decoratedSchema || findOrCreateSchema(model)

    const mobxAnnotations: AnnotationEntries = {}
    if (!properties) {
        makeObservable(model)
        addInterceptors(model, schema)
        return
    }

    Object.keys(properties).forEach(property => {
        if (!schema.recordProperty(property, properties[property])) {
            mobxAnnotations[property] = properties[property] as any
        }
    })

    Array.from(schema.properties.keys()).forEach((property) => {
        if (Object.prototype.hasOwnProperty.call(model, property) && !isObservableProp(model, property)) {
            mobxAnnotations[property] = observable
        }
    })

    if (Object.keys(mobxAnnotations).length) {
        makeObservable(model, mobxAnnotations, options)
    } else {
        makeObservable(model)

    }

    addInterceptors(model, schema)

  }

import { Model, ModelSchema as Schema, PropertyOptions, ModelOption } from './types';
import { observable } from 'mobx'

const $schema = Symbol('modeled mobx schema')

export class ModelSchema implements Schema {
    properties = observable.map<string, PropertyOptions>({}, { deep: false })

    recordProperty(prop: string, options: ModelOption): boolean {
        if (options === field) {
            this.properties.set(prop, { type: 'field', annotated: false })
            return true
        }
        if (typeof options === 'function' && options.model) {
            this.properties.set(prop, { type: 'model', annotated: false, model: options.model })
            return true
        }
        return false
    }
}

function decorate<T extends object>(model: T, propertyKey: string, options: ModelOption) {
    observable(model, propertyKey as string)
    findOrCreateSchema(model).recordProperty(propertyKey, options)
}

export function field<T extends object>(target: T, propertyKey?: string): any {
    if (propertyKey) {
        decorate<T>(target, propertyKey, field)
    } else {
        return (target: T, propertyKey: string) => {
            decorate<T>(target, propertyKey, field)
        }
    }
}

export function model(model: Model) {
    const decorator = <T extends object>(target: T, propertyKey: string) => {
        decorate<T>(target, propertyKey, decorator)
    }
    decorator.model = model
    return decorator
}

export function getSchema(model: any): ModelSchema | undefined {
    return model[$schema] || false
}

export function findOrCreateSchema(model: any): ModelSchema {
    let schema = getSchema(model)
    if (!schema) {
        schema = new ModelSchema()
        Object.defineProperty(model, $schema, {
            enumerable: false,
            writable: true,
            configurable: true,
            value: schema,
        })
    }
    return schema
}

import { Model, ModelSchema as Schema, PropertyOptions, ModelOption } from './types';
import { observable } from 'mobx'

const $schema = Symbol('modeled mobx schema')

export class ModelSchema implements Schema {
    properties = new Map<string, PropertyOptions>()

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

function decorate<T extends object>(model: T, property: string, options: ModelOption) {
    observable(model, property as string)
    findOrCreateSchema(model).recordProperty(property, options)
}

export function field<T extends object>(target: T, property?: string): any {
    if (property) {
        decorate<T>(target, property, field)
    } else {
        return (target: T, property: string) => {
            decorate<T>(target, property, field)
        }
    }
}

export function model(model: Model) {
    const decorator = <T extends object>(target: T, property: string) => {
        decorate<T>(target, property, decorator)
    }
    decorator.model = model
    return decorator
}

export function getSchema(model: any): ModelSchema | undefined {
    return model[$schema]
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

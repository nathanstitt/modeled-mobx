import { observable } from "mobx"
import { findOrCreateSchema } from './schema'
import { PropertyOptions, Model } from './types'

function decorate<T extends object>(model: T, propertyKey: keyof T, options: PropertyOptions) {
    observable(model, propertyKey as string)
    console.log('set objs', propertyKey)
    const schema = findOrCreateSchema<T>(model.constructor)
    schema.properties.set(propertyKey, options)
}

export function field<T extends object>(target: T, propertyKey?: keyof T): any {
    if (propertyKey) {
        decorate<T>(target, propertyKey, { type: 'field' })
    } else {
        return (target: T, propertyKey: keyof T) => {
            decorate<T>(target, propertyKey, { type: 'field' })
        }
    }
}

// interface modelDecoratorOptions extends Function {
//     model: Model
// }

export function model(model: Model) {
    const decorator = <T extends object>(target: T, propertyKey: keyof T) => {
        decorate<T>(target, propertyKey, { type: 'model', model: model })
    }
    decorator.model = model
    return decorator
}

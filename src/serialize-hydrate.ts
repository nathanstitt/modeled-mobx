import { getSchema } from './schema'
import { JSON, Model, PropertyOptions } from './types'
import { recordParentOf } from './inverse'


export function hydrate<T extends Model>(model: T, attrs: any, parent?: any): InstanceType<T> {
    if (typeof model.hydrate === 'function') {
        return recordParentOf(model.hydrate(attrs), parent)
    }
    const instance = new model(attrs)
    recordParentOf(instance, parent)
    const schema = getSchema<T>(model)
    if (typeof instance.hydrate == 'function') {
        instance.hydrate(attrs)
    } else {
        Object.keys(attrs).forEach(prop => {
            const propOptions:PropertyOptions | false | undefined = schema && schema.properties.get(prop as any)
            if ( propOptions && propOptions.type == 'model') {
                if (Array.isArray(instance[prop])) {
                    const values = Array.isArray(attrs[prop]) ?
                        attrs[prop].map((childProps:any) => hydrate(propOptions.model, childProps, instance)) :
                        [hydrate(propOptions.model, attrs[prop], instance)]
                    instance[prop].splice(0, instance[prop].length, ...values)
                } else {
                    instance[prop] = hydrate(propOptions.model, attrs[prop], instance)
                }
            } else {
                instance[prop] = attrs[prop]
            }
        })
    }
    return instance
}

export function serialize<T extends object>(model: T): JSON {
    if (typeof model['serialize'] == 'function') {
        return model['serialize']()
    }
    const schema = getSchema<T>(model.constructor)
    if (!schema) {
        throw new Error("is not an model. object must have modelize() called on it")
    }
    const json = {}
    schema.properties.forEach((options, key) => {
        const value = model[key]
        const prop = key as string
        if (options.type == 'model') {
            if (Array.isArray(value)) {
                json[prop] = value.map(m => serialize(m))
            } else {
                json[prop] = value ? serialize<Record<string, unknown>>(value as any) : value
            }
        } else {
            json[prop] = value
        }
    })
    return json as JSON
}

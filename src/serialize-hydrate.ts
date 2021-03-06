import { getSchema } from './schema'
import { action } from 'mobx'
import { JSON, Model, ModelInstance, ModelSchema} from './types'
import { recordParentOf } from './inverse'

function hydrateFromSchema(
    instance: any,
    prop: string,
    attrs?: Object,
    schema?: ModelSchema,
): void {
    if (!attrs) return
    if (!schema) {
        instance[prop] = attrs[prop]
        return
    }
    const options = schema.properties.get(prop)
    if ( options && options.type == 'model') {
        if (Array.isArray(instance[prop])) {
            const values = Array.isArray(attrs[prop]) ?
                attrs[prop].map((childProps:any) => hydrateModel(options.model, childProps, instance)) :
                [hydrateModel(options.model, attrs[prop], instance)]

            instance[prop].splice(0, instance[prop].length, ...values)
        } else {
            if (attrs[prop] instanceof options.model) {
                instance[prop] = attrs[prop]
            } else {
                instance[prop] = hydrateModel(options.model, attrs[prop], instance)
            }
        }
    } else {
        instance[prop] = attrs[prop]
    }
}

export const hydrateModel = action(<T extends Model>(model: T, attrs?: Object, parent?: any): InstanceType<T> => {
    if (model == null) { throw new Error(`unable to hydrate null/undefined Model`); }
    if (attrs instanceof model) {
        return recordParentOf(attrs, parent)
    }
    if (typeof model.hydrate === 'function') {
        return recordParentOf(model.hydrate(attrs), parent)
    }
    const instance = new model(attrs)
    return hydrateInstance(instance, attrs, parent)
})

export const hydrateInstance = action(<T extends ModelInstance>(instance: T, attrs?: Object, parent?: any): T => {
    recordParentOf(instance, parent)
    const schema = getSchema(instance)
    if (typeof instance.hydrate == 'function') {
        instance.hydrate(attrs)
    } else {
        const keys = Object.keys(attrs || {});
        for(let i = 0; i< keys.length;i++){
            hydrateFromSchema(instance, keys[i], attrs, schema)
        }
    }
    return instance
})

export function serialize<T extends object>(model: T): JSON {
    if (typeof model['serialize'] == 'function') {
        return model['serialize']()
    }
    const schema = getSchema(model)
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

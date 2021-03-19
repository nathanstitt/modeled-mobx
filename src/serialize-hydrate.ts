import { getSchema } from './schema'
import { JSON, Model } from './types'


export function hydrate<T extends Model>(model: T, attrs: any): InstanceType<T> {
    if (typeof model.hydrate === 'function') {
        return model.hydrate(attrs)
    }
    const m = new model(attrs)
    if (typeof m.hydrate == 'function') {
        m.hydrate(attrs)
    } else {
        Object.keys(attrs).forEach(a => {
            m[a] = attrs[a]
        })
    }
    return m
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

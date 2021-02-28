import { getSchema } from './schema'
import { JSON } from './types'

class Foo {

}

interface M {
    new(...args: any[]): any;
}

export function hydrate<T extends M>(model: T, attrs: any): InstanceType<T> {
    const m = new model()
    Object.keys(attrs).forEach(a => {
        m[a] = attrs[a]
    })
    return m
}

export function serialize<T extends object>(model: T): JSON {
    const s = hydrate(Foo, {})
    console.log(s)
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
                json[prop] = value ? serialize<object>(value as any as object) : value
            }
        } else {
            json[prop] = value
        }
    })
    return json as JSON
}

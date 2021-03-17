import { ModelConstructor, ModelSchema as Schema, PropertyOptions } from './types';
import { observable } from 'mobx'

const Registry = new WeakMap()

class ModelSchema<T, K extends keyof T> implements Schema<T, K> {
    properties = observable.map<K, PropertyOptions>({}, { deep: false })
}

export function getSchema<T>(ctor: ModelConstructor<T>): Schema<T, keyof T> | false {
    return Registry.get(ctor) || false
}

export function findOrCreateSchema<T>(ctor: ModelConstructor<T>): Schema<T, keyof T> {
    let schema = getSchema(ctor)
    if (!schema) {
        schema = new ModelSchema()
        Registry.set(ctor, schema)
    }
    return schema
}

import { ModelConstructor, ModelSchema as Schema, PropertyOptions } from './types';
import { observable } from 'mobx'

class ModelSchema<T, K extends keyof T> implements Schema<T, K> {
    properties = observable.map<K, PropertyOptions>({}, { deep: false })
}

export function getSchema<T>(ctor: ModelConstructor<T>): Schema<T, keyof T> | false {
    return ctor.$mdmx || false
}

export function findOrCreateSchema<T>(ctor: ModelConstructor<T>): Schema<T, keyof T> {
    if (ctor.$mdmx) { return ctor.$mdmx; }
    const value = new ModelSchema()
    Object.defineProperty(ctor, '$mdmx', {
        enumerable: false,
        writable: false,
        configurable: true,
        value,
    });
    return value
}

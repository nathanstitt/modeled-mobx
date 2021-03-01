export interface JSON {
    readonly [text: string]: JSON | JSON[] | string | number
}

export type PropertyTypes = 'field' | 'model'

export interface Model extends Function {
    new(...args: any[]): any;
}

export type ModelInstance = InstanceType<Model>

export type PropertyOptions =
    | { type: 'field' }
    | { type: 'model', model: Model }

export interface ModelSchema<T, K extends keyof T> {
    properties: Map<K, PropertyOptions>
}

export interface ModelConstructor<T> extends Function {
    $mdmx?: ModelSchema<T, keyof T>
}

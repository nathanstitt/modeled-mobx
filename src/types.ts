import { AnnotationsMap } from 'mobx'

export interface JSON {
    readonly [text: string]: JSON | JSON[] | string | number | boolean
}

export type PropertyTypes = 'field' | 'model'

export interface Model extends Function {
    hydrate?(attrs: any): ModelInstance
    new(...args: any[]): any;
}

export type ModelInstance = InstanceType<Model>

export type PropertyOptions =
    | { type: 'field', annotated: boolean }
    | { type: 'model', annotated: boolean, model: Model }

export interface ModelSchema<T, K extends keyof T> {
    properties: Map<K, PropertyOptions>
}

export interface ModelConstructor<T> extends Function {
    $mdmx?: ModelSchema<T, keyof T>
}

export type AnnotationEntries = AnnotationsMap<Record<string, unknown>, PropertyKey>

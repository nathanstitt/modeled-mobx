import { AnnotationsMap } from 'mobx'

export interface JSON {
    readonly [text: string]: JSON | JSON[] | string | number | boolean
}

export type PropertyTypes = 'field' | 'model'

export interface Model extends Function {
    hydrate?(attrs: any): ModelInstance
    new(...args: any[]): any;
}

export interface ModelInstance extends InstanceType<Model> {
    hydrate?(attrs: any): void
}

export interface ModelOption extends Function {
    model?: Model
}

export type PropertyOptions =
    | { type: 'field' }
    | { type: 'model', model: Model }

export interface ModelSchema {
    properties: Map<string, PropertyOptions>
}

export interface ModelConstructor extends Function {
    $mdmx?: ModelSchema
}

export type AnnotationEntries = AnnotationsMap<Record<string, unknown>, PropertyKey>

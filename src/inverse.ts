const Parents = new WeakMap()

export function recordParentOf(child: any, parent: any):any {
    if (parent && child != null && (typeof child == 'object')) {
        Parents.set(child, parent)
    }
    return child
}

export function getParentOf<T>(child: any): T {
    return Parents.get(child) as T
}

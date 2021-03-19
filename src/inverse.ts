const Parents = new WeakMap()

export function recordParentOf(child: any, parent: any) {
    Parents.set(child, parent)
}

export function getParentOf<T>(child: any): T {
    return Parents.get(child) as T
}
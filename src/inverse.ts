const Parents = new WeakMap()

export function recordParent(child: any, parent: any) {
    Parents.set(child, parent)
}

export function getParent<T>(child: any): T {
    return Parents.get(child) as T
}

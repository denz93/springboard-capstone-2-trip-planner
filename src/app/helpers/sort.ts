type Callback<T> = (val: T) => string | number
type KeyOfObj<O> = O extends Record<infer K extends string, any> ? K : never

function compare(a: any, b: any) {
    return a > b ? 1 : a < b ? -1 : 0
}
export function sortBy<T>(arr: Array<T>) {
    const newArr = [...arr]
    let order = 1 //ascending: 1, descreasing: -1
    const sorters: Array<[KeyOfObj<T> | Callback<T> | undefined, number]> = []
    const chain = {
        by: (sorter?: KeyOfObj<T> | Callback<T>) => {
            sorters.push([sorter, order])
            return chain
        },
        desc() {
            order = -1
            return chain as Omit<typeof chain, "asc" | "desc">
        },
        asc() {
            order = 1
            return chain as Omit<typeof chain, "asc" | "desc">
        },
        result() {
            newArr.sort((a, b) => {
                let comparation = 0
                let idx = 0
                while (comparation === 0 && idx < sorters.length) {
                    const [sorter, order] = sorters[idx++]
                    if (sorter === undefined) {
                        comparation = compare(a, b) * order
                        continue
                    }
                    if (Object.hasOwn(a as any, sorter as any)) {
                        const key = sorter as any as string
                        comparation = compare((a as any)[key], (b as any)[key]) * order
                        continue;
                    }
                    const callback: Callback<T> = sorter as any
                    comparation = compare(callback(a), callback(b)) * order
                }
                return comparation
            })
            return newArr
        }
    }
    return chain
}


import { sortBy } from './sort';
import { test, expect } from 'vitest';

test('sort array of obj by key', () => {
    const original = [
        { key: 2 },
        { key: 1 },
        { key: 5 },
        { key: 4 }
    ];
    expect(sortBy(original).by("key").result()).toEqual([
        original[1], original[0], original[3], original[2]
    ])
})

test('sort array of obj by a callback', () => {
    const original = [
        { key: 2 },
        { key: 1 },
        { key: 5 },
        { key: 4 }
    ];
    expect(sortBy(original).by((a) => a.key).result()).toEqual([
        original[1], original[0], original[3], original[2]
    ])
})

test('sort int array by a transformer callback', () => {
    const original = [
        1.4, 4, 5, 3, 1.2, 3.3
    ]
    expect(sortBy(original).by((a) => +a.toFixed()).result()).toEqual([1.4, 1.2, 3, 3.3, 4, 5])
})

test('sort array by its own value', () => {
    const original = [
        1.4, 4, 5, 3, 1.2, 3.3
    ]
    expect(sortBy(original).by().result()).toEqual([1.2, 1.4, 3, 3.3, 4, 5])
})

test('sort should not alter the original arr', () => {
    const original = [3, 1, 4, 5]
    expect(sortBy(original).by(a => a).result()).not.toBe(original)
})

test('sort by "name" in ascending and by "score" in descresing', () => {
    const students = [
        { name: "Jay", score: 10 },
        { name: "Anna", score: 4 },
        { name: "Brandon", score: 5 },
        { name: "Anna", score: 10 },
        { name: "Jay", score: 5 }
    ]
    expect(sortBy(students)
        .asc().by("name")
        .desc().by("score")
        .result()
    ).toEqual([students[3], students[1], students[2], students[0], students[4]])
})
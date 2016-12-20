'use strict'

/* 
   Compare two array-trees for equality.   Don't go inside objects, just arrays.
*/

const prop = Symbol('deep equal cycle flag')

function deepEqualArrays (a, b) {
  const color = Symbol('already-visited')

  function check (a, b) {
    if (a === b) return true
    if (a === null) return false
    if (a[prop] === color) return true  // we're looping
    if (typeof a === 'object') a[prop] = color
    if (Array.isArray(a) && Array.isArray(b) &&
        a.length === b.length) {
      for (let i = 0; i < a.length; i++) {
        if (!check(a[i], b[i], color)) return false
      }
      return true
    }
    return false
  }

  return check(a, b)
}

module.exports = deepEqualArrays

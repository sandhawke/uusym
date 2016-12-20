'use strict'

const test = require('tape')
const uusym = require('uusym')

test('triangle key equality, one string REF docs', t => {
  uusym.reset()
  const z = uusym('Thing that is referenced')
  const a = uusym(['A basic test object for refererence', z])
  const b = uusym(['A basic test object for refererence', z])
  const c = uusym(['A basic test object for refererence', a])
  const ka = a.key
  const kb = b.key
  const kc = c.key
  t.equal(a.key, ka)
  t.equal(b.key, kb)
  t.equal(c.key, kc)
  console.log(a, ka)
  console.log(b, kb)
  console.log(c, kc)
  t.notEqual(a, b)
  t.notEqual(a, c)
  t.notEqual(b, c)
  t.equal(ka, kb)
  t.notEqual(ka, kc)
  t.notEqual(kb, kc)
  t.end()
})
/*
test('match abc-xyz', t => {
  uusym.reset()
  t.plan(1)
  const a = uusym('a', 'b', 'c')
  const b = uusym('x', 'y', 'z')
  t.notEqual(a.key, b.key)
})

// Generalize to:

const pairs = [
  ['abc', 'xyz', false],
  ['abm', 'xmz', true]
]
for (const pair of pairs) {
  test(`generated match ${pair[0]} with ${pair[1]}`, t => {
    uusym.reset()
    t.plan(1)
    const a = uusym(...(pair[0].split('')))
    const b = uusym(...(pair[1].split('')))
    if (pair[2]) {
      t.equal(a.key, b.key)
    } else {
      t.notEqual(a.key, b.key)
    }
  })
}

test(t => {
  uusym.reset()
  t.plan(1)
  const a = uusym('a', 'b', 'm')
  const b = uusym('x', 'y', 'm')
  t.equal(a.key, b.key)
})

test(t => {
  uusym.reset()
  t.plan(1)
  const a = uusym('m', 'a')
  const b = uusym('x', 'm')
  t.equal(a.key, b.key)
})

test(t => {
  uusym.reset()
  t.plan(1)
  const a = uusym('a', 'm')
  const b = uusym('m', 'x')
  t.equal(a.key, b.key)
})

test(t => {
  uusym.reset()
  t.plan(1)
  const a = uusym('m', 'a')
  const b = uusym('m')
  t.equal(a.key, b.key)
})

test(t => {
  uusym.reset()
  t.plan(1)
  const b = uusym('m')
  const c = uusym('x', 'm')
  t.equal(b.key, c.key)
})

test('out-of-order synonyms', t => {
  uusym.reset()
  t.plan(1)
  const a = uusym('alice')
  const b = uusym('mrs. smith')
  const c = uusym('alice', 'mrs. smith')
  a.key
  b.key
  try {
    c.key
  } catch (e) {
    console.log(Reflect.ownKeys(e))
  }
  t.notEqual(a.key, b.key)
})

test('in-order synonyms', t => {
  uusym.reset()
  t.plan(2)
  const a = uusym('alice')
  const b = uusym('mrs. smith')
  const c = uusym('alice', 'mrs. smith')
  a.key
  c.key // for correct synonym ordering
  b.key
  t.equal(a.key, b.key)
  t.equal(a.key, c.key)
})

test('triangle key equality, (a,x)', t => {
  uusym.reset()
  t.plan(4)
  const a = uusym('a')
  const b = uusym('x', 'a')
  const c = uusym('x', 'b')
  b.key // for correct synonym ordering
  t.equal(a.key, b.key)
  t.equal(a.key, 1)
  t.equal(b.key, c.key)
  t.equal(a.key, c.key)
  t.end()
})

*/

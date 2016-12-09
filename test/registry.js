'use strict'

const test = require('tape')
const uusym = require('uusym')

test('registies', t => {
  t.plan(4)
  uusym.reset()
  const reg2 = new uusym.Registry()
  const reg3 = new uusym.Registry()

  const a = uusym('First Example Definition').key
  const aa = uusym('Second Example Definition').key
  const b = reg2.uusym('Second Example Definition').key
  const c = reg3.uusym('Third Example Definition').key

  t.equal(a, 1)
  t.equal(aa, 2)
  t.equal(b, 1)
  t.equal(c, 1)
  t.end()
})

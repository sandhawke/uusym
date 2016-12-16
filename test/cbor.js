'use strict'

const test = require('tape')
const cbor = require('cbor')
const uusym = require('uusym')

test(t => {
  t.plan(5)
  const a = uusym('Testing 1', 'Testing 2')
  const x = cbor.encode(a);
  t.equal(x.toString('hex'), 'da7573796d826954657374696e6720316954657374696e672032')
  const opt = {}
  uusym.configCBOR(opt)
  const ba = cbor.decodeAllSync(x, opt)
  t.assert(ba.length === 1)
  const b = ba[0]
  // console.log(b)
  t.assert(b.constructor.name === 'UUSYM')
  t.assert(a.match(b))
  t.assert(b.match(a))
  t.end()
})

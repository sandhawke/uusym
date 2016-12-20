'use strict'

const debug = require('debug')('uusym')
const Registry = require('./registry')
const deepEqual = require('./deepequal')

// annoying to have to include this even when it's only the caller
// that might use it.   If encodeCBOR's argument was passed a way
// to reach the cbor.Tagged class, we wouldn't need this.
// ? raise cbor issue "allow classes offering encodeCBOR to not
// depend on cbor package"  eg with encoder.Tagged
const cbor = require('cbor')

const cborTag = 0x7573796D // 'usym' in ascii; not yet registered

class Uusym {
  constructor (reg, ...docs) {
    debug('constructor', ...docs)
    this.reg = reg
    this.reg.entries.push(this)
    this._savedKey = undefined
    this.docs = []
    this.cdocs = []  // canonicalized versions of docs
    for (const doc of docs) {
      this.addDoc(doc)
    }
  }

  // see https://www.npmjs.com/package/cbor
  //
  encodeCBOR (encoder) {
    const tagged = new cbor.Tagged(cborTag, this.docs)
    return encoder.pushAny(tagged)
  }
  
  addDoc (doc) {
    // do more processing here, at some point
    debug('adding doc', doc)
    this.docs.push(doc)
    const cdoc = canonicalize(doc)
    this.cdocs.push(cdoc)
  }

  match (other) {
    if (this.reg !== other.reg) {
      throw Error('can only match uusyms in same registry')
    }
    for (const a of this.cdocs) {
      for (const b of other.cdocs) {
        if (a === b) return true
        if (deepEqual(a,b)) return true
      }
    }
    return false
  }

  label (n) {
    if (this.reg.byLabel[n]) {
      throw Error('Label already in use in this registry:' + n)
    }
    this._label = n
    this.reg.byLabel[n] = this
    return this
  }
  
  /*
    Return a small integer which is unique to this uusym and the ones
    that match it (ie have a doc that's the same).

    There's one really hard part:

    a = uusym('alice')                -> key=1
    b = uusym('mrs. smith')           -> key=2
    c = uusym('alice', 'mrs. smith')  => oops, they're all really key 1

    So we detect this and throw an error.  Two matches with different keys.

  */
  get key () {
    if (this._savedKey === undefined) {
      debug('figuring out key for', this.docs)
      for (const other of this.reg.entries) {
        if (this === other) continue
        if (other._savedKey && this.match(other)) {
          debug('matches', other.docs)
          if (this._savedKey === undefined) {
            this._savedKey = other._savedKey
          } else if (this._savedKey === other._savedKey) {
            // no worries
          } else {
            debug('but we already found a match, so error')
            throw Error('out-of-order equality -- try declaring synonyms sooner')
          }
        }
      }
      if (this._savedKey === undefined) {
        this._savedKey = this.reg.newKey()
      }
    }
    debug('settled on', this._savedKey)
    return this._savedKey
  }

}

function canonicalize (doc) {
  // should we join consecutive strings?  ['a','b'] => ['ab'] ?   Nah.
  if (typeof doc === 'string') return doc.replace(/\s+/g, ' ');
  if (Array.isArray(doc)) return doc.map(canonicalize)
  return doc
}

module.exports = Uusym

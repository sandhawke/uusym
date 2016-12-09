'use strict'

const debug = require('debug')('uusym')

class UUSYM {
  constructor (reg, ...docs) {
    debug('constructor', ...docs)
    this.reg = reg
    this.reg.entries.push(this)
    this._savedKey = undefined
    this.docs = []
    for (const doc of docs) {
      this.addDoc(doc)
    }
  }

  addDoc (doc) {
    // do more processing here, at some point
    this.docs.push(doc)
  }

  match (other) {
    for (const a of this.docs) {
      for (const b of other.docs) {
        if (a === b) return true
      }
    }
    return false
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

// do something smarter with indexing, some day
class Registry {
  constructor () {
    this.entries = []
    // avoid zero because it's falsey, and sometimes I do tricks with
    // making them negative (although could use odd/even)
    this.nextKeyNumber = 1
  }

  /*
    I'd kind of like to return Symbol(entry.docs[0].slice(0,10)) for
    debugging purposes, but for some applications (eg serialization)
    we'd like keys to be small integers.
  */
  newKey () {
    return this.nextKeyNumber++
  }

  uusym (...args) {
    return new UUSYM(this, ...args)
  }
}

// provide a non-Class style API

let defaultRegistry = new Registry()
const uusym = (...args) => defaultRegistry.uusym( ...args)

uusym.reset = () => {   // to help with testing, mostly
  defaultRegistry = new Registry()
}

module.exports = uusym
uusym.Registry = Registry


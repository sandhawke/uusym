'use strict'

const path = require('path')
const fs = require('fs')
const debug = require('debug')('uusym.reg')
const Uusym = require('./uusym')

const cborTag = 0x7573796D // 'usym' in ascii; not yet registered

// do something smarter with indexing, some day
class Registry {
  constructor () {
    this.entries = []
    // avoid zero because it's falsey, and sometimes I do tricks with
    // making them negative (although could use odd/even)
    this.nextKeyNumber = 1
    this.byLabel = {}
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
    return new Uusym(this, ...args)
  }

  /* 
     Give an 'options' object that'll be handed to cbor.decodeAllSync,
     set the right flags for any tagged uusyms to be decided into this
     registry

     As in:
     
     const opt = { ... }
     somRegistry.configCBOR(opt)
     output = cbor.decodeAllSync(input, opt)
     
  */
  configCBOR (options) {
    options.tags = options.tags || {}
    options.tags[cborTag] = x => this.uusym(...x)
  }


  
  importFromWeb (url, integrity, cachedir, rename) {
    throw Error('not implemented')
    /*   wow, hard to make this not be annoying in async...

         Maybe it leaves the registry in a 'loading' state, and
         attempting to do certain things like that produce an error.

         So reg.on('loaded')

         For authstreams, that's tolerable -- it'll just queue all
         uusym operations until the reg is loaded
     */
  }
  
  // this is similar to require(...), typically just run at startup,
  // so we usually want sync
  importFromFileSync (base, filename, rename) {
    filename = path.resolve(path.dirname(base), filename)
    debug('filename resolved to', filename)
    const text = fs.readFileSync(filename)
    const obj = JSON.parse(text)
    this.importFromObject(obj, rename)
  }

  importFromObject (obj, rename) {
    const sym = {}
    // first pass, create all the symbols we'll need
    for (const label of Object.keys(obj)) {
      sym[label] = this.uusym()
      if (!label.startsWith('_')) {
        const giveLabel = rename ? rename(label) : label
        sym[label].label(giveLabel)
      }
    }
    // second pass, now that we can reference them all, add docs
    for (const label of Object.keys(obj)) {
      for (const doc of obj[label]) {
        const newDoc = unCopyDoc(sym, doc)
        sym[label].addDoc(newDoc)
      }
    }
  }
  
  exportToObject (target) {
    this.assignLabelsWhereMissing()
    for (const sym of this.entries) {
      target[sym._label] = copyDocs(sym)
    }
  }

  assignLabelsWhereMissing () {
    let counter = 0
    for (const sym of this.entries) {
      if (sym._label === undefined) {
        while (true) {
          let n = '_' + counter++
          if (this.byLabel[n]) continue
          debug('assigning label', n)
          sym.label(n)
          break
        }
      }
    }
  }
}


function copyDocs (sym) {
  const result = []
  for (const doc of sym.docs) {
    result.push(copyDoc(doc))
  }
  return result
}

function copyDoc (doc) {
  if (typeof doc === 'string') {
    return doc
  }
  if (doc._label) {  // maybe check:  doc instanceof Uusym
    // We could use Crockford's decycle/retrocycle (eg npm's cycle)
    // syntax, but that seems unnecessarily ugly for this...  return {
    // '$ref': '$.["' + doc._label + '"]' }
    return { ref: doc._label }
  }
  if (Array.isArray(doc)) {
    return doc.map(copyDoc)
  }
  throw Error ('malformed uusym doc structure', doc)
}

function unCopyDoc (sym, doc) {
  if (typeof doc === 'string') {
    return doc
  }
  if (doc.ref) {
    const found = sym[doc.ref]
    if (!found) throw Error ('referenced symbol "' + doc.ref + '" not found')
    return found
  }
  if (Array.isArray(doc)) {
    return doc.map(x => unCopyDoc(sym, x))
  }
  throw Error ('malformed data in uusym import', doc)
}



module.exports = Registry

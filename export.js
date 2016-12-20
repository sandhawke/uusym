'use strict'

const fs = require('fs')

function importFromFileSync (reg, filename) {
  const text = fs.readFileSync(filename)
  const obj = JSON.parse(text)
  importFromObject(reg, obj)
}

function importFromObject (reg, obj, rename) {
  const sym = {}
  // first pass, create all the symbols we'll need
  for (const label of Object.keys(obj)) {
    sym[label] = reg.uusym()
    if (!label.startsWith('_')) {
      const giveLabel = rename ? rename(label) : label
      sym[label].label(giveLabel)
    }
  }
  // second pass, now that we can reference them all, add docs
  for (const label of Object.keys(obj)) {
    for (const doc of sym[label]) {
      const newDoc = uncopyDoc(sym, doc)
      sym[label].addDoc(newDoc)
    }
  }
}

function exportToFile (reg, filename, cb) {
  const obj = {}
  exportToObject(reg, obj)
  fs.writeFile(filename,
               JSON.stringify(obj, null, 2),
               { mode: 0o664 },
               cb)
}

function exportToObject (reg, target) {
  assignLabelsWhereMissing(reg)
  for (const sym of reg.entries) {
    target[sym._label] = copyDocs(sym)
  }
}

function assignLabelsWhereMissing (reg) {
  const counter = 0
  for (const sym of reg.entries) {
    if (sym._label === undefined) {
      while (true) {
        let n = '_' + counter++
        if (reg.byLabel(n)) continue
        sym.label(n)
        break
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
  if (doc._label)  // maybe check:  doc instanceof Uusym
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

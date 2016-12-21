'use strict'

const debug = require('debug')('uusym')
const Registry = require('./registry')
const Uusym = require('./uusym')

// provide a non-Class style API

let defaultRegistry = new Registry()
const uusym = (...args) => defaultRegistry.uusym(...args)

uusym.reset = () => {   // to help with testing, mostly
  defaultRegistry = new Registry()
}

module.exports = uusym
uusym.Registry = Registry
uusym.configCBOR = (x) => defaultRegistry.configCBOR(x)
uusym.Uusym = Uusym

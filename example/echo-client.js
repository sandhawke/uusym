'use strict'

//
//   not really done, just playing around with some ideas
//

const net = require('net')
const cbor = require('cbor')
const EventEmitter = require('eventemitter3')

const uusym = require('uusym')
const remoteSymbols = new Map()

const dispatch = new EventEmitter()

function start (conn) {
  // encode mtype 
  // conn.write(cbor.encode(['hello?', 53]))

  //const h1 = uusym('hello1').key
  //const h2 = uusym('hello2').key
  //const h3 = uusym('hello3').key
  conn.write(cbor.encode([0, 5, 'echo-request']))
  conn.write(cbor.encode([5, 'blah', 'blahh']))
  
  dispatch.on(uusym('echo-response').key, (...x) => {
    console.log('got a hello2', ...x)
  })
}

function gotMessage (conn, data) {
  if (Array.isArray(data) && data.length >= 0) {
    const mtype = data[0]
    // console.log(`incoming message mtype=${mtype}`, data)
    if (mtype === 0) {
      const index = data[0]
      const sym = uusym(...data.slice(2))
      remoteSymbols.set(data[1], sym)
      // only if it's unmatched?
      dispatch.emit('new', sym)
    } else {
      const sym = remoteSymbols.get(mtype)
      if (sym) {
        const rest = data.slice(1)
        dispatch.emit(sym.key, ...rest)
      } else {
        console.log('got undefined remote symbol', data)
      }
    }
  } else {
    console.log('got other message', data)
  }
}

//
// The rest of this is just a generic data client, waiting on a tcp
// port, then calling gotMessage when any cbor-encoded message arrives.
// 

const conn = net.connect({port:8000}, () => {
  //console.log('connected')
  const d = new cbor.Decoder();
  d.on('data', data => gotMessage(conn, data))
  d.on('error', err => { console.error(`conn ${me} bad cbor data:`,
                                       JSON.stringify(err.message)) })
  conn.pipe(d)
  start(conn)
  conn.end()
})
conn.on('error', err => {
  throw err
})

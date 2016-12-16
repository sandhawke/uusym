'use strict'

const net = require('net')
const cbor = require('cbor')
const EventEmitter = require('eventemitter3')
const uusym = require('uusym')

/*
function gotMessage (conn, data) {
  console.log('got message', data)
  conn.write(cbor.encode(data))
}
*/
const remoteSymbols = new Map()

const dispatch = new EventEmitter()

function start (conn) {
  uusym.reset()
  conn.write(cbor.encode([0, 5, 'echo-response']))
  
  dispatch.on(uusym('echo-request').key, (...data) => {
    console.log('got echo-requiest', data)
    conn.write(cbor.encode([5, ...data]))
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
// The rest of this is just a generic data server, waiting on a tcp
// port, then calling gotMessage when any cbor-encoded message arrives.
// 

let count = 1
const server = net.createServer(conn => {
  const me = count++
  console.log(`connection ${me} accepted`)
  conn.on('end', () => {
    console.log(`connection ${me} ended`)
  })
  const d = new cbor.Decoder();
  d.on('data', data => gotMessage(conn, data))
  d.on('error', err => { console.error(`conn ${me} bad cbor data:`,
                                       JSON.stringify(err.message)) })
  start(conn)
  conn.pipe(d)
})
server.on('error', err => {
  throw err
})
server.listen(8000, () => {
  console.log('server waiting for connections')
})


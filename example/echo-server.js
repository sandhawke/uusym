'use strict'

//
//   not really done, just playing around with some ideas
//


const net = require('net')
const cbor = require('cbor')

function gotMessage (conn, data) {
  console.log('got message', data)
  conn.write(cbor.encode(data))
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
  conn.pipe(d)
})
server.on('error', err => {
  throw err
})
server.listen(8000, () => {
  console.log('server waiting for connections')
})


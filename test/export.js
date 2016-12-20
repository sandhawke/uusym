'use strict'

const test = require('tape')
const uusym = require('uusym')

test('export no refs', t => {
  const reg = new uusym.Registry()
  const u1 = reg.uusym('First Example Definition').label('d1')
  const u2 = reg.uusym('Second Example Definition').label('d2')
  const u4 = reg.uusym('Third Example Definition')

  const obj = {}
  reg.exportToObject(obj)
  t.deepEqual(obj,
              {"d1":["First Example Definition"],"d2":["Second Example Definition"],"_0":["Third Example Definition"]}
             )
  //console.log(JSON.stringify(obj,2))
  t.end()
})

test('export with ref', t => {
  const reg = new uusym.Registry()
  
  const alicebook = reg.uusym('The 1865 novel _Alice In Wonderland_, by Charles Lutwidge Dodgson, writing under the pseudonym Lewis Carroll')
  const alice = reg.uusym(['Alice, the protagonist of', alicebook])

  const obj = {}
  reg.exportToObject(obj)
  t.deepEqual(obj,
              {"_0":["The 1865 novel _Alice In Wonderland_, by Charles Lutwidge Dodgson, writing under the pseudonym Lewis Carroll"],"_1":[["Alice, the protagonist of",{"ref":"_0"}]]}
             )
  //console.log(JSON.stringify(obj,2))
  t.end()
})

test('export with cycle', t => {
  const reg = new uusym.Registry()
  
  const alicebook = reg.uusym().label('alicebook')
  const alice = reg.uusym(['Alice, the protagonist of', alicebook]).label('alice')
  alicebook.addDoc(['The 1865 novel _Alice In Wonderland_, by Charles Lutwidge Dodgson, writing under the pseudonym Lewis Carroll, featuring the beloved protagonist', alice])

  const obj = {}
  reg.exportToObject(obj)
  t.deepEqual(obj,
              {
                "alicebook": [
                  [
                    "The 1865 novel _Alice In Wonderland_, by Charles Lutwidge Dodgson, writing under the pseudonym Lewis Carroll, featuring the beloved protagonist",
                    {
                      "ref": "alice"
                    }
                  ]
                ],
                "alice": [
                  [
                    "Alice, the protagonist of",
                    {
                      "ref": "alicebook"
                    }
                  ]
                ]
              }
             )
  //console.log(JSON.stringify(obj,null,2))
  t.end()
})

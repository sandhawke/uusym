'use strict'

const test = require('tape')
const uusym = require('uusym')

test('import', t => {
  const reg = new uusym.Registry()
  reg.importFromFileSync(__filename, 'fixtures/vocab-1.json')

  //console.log('reg=', reg)
  
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
  //console.log('**', JSON.stringify(obj,null,2))
  t.end()
})
     

This module implements uusyms, an alternative to [uuid]s.   As with a uuid, a uusym has one essential property:

* You can use it identify something, without ambiguity, across time and space.  In a generic sense, a uusym is also a 'univerally unique identifier', like uuid, but it uses a different approach from standard uuids, as per [RFC 4122].

These identifiers are important for decentralized systems, where parts change independently over time.  When your software needs to talk to other software about some thing (a function, method, attribute, file, person, etc) and the two programs are not necessarily evolving in close coordination, you can use a uuid or uusym to avoid accidentally referring to the wrong thing.

In practice in the Internet/IETF/W3C community there is some reliance on central coordination, eg with systems like the [IETF Message Headers Registry][1].

Two advantages to uusyms, relative too uuids:

* They are intrinsically documented.  Instead of seeing an inscrutable expression like 8fb51cf4-be30-11e6-a1af-204747e0006a, developers see text explaining what the item is.
* In a given context, such as a file or protocol stream, they can be much smaller, typically a byte or two, after the first use in that context.   (This is perhaps a trivial point, because you could do the same trick with uuids.)

This is a distillation of the [GrowJSON] concept.

Enough talk, let's see some code.

Install with
```sh
npm install --save uusym
```

Use some in output:


```js
const uusym = require('uusym')

const alice = uusym('Alice, the protagonist of the 1865 novel _Alice In Wonderland_, by Lewis Carroll.')
const bob = uusym('Microsoft Bob, a 1995 software product intended to provide a more user-friendly interface to Microsoft Windows.')

...

// come up with a better example, please!

setUserInfo(alice.key, 'Alice')
setUserInfo(bob.key, 'Bob')
```


[uuid]: https://en.wikipedia.org/wiki/Universally_unique_identifier
[RFC 4122]: https://tools.ietf.org/html/rfc4122
[1]: http://www.iana.org/assignments/message-headers/message-headers.xhtml
[GrowJSON]: https://decentralyze.com/2014/06/30/growjson/

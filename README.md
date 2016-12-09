This module implements uusyms, an alternative to
[uuid](https://en.wikipedia.org/wiki/Universally_unique_identifier)s.
As with a uuid, a uusym has one essential property:

* You can use it identify something, without ambiguity, across time
  and space.  In a generic sense, a uusym is also a 'univerally unique
  identifier', like uuid, but it uses a different approach from
  standard uuids, as per [RFC 4122](https://tools.ietf.org/html/rfc4122).

These identifiers are important for decentralized systems, where parts
change independently over time.  When your software needs to talk to
other software about some thing (a function, method, attribute, file,
person, etc) and the two programs are not necessarily evolving in
close coordination, you can use a uuid or uusym to avoid accidentally
referring to the wrong thing.

In practice in the Internet/IETF/W3C community there is some reliance
on central coordination, eg with systems like the [IETF Message Headers Registry](http://www.iana.org/assignments/message-headers/message-headers.xhtml).

Two advantages to uusyms, relative too uuids:

* They are intrinsically documented.  Instead of seeing an inscrutable expression like 8fb51cf4-be30-11e6-a1af-204747e0006a, developers see text explaining what the item is.
* In a given context, such as a file or protocol stream, they can be much smaller, typically a byte or two, after the first use in that context.   (This is perhaps a trivial point, because you could do the same trick with uuids.)

This is a distillation of the [GrowJSON](https://decentralyze.com/2014/06/30/growjson/) concept.

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

// come up with a better example, please!   But it needs more context.

setUserInfo(alice.key, 'Alice')
setUserInfo(bob.key, 'Bob')
```

## Definitions

The heart of uusyms is that idea that a natural language definition
that is sufficient for clear human understand is also textually
distinct from every other such definition.  There's nothing
mechanically stopping you from using a definition like 'My Cat', but
if you do that, your systems are unlikely to work as well.

## Multiple Definitions

A uusym can have multiple definitions.  All are considered to be
synonymous, of equal semantic weight.  The last one added is
considered to be "primary", and is preferencially displayed when a
definition is needed.

The plan is that during system evolution, one leaves in all the old
definitions that might be in use somewhere, eg in other software or in
data files.

## Local Identifiers (Not Implemented)

If you just need a local identifier, which will be meaningless to
other parties, including the same program run later, you can skip
giving a definition.


```js
const myThine = uusym()
```

## References (Not Implemented)

A definition can be an array (including sub-arrays, recursively)
containing both strings and uusyms.  Strings are automatically
concatenated, but uusyms are resolved logically as references to other
items.

```js
const alicebook = uusym('The 1865 novel _Alice In Wonderland_, by Charles Lutwidge Dodgson, writing under the pseudonym Lewis Carroll')
const alice = uusym(['Alice, the protagonist of', alicebook])
```

Loops _are_ allowed:


```js
const alicebook = uusym.deferred()
const carroll = uusym.deferred()
// using .key property would throw an Error at this point

alicebook.addDef(['The 1865 novel _Alice In Wonderland_, by', carroll])
// alicebook.key is still not usable
carroll.addDef(['Charles Lutwidge Dodgson, who wrote under the pseudonym Lewis Carroll, famous author of', alicebook])
// now alicebook.key and carroll.key should both work
```

## Registries

The uusym module value is a function (called uusym in these examples)
which creates new uusyms in a default registry.

Additional registries can be created:

```js
const uusym = require('uusym')
const reg2 = new uusym.Registry()
const reg3 = new uusym.Registry()

console.log(uusym('First Example Definition').key) // => 1
console.log(reg2.uusym('Second Example Definition').key)  // => 1
console.log(reg3.uusym('Third Example Definition').key)  // => 1
```

## Markup (not implemented)

For output/display of the definitions, use HTML if it starts with '<'
and [CommonMark](http://commonmark.org/) otherwise.  The underlying matching system doesn't
care.

## Whitespace (issue; not implemented)

Should matching be done with whitespace compressed, removed,
normalized, or left untouched?  For what is whitespace, see
https://github.com/w3c/findtext/issues/5

Maybe issue warnings when def's differ only in whitespace?  But that
might not show up in the right place -- ie the user gets it in five
years.

## Internationalization (issue; not implemented)

Languages may be tagged to allow the right definition to be displayed
to users.  This is done by replacing str with [{lang: langtag}, str]
in the definition, where langtag is a [BCP-47](https://tools.ietf.org/html/bcp47) language tag.  Language
direction can be specified similarly, with {dir: 'ltr'}.

Alternatively, we could parse HTML to see what lang attribute is set,
but that seems less likely to be maintained, I think, maybe.


[uuid]: https://en.wikipedia.org/wiki/Universally_unique_identifier
[RFC 4122]: https://tools.ietf.org/html/rfc4122
[1]: http://www.iana.org/assignments/message-headers/message-headers.xhtml
[GrowJSON]: https://decentralyze.com/2014/06/30/growjson/
[BCP-47]: https://tools.ietf.org/html/bcp47
[CommonMark]: http://commonmark.org/
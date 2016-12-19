This module implements uusyms, as sort of cross between [uuids](https://en.wikipedia.org/wiki/Universally_unique_identifier) and JS6 Symbols, with a hint of RDF.  The result is an interesting form of decentralized extensibility.

As with a uuid, a uusym can be used to identify something without ambiguity, across time and space.  So in the generic sense, a uusym is also a 'univerally unique identifier', like a uuid.  But it uses a completely different approach from [RFC 4122](https://tools.ietf.org/html/rfc4122) standard uuids.  Instead of using a random number or information about your computer, it uses natural language text.    A uusym is, in a sense, a **natural language uuid**.

This unique identifiers (uusyms or uuids) are useful for decentralized systems, where parts change independently over time. When your software needs to talk to other software about something (a function, method, attribute, file, person, etc) and the two programs are not necessarily evolving in close coordination, you can use a uuid or uusym to avoid accidentally referring to the wrong thing.

In practice in the Internet/IETF/W3C community, typically there is some reliance on central coordination, eg with systems like the [IETF Message Headers Registry](http://www.iana.org/assignments/message-headers/message-headers.xhtml).   Most of the rest of the industry just lets one provider manage things, as with npm controlling the package.json format.

Advantages of uusyms, compared to uuids:

* They are intrinsically documented.  Instead of seeing an inscrutable expression like 8fb51cf4-be30-11e6-a1af-204747e0006a, developers see text explaining what the item is.
* This means they are less likely to be used incorrectly
* It might even mean that people can be held accountable for using them correctly

Advatanges of uusyms, compared to URIs used in RDF:

* You don't need a long-term-stable website to create them
* There's no need to always refer to whoever created the identifier
* There's no vulnerability (human or machine) in referring to a website which might go down or be inappropriately modified


This is a distillation of some concepts explored earlier in [GrowJSON](https://decentralyze.com/2014/06/30/growjson/) and http://w3.org/ns/mics

## Install

Install with
```sh
npm install --save uusym
```

Should work fine via browserfy, but not tested yet.

## Example

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

## Serializing

Include serializer / deserializer for cbor.

## Local Identifiers (Not Implemented)

If you just need a local identifier, which will be meaningless to
other parties, including the same program run later, you can skip
giving a definition.


```js
const myThing = uusym()
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

## Labels

Gives you a simple way to do shortnames.

```js
const reg2 = new uusym.Registry()
const x = regs.uusym('First Example Definition).label('ex1')
const y = regs.byLabel.ex1
assert(x === y)
```

## Loading

One should be able to load from files and the web.

```js
const ref2 = new uusym.Registry()
ref2.load({ source: 'http://example.org/myTerms',
            sha256b64: 'E11b5QsBN2Nl6pdk5eFwBhtHAyIJwfpv8WW7yA1Sosw=' })
ref2.sym.whatever  
```

Failure to prove a hash will produce a console warning (which includes the hash you should use).   Using the wrong hash will throw an error.

In general, one should only use URLs which are indicated as immutable, and they will be cached indefinitely.  Could also be done as:

ref2.log('http://example.org/.well-known/hashBase64/E11b5QsBN2Nl6pdk5eFwBhtHAyIJwfpv8WW7yA1Sosw=')

Hash is provided to server as the ETag, so to help with conn-neg and versioning.

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
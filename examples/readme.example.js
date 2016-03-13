var expect = require('expect')

it('should download some data, and mutate the new stuff', function(){

  this.timeout(10 * 1000)

  var Specmap = require('specmap')
  var Lib = require('specmap/lib')
  var RefsPlugin = require('specmap/lib/refs')

  return Specmap({
    spec: {
      hello: 'world',
      'deps': {
        $ref: 'https://rawgit.com/ponelat/specmap/master/package.json#/dependencies' // a JSON-Ref... https://tools.ietf.org/html/draft-pbryan-zyp-json-ref-03
      }
    },
    plugins: [
      RefsPlugin(), // JSON-Ref plugin to handle them
      // Pluins can be functions. We pass in the new patches, and the specmap instance 
      function (patches, specmap) {
        // patches, all the /mutative/ patches (add, merge, remove, replace)
        return Lib.forEachNewPrimitive(patches, function (val, key, fullPath) { // Helper to iterate over the patches
          if(key === 'js-yaml' && specmap.get(fullPath) !== 'latest') { // We're working on make this easier, because every plugin runs over every change, and we don't want an endless loop
            var patch = Lib.replace(fullPath, 'latest') // Use latest js-yaml :)
            // patch is the atom of the system. We have helpers to build them for you
            // patch = {op: replace', path: [.., 'js-yaml'], value: 'latest'}
            return patch
          }
        })
      }
    ]
  }).then(function (res) {
    expect(res).toEqual({
      errors: [], // Hopefully :)
      spec: {
        hello: 'world',
        'deps': {
          // "js-yaml": "^3.5.4", when the Refs plugin added the 'deps', it introduced new patches. Which our function handled
          "js-yaml": "latest", // Whoop! We mutated this!
          "object-assign": "^4.0.1",
          "path-loader": "^1.0.1",
          "promise-polyfill": "^3.1.0"
        }
      }
    })
  })

}) // it


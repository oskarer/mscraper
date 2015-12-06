var async = require('async')
var Q = require('q')
var progress = require('progress')
var xray = require('x-ray')
var asciimo = require('asciimo').Figlet
var colors = require('colors')

var x = xray()

getPageUrls().then(function(urls) {
  console.log(urls.length + " product pages excluding 'Fyndhörna' and 'Nya Produkter'")
  var bar = new progress('Fetching m.nu [:bar] :current/:total :etas', {
    total: urls.length,
    width: 80
  });
  countItems(urls, bar).then(function(result) {
    printAscii(result)
  })
})

function getPageUrls() {
  var deferred = Q.defer()
  x('https://www.m.nu/', '#mnu_menu', ['li a@href'])(function(err, urls) {
    urls.splice(-2)
    deferred.resolve(urls)
  })
  return deferred.promise
}

function countItems(urls, bar) {
  var deferred = Q.defer()
  async.reduce(urls, 0, function(total_products, url, callback){
    x(url, 'td.smallText', ['b'])(function(err, numbers) {
      bar.tick()
      if (numbers[2])
        callback(null, total_products + parseInt(numbers[2]))
      else
        callback(null, total_products)
    })
  }, function(err, result){
      deferred.resolve(result)
  });
  return deferred.promise
}

function printAscii(number) {
  asciimo.write('m.nu', 'colossal', function(art){
    console.log(art.red)
    asciimo.write(number + ' produkter', 'banner', function(art){
      console.log(art.magenta)
      asciimo.write('by achronos', 'cricket', function(art){
        console.log('---------------------------------------------------------------------------------'.white)
        console.log(art.white)
      });
    });
  });
}

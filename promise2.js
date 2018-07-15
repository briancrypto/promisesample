
const https = require('https');

var counter = 0

function delay(url) {

  return new Promise((resolve, reject) => {
    https.get(url, resp => {
      counter += 1
      console.log(counter)
      let data = ''
      resp.on('data', () => {
      })
      resp.on('end', () => {
        console.log('data read end')
        resolve(true)
      })
    }).on('error', err => {
      reject(err)
    })    
  })
}

function settled(promises) {
  var alwaysFulfilled = promises.map( p => {
    return p.then( result => {
      return {result: result, error: undefined}
    }).catch(err => {
      return {result: undefined, error: err}
    })
  })
  return Promise.all(alwaysFulfilled)
}

/*
Execute in sequential and exit when error occur
*/
function sequence(arr, callback) {

  return arr.reduce((prevItem, curItem) => {
    return prevItem.then(prevResult => {
      return callback(curItem)
    })
  }, Promise.resolve())
}

/*
Execute in sequential and exit when error occur. Return the results up and including the error tasks.
*/
function sequenceWithResult(arr, callback) {

  var results = []
  return Promise.resolve(
    arr.reduce((prevItem, curItem) => {
      return prevItem.then(prevResult => {
        return callback(curItem).then(curResult => {
            results.push({result:curResult, error:undefined}) 
          })
      })
    }, Promise.resolve())
  ).then( () => {
    return Promise.resolve(results)
  }).catch(error => {
    results.push({result:undefined, error:error})
    return Promise.reject(results)
  })

}

/*
Execute in sequential and continue even if some tasks have error/failure. Return the results up and including the error tasks.
*/
function sequenceWithResult2(arr, callback) {
  var results = []
  return Promise.resolve(
    arr.reduce((prevItem, curItem) => {
      return prevItem.then( (prevResult)=> {
        return callback(curItem).then(curResult => {
          results.push({result:curResult, error:undefined}) 
        })
      }).catch(error => {
        results.push({result:undefined, error:error})
      })
    }, Promise.resolve())
  ).then( () => {
    return Promise.resolve(results)
  })  

}

/*
  execute promises in parallel and continues even when there are some promises with error/failure
*/
function waitUntilAllPromisesCompleted() {

  console.log('starting waitUntilAllPromisesCompleted.....')
  var promises = [delay('https://finance.yahoo.com/quote/AUDHKD%3DX?p=AUDHKD%3DX'),
                    delay('https://finance.yahooadd.com/quote/AUDHKD'),
                    delay('https://finance.yahoo.com/quote/AUDHKD%3DX?p=AUDHKD%3DX'),
                    delay('https://finance.yahooadd.com/quote/AUDHKD'),
                    delay('https://finance.yahoo.com/quote/AUDHKD%3DX?p=AUDHKD%3DX'),
                    delay('https://finance.yahoo.com/quote/AUDHKD%3DX?p=AUDHKD%3DX')]
  settled(promises).then(res => {
    res.forEach(ans => {
      if(ans.result) {
        console.log("ans:%o", ans.result)
      }
      if(ans.error) {
        console.log("ans:%o", ans.error.message)
      }
      
    })
  }).then(() => {
    console.log('completed all tasks....')
  })
  console.log('done')

}


/*
  execute promises in parallel and returns when any promises error/failed. Note, when there is error/failure in one promise
  the method will return, but other executed promises will continue execution.
*/
function stopWhenAnyPromiseFailed() {

  console.log('starting stopWhenAnyPromiseFailed.....')
  var promises = [delay('https://finance.yahoo.com/quote/AUDHKD%3DX?p=AUDHKD%3DX'),
                    delay('https://finance.yahooadd.com/quote/AUDHKD'),
                    delay('https://finance.yahoo.com/quote/AUDHKD%3DX?p=AUDHKD%3DX'),
                    delay('https://finance.yahooadd.com/quote/AUDHKD'),
                    delay('https://finance.yahoo.com/quote/AUDHKD%3DX?p=AUDHKD%3DX'),
                    delay('https://finance.yahoo.com/quote/AUDHKD%3DX?p=AUDHKD%3DX')]
  Promise.all(promises).then(res => {
    res.forEach(ans => {
      console.log("ans:%o", ans)
    })
  }).then(() => {
    console.log('completed all tasks....')
  }).catch(err => {
    console.log('error caught:%s', err.message)
  })
  console.log('done')
}


function executePromiseInSequence() {

  console.log('starting executePromiseInSequence.....')
  var urls = [('https://finance.yahoo.com/quote/AUDHKD%3DX?p=AUDHKD%3DX'),
                    ('https://finance.yahooadd.com/quote/AUDHKD'),
                    ('https://finance.yahoo.com/quote/AUDHKD%3DX?p=AUDHKD%3DX'),
                    ('https://finance.yahooadd.com/quote/AUDHKD'),
                    ('https://finance.yahoo.com/quote/AUDHKD%3DX?p=AUDHKD%3DX'),
                    ('https://finance.yahoo.com/quote/AUDHKD%3DX?p=AUDHKD%3DX'),
                    ('https://finance.yahooadd.com/quote/AUDHKD')]


  sequence(urls, delay).then( () => {
    console.log("All done")
  })


  console.log('done')
}

function executePromiseInSequenceWithResult() {

  console.log('starting executePromiseInSequenceWithResult.....')
  var urls = [('https://finance.yahoo.com/quote/AUDHKD%3DX?p=AUDHKD%3DX'),
                    ('https://finance.yahooadd.com/quote/AUDHKD'),
                    ('https://finance.yahoo.com/quote/AUDHKD%3DX?p=AUDHKD%3DX'),
                    ('https://finance.yahooadd.com/quote/AUDHKD'),
                    ('https://finance.yahoo.com/quote/AUDHKD%3DX?p=AUDHKD%3DX'),
                    ('https://finance.yahoo.com/quote/AUDHKD%3DX?p=AUDHKD%3DX'),
                    ('https://finance.yahooadd.com/quote/AUDHKD')]


  sequenceWithResult2(urls, delay).then(result => {
    console.log("result:%o", result)
  }).catch(error => {
    console.log("error:%o", error)
  })

  console.log('done')
}


function simplePromise() {
  console.log('starting simplePromise')
  delay('https://finance.yahoo.com/quote/AUDHKD%3DX?p=AUDHKD%3DX').then(res => {
    return delay('https://finance.yahooadd.com/quote/AUDHKD')
  }).then(res => {
    console.log('end')
  }).catch(err => {
    console.log('error:%o', err.message)
  })
}

function simpleSequentialPromise() {
  console.log('starting simpleSequentialPromise')
  delay('https://finance.yahoo.com/quote/AUDHKD%3DX?p=AUDHKD%3DX').then(res => {
    return delay('https://finance.yahoo.com/quote/AUDHKD%3DX?p=AUDHKD%3DX')
  }).then(prevResult => {
    return delay('https://finance.yahoo.com/quote/AUDHKD%3DX?p=AUDHKD%3DX')
  }).then(prevResult => {
    return delay('https://finance.yahoo.com/quote/AUDHKD%3DX?p=AUDHKD%3DX')
  }).then(()=> {
    console.log('simpleSequentialPromise done')
  }).catch(err => {
    console.log('error:%o', err.message)
  })

}

function demoOnReduce() {
  var numbers = [ 1, 2, 3, 4, 5]
  var initialValue = 0
  var sum = numbers.reduce(function(previousResult, arrayElement) {
    return previousResult + arrayElement
  }, initialValue)
  console.log(sum)
}


//simpleSequentialPromise()
//waitUntilAllPromisesCompleted()
//stopWhenAnyPromiseFailed()
//demoOnReduce()
//executePromiseInSequence()
executePromiseInSequenceWithResult()

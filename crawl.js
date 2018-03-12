//

'use strict'

const curl = require('curl')
const jquery = require('jquery')
const jsdom = require('jsdom')
const { JSDOM } = jsdom

const api = {
  getHtml: (url) => {
    return new Promise( (resolve, reject) => {
      curl.get(url, null, (err, res, body) => {
        if (err) {
          reject ( new Error('An error occurred.' + err) )
        }
        resolve(body)
      })
    })
  },
  failureCallback: (err) => {
    console.log('A failure occurred. Error: ', err)
  },
  extractHrefs: (html, elSelect, hSelect) => {
    return new Promise( (resolve, reject) => {
      let dom = new JSDOM(html)
      let $ = jquery(dom.window)
      let elems = eval(elSelect)
      let hrefs = []

      for( let i = 0; i < elems.length; i++ ) {
        let href = eval(hSelect)
        hrefs.push( href )
      }

      resolve(hrefs)
    })
  },
  getResultsUrls: (url, numResultsSelect, resPerPage) => {
    let rootUrl = url
    return new Promise( (resolve, reject) => {
      api.getHtml(url)
      .then( body => {
        let dom = new JSDOM(body)
        let $ = jquery(dom.window)
        let numResults = eval(numResultsSelect)
        let numResultsPages = Math.ceil( numResults / resPerPage );
        let urls = []

        for( let i = 0; i < numResultsPages; i++) {
          let url = rootUrl + (resPerPage * i)
          urls.push(url)
        }

        resolve(urls)
      })
      .catch(api.failureCallback)
    })
  }
}

module.exports = {
  api: api
}

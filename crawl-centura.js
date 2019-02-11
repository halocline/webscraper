//

'use strict'

const crawl = require('./crawl').api
const fs = require('fs')
const c3 = require('./sites/centura-health/jobs-centura-health_v0.3')
//const c3 = require('./sites/centura-health/jobs-centura-health')

const centuraUrl = c3.config.url

const handleJobData = (err, res) => {
  if (err) { console.error('Error getting job postings: ', err) }
  console.log("# Job Postings collected: " + res.length)
}

const failureCallback = (err) => {
  console.log('A failure occurred. Error: ', err)
}

const toFullPath = (hrefs) => {
  return new Promise( (resolve, reject) => {
    let x = hrefs.map( href => {
      return 'https://careers.centura.org' + href
    })
    resolve(x)
  })
}

const getHrefs = (elSelect, hrefSelect, html) => {
  return new Promise( (resolve, reject) => {
    crawl.extractHrefs(html, elSelect, hrefSelect)
    .then( x => {
      resolve(x)
    })
  })
}

const findResultsPages = (numResultsSelect, resultsPerPage, url) => {
  return new Promise( (resolve, reject) => {
    crawl.getResultsUrls(url, numResultsSelect, resultsPerPage)
    .then( x => {
      resolve(x)
    })
    .catch(failureCallback)
  })
}

const getCenturaJobCategoryUrls = () => {
  return new Promise( (resolve, reject) => {
    crawl.getHtml(centuraUrl)
    .then( html => {
      return new Promise( (resolve, reject) => {
        findResultsPages(
          '$(".paginationLabel").children("b").last().text()',
          50,
          centuraUrl
        )
        .then( result => {
          resolve(result)
        })
        .catch(failureCallback)
      })
    })
    .then( resultsUrls => {
      //console.log(resultsUrls);
      return new Promise( (resolve, reject) => {
        let list = []
        for ( let i = 0; i < resultsUrls.length; i++ ) {
          crawl.getHtml(resultsUrls[i])
          .then( res => {
            list.push(res)
            if(list.length === resultsUrls.length) {
              resolve(list)
            }
          })
        }
      })
    })
    .then( pages => {
      return new Promise( (resolve, reject) => {
        let hrefs = []
        for ( let i = 0; i < pages.length; i++ ) {
          getHrefs('$(".searchbycat").children()', '$(elems[i]).find( ("a")[0] ).attr("href")', pages[i])
          .then( res => {
            hrefs.push(res)
            if(hrefs.length === pages.length) {
              resolve(hrefs)
            }
          })
        }
      })
    })
    .then( list => {
      let hrefs = []
      let count = 0
      return new Promise( (resolve, reject) => {
        for ( let i = 0; i < list.length; i++ ) {
          hrefs = hrefs.concat( list[i] )
          count++
          if( count === list.length ) {
            resolve(hrefs)
          }
        }
      })
    })
    .then(toFullPath)
    .then( result => {
      resolve(result)
    })
    .catch(failureCallback)
  })
}

const getHtmlPages = (urls) => {
  return new Promise( (resolve, reject) => {
    let pages = []
    for ( let i = 0; i < urls.length; i++ ) {
      crawl.getHtml(urls[i]).
      then( html => {
        pages.push(html)
        if(pages.length === urls.length) {
          resolve(pages)
        }
      })
      .catch(failureCallback)
    }
  })
}

const getPagination = (pages, urls) => {
  return new Promise( (resolve, reject) => {
    //console.log(pages.length);
    let resultsPages = []
    let count = 0
    for ( let i = 0; i < pages.length; i++ ){
      findResultsPages(
        '$(".paginationLabel").children("b").last().text()',
        25,
        urls[i]
      )
      .then( page => {
        resultsPages = resultsPages.concat(page)
        count++
        if(count === pages.length) {
          resolve(resultsPages)
        }
      })
    }
  })
}

const getJobPostHrefs = (pages) => {
  return new Promise( (resolve, reject) => {
    let hrefs = []
    let count = 0
    for ( let i = 0; i < pages.length; i++ ) {
      getHrefs(
        '$(".searchResults").find("tr.data-row")',
        '$(elems[i]).find(".jobTitle-link").attr("href")',
        pages[i]
      )
      .then( res => {
        hrefs = hrefs.concat(res)
        count++
        if(count === pages.length) {
          resolve(hrefs)
        }
      })
    }
  })
}

const getCenturaJobPostingUrls = (urls = [
  'https://careers.centura.org/go/Health-At-Home/372814/',
  'https://careers.centura.org/go/Physician-Clinic/372815/'
]) => {
  return new Promise( (resolve, reject) => {
    getHtmlPages(urls)
    .then( pages => {
      return getPagination(pages, urls)
    })
    .then( list => {
      return getHtmlPages(list)
    })
    .then( pages => {
      return getJobPostHrefs(pages)
    })
    .then(toFullPath)
    .then( hrefs => {
      resolve(hrefs);
    })
    .catch(failureCallback)
  })
}

const parseJobPostDetails = (urls) => {
  return new Promise( (resolve, reject) => {
    getHtmlPages(urls)
    .then( pages => {
      let jobs = []
      for( let i = 0; i < pages.length; i++) {
        c3.parseJobDetail(pages[i], urls[i])
        .then( job => {
          jobs.push(job)
          if(jobs.length === urls.length) {
            resolve(jobs)
          }
        })
        .catch(failureCallback)
      }
    })
    .then( jobs => {
      resolve(jobs)
    })
    .catch(failureCallback)
  })
}

/*
getCenturaJobCategoryUrls()
.then( result => {
  console.log(result)
})
*/

/*
getCenturaJobPostings()
.then( result => {
  console.log(result)
})
*/

getCenturaJobCategoryUrls()
.then( urls => {
  urls = urls.slice(0, 2)
  return getCenturaJobPostingUrls(urls)
})
.then( urls => {
  urls = urls.slice(0, 20)
  console.log(urls.length);
  return parseJobPostDetails(urls)
})
.then( x => {
  for( let i = 0; i < x.length; i++) {
    //console.log(x[i].title + '||' + x[i].datePosted);
    console.log(x[i]);
  }
  console.log(x.length);
})
.catch(failureCallback)

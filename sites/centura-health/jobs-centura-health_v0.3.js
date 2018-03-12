// job-centura-health.js
// https://github.com/halocline
// mdglissmann@gmail.com
// March 2018

'use strict'

const curl = require('curl')
const jquery = require('jquery')
const jsdom = require('jsdom')

const domain = "https://careers.centura.org"
const path = "/viewalljobs/"
const { JSDOM } = jsdom



/*
 * Functions
 */


function getJobPosts(url, callback) {
  let indexUrl = url;

  getResultUrls(indexUrl, 50, function(err, urls) {
    if(err) { console.error(err); }
    console.log(urls);
    let allCatUrls = [];
    for( let i = 0; i < urls.length; i++) {
      getCategoryUrls(urls[i], function(err, catUrls) {
        if(err) {
          console.error(err);
        }
        //console.log(catUrls);
        allCatUrls = allCatUrls + catUrls;
        console.log(allCatUrls);
      });
      if(i + 1 === urls.length) {
        console.log( Object.values(allCatUrls) );
      }
    }
  });
}

function getCategoryUrls(url, callback) {
  curl.get(url, null, function(err, res, body) {
    if(err) {
      console.error(err);
    }

    let dom = new JSDOM(body);
    let $ = jquery(dom.window);
    let categories = $(".searchbycat").children();
    for( let i = 0; i < categories.length; i++ ) {
      let href = $(categories[i]).find( ("a")[0] ).attr("href");
      href = domain + href;
      categories[i] = href;
      if(i + 1 === categories.length) {
        callback(null, categories);
      }
    }
    //console.log(categories);
  });
}

function getResultUrls(indexUrl, resultsPerPage = 10, callback) {
  // Fetch html for index page
  curl.get(indexUrl, null, function(err, res, body) {
    if(err) { console.error(err); }

    let dom = new JSDOM(body);
    let $ = jquery(dom.window);
    let numResults = $(".paginationLabel").children("b").last().text();
    let resPerPage = resultsPerPage;
    let numResultsPages = Math.ceil( numResults / resPerPage );

    let urls = [];
    let count = 0;
    while(urls.length < numResultsPages) {
      let url = indexUrl + (resPerPage * count);
      urls.push(url);
      //console.log(urls.length);
      count++;
    }
    callback(null, urls);
  });
}

module.exports = {
  config: {
    url: domain + path,
    saveDestination: './sites/centura-health/data-out/'
  },
  getJobPosts: getJobPosts
}

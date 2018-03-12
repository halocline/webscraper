// job-centura-health.js
// https://github.com/halocline
// mdglissmann@gmail.com
// March 2018

/*
 * Libraries
 */
const curl = require('curl');
const jquery = require('jquery');
const jsdom = require('jsdom');

/*
 * Config
 */
const domain = "https://careers.centura.org";
const path = "/viewalljobs/";

const { JSDOM } = jsdom;

module.exports = {
  config: {
    url: domain + path,
    saveDestination: './sites/centura-health/data-out/'
  },
  getJobPosts: getJobPosts
}

/*
 * Functions
 */

function getJobPosts(url, callback) {
  getJobCategoryURLs(url, function(err, catURLs) {
    if(err) {
      console.error('ERROR: Could not get job category URLs.', err);
      callback(err, null);
    }

    console.log('Number of job categories from which to get postings: ' + catURLs.length);

    getJobDetailURLs(catURLs, function(err, jobURLs) {
      console.log('Number of job postings: ' + jobURLs);
    });
  });
}

function getJobCategoryURLs(url, callback) {
  curl.get(url, null, function(err, resp, body) {
    if (err) {
      console.error('ERROR: Issue getting job category index.');
      callback(err, null);
    }
    let dom = new JSDOM(body);
    let $ = jquery(dom.window);
    let numberResults = $(".paginationLabel").children("b").last().text();
    let resultsPerPage = 50;
    let resultsPages = getPaginatedResults(url, numberResults, resultsPerPage);
    console.log("These are the page results we need to crawl: ");
    console.log(resultsPages);

    parseCategoryURLs(resultsPages, numberResults, function(err, catURLs) {
      callback(null, catURLs);
    });
  });
}

function getJobDetailURLs(catURLs, callback) {
  for ( i = 0; i < 4; i++ ) {
  //for ( i = 0; i < catURLs.length; i++ ) {
    getAllJobURLs(catURLs[i], function(err, res) {

    });

  }
}

function getAllJobURLs(url, callback) {
  curl.get(url, null, function(err, resp, body) {
    if (err) {
      console.error('ERROR: Issue getting job list for: ' + url );
      callback(err, null);
    }
    let dom = new JSDOM(body);
    let $ = jquery(dom.window);
    let numberResults = $(".paginationLabel").children("b").last().text();
    console.log(i);
    console.log('Category: ' + url);
    console.log('Number of expected job postings: ' + numberResults);
    let resultsPerPage = 25;
    getPaginatedResults(url, numberResults, resultsPerPage);


    //console.log("These are the job detail pages we need to crawl: ");
    //console.log(resultsPages.length);
  });
}

function getPaginatedResults(rootURL, numResults, resPerPage, callback) {
  let pages = [rootURL];
  let numPages = Math.ceil( numResults / resPerPage );
  console.log(numPages);

  for( let i = 1; i < numPages; i++ ) {
    let pageURL = rootURL + (resPerPage * i);
    console.log(pageURL);
    pages.push(pageURL);
    console.log(pages);
    /*
    if (pages.length === numPages ) {
      console.log(pages);
      return pages;
    }
    */
  }

  return pages;
}

function parseCategoryURLs(pages, expectedURLs, callback) {
  let catURLs = [];
  let count = 0;

  for( i = 0; i < pages.length; i++ ) {
    curl.get(pages[i], null, function(err, resp, body) {
      if (err) {
        console.error('ERROR: Issue getting job category index.');
        callback(err, null);
      }
      let dom = new JSDOM(body);
      let $ = jquery(dom.window);
      let items = $(".searchbycat").children();

      for( j = 0; j < items.length; j++ ) {
        let href = $(items[j]).find( ("a")[0] ).attr("href");

        href = domain + href;
        catURLs.push(href);
        count++;

        if ( count === expectedURLs - 1 ) {   /* This really should not have the
          negative 1, but counter doesn't increment fast enough otherwise. Added
          timeout to compensate and get proper results. */
          setTimeout(function() {
            callback(null, catURLs);
          }, 0);
        }
      }
    });
  }
}

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

const parseJobDetail = (html, url) => {
  return new Promise( (resolve, reject) => {
    const { JSDOM } = jsdom;
    const dom = new JSDOM(html);
    const $ = jquery(dom.window);

    let obj = {};

    obj["url"] = url;
    let dateLastCrawled = Date.now();
    obj["dateLastCrawled"] = dateLastCrawled;
    let title = $("[itemprop='title']").html();
    obj["title"] = title;
    let datePosted = $("[itemprop='datePosted']").html();
    obj["datePosted"] = datePosted;
    let jobLocation = $("[itemprop='jobLocation']").html();
    obj["jobLocation"] = jobLocation;
    let hiringOrganization = $("[itemprop='hiringOrganization']").html();
    obj["hiringOrganization"] = hiringOrganization;
    /*
    let description = $("[itemprop='description']").html();
    obj["description"] = description;
    */
    let jobPostingId = $("u:contains('Job Description/Job Posting ID:')").html();
    obj["jobPostingId"] = jobPostingId;
    let schedule = $("u:contains('Schedule:')").parents("p").html();
    obj["schedule"] = schedule;
    let shift = $("u:contains('Shift:')").parents("p").html();
    obj["shift"] = shift;
    let positionSummary = $("u:contains('Position Summary')").parents("p").nextAll("p").html();
    obj["positionSummary"] = positionSummary;
    let minEducation = [];
    $("u:contains('Minimum Education Requirements')").parents("p").nextAll("ul")
    .first().children("li").each( function(index) {
        minEducation.push($( this ).text());
    });
    obj["minEducation"] = minEducation;
    let minExperience = [];
    $("u:contains('Minimum Experience Requirements')").parents("p").nextAll("ul")
    .first().children("li").each( function(index) {
        minExperience.push($( this ).text());
    });
    obj["minExperience"] = minExperience;
    let positionDuties = [];
    $("u:contains('Postion Duties')").parents("p").nextAll("ul")
    .first().children("li").each( function(index) {
        positionDuties.push($( this ).text());
    });
    obj["positionDuties"] = positionDuties;
    let majorMarkets = $(".jobmarkets").text();
    obj["majorMarkets"] = majorMarkets;
    let jobSegments = $("[itemprop='industry']").text();
    obj["jobSegments"] = jobSegments;

    for( let i = 0; i < Object.keys(obj).length; i++ ) {
      let key = Object.keys(obj)[i];
      let val = Object.values(obj)[i];
      if( typeof val === "string") {
        obj[key] = val.trim();
      }
    }

    resolve(obj)
  })
}

module.exports = {
  config: {
    url: domain + path,
    saveDestination: './sites/centura-health/data-out/'
  },
  getJobPosts: getJobPosts,
  parseJobDetail: parseJobDetail
}

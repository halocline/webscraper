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

/*
 * Functions
 */
function crawlJobCats(html, callback) {
  const { JSDOM } = jsdom;
  const dom = new JSDOM(html);
  const $ = jquery(dom.window);

  let items = $(".searchbycat").children(); /* Need to expand the buildout of
  this items list to include results from the pagination before entering into
  the loop */
  let data = [];

  /* Get job listings for each category listed */
  for( let i = 0; i < items.length; i++ ) {
    let href = $(items[i]).find( ("a")[0] ).attr("href");
    href = domain + href;
    getJobs(href, function(req, res) {
      if(res === null) {
        items.length = items.length - 1;
      }
      else {
        data.push(res);
      }

      if(data.length === items.length) {
        callback(null, data);
      }
    });
  }
}

function getJobDetail(url, callback) {
  curl.get(url, null, function(err, resp, body) {
    if (err) {
      let error = {
        msg: "Error getting job detail: " + url,
        error: err
      }
      console.log(error.msg);
      callback(err, null);
    }
    else {
      parseJobDetail(body, url, function(req, res) {
        callback(null, res);
      });
    }
  });
}

function getJobs(url, callback) {
  curl.get(url, null, function(err, resp, body) {
    if (err) {
      console.log("Error getting jobs: " + url);
      console.log("Error detail: " + err);
    }
    parseJobList(body, url, function(req, res) {
      callback(null, res);
    });
  });
}

function parseJobDetail(html, url, callback) {
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

  /*
  console.log(typeof obj.jobPostingId);
  if(typeof obj.jobPostingId === "String") {
    obj["jobPostingId"] = "Yo Mama";
  }
  console.log(obj.jobPostingId);
  */
  callback(null, obj);
}

function parseJobList(html, url, callback) {
  const { JSDOM } = jsdom;
  const dom = new JSDOM(html);
  const $ = jquery(dom.window);

  let jobs = $(".searchResults").find("tr.data-row");

  for( let i = 0; i < 1; i++ ) {
  //for( let i = 0; i < jobs.length; i++ ) {
    let title = $(jobs[i]).find(".jobTitle-link").html();
    let jobURL = $(jobs[i]).find(".jobTitle-link").attr("href");
    jobURL = domain + jobURL;

    getJobDetail(jobURL, function(req, res) {
      callback(null, res);
    });
  }
}

module.exports = {
  config: {
    url: domain + path
  },
  crawlJobs: function(url, callback) {
    curl.get(url, null, function(err, resp, body) {
      if (err) {
        let error = {
					msg: "Error fetching root URL: " + url,
					error: err
				}
        console.log(error.msg);
				callback(error, null);
				return;
      }
      crawlJobCats(body, function(req, res) {
        callback(null, res);
      });
    });
  }
}

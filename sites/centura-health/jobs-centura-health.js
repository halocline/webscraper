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
function crawlJobCats(html) {
  const { JSDOM } = jsdom;
  const dom = new JSDOM(html);
  const $ = jquery(dom.window);

  let items = $(".searchbycat").children();
  console.log(items.length);

  for( let i = 0; i < items.length; i++ ) {
    let href = $(items[i]).find( ("a")[0] ).attr("href");
    href = domain + href;
    getJobs(href);
  }
}

function getJobDetail(url) {
  curl.get(url, null, function(err, resp, body) {
    if (err) {
      console.log("Error fetching: " + url);
      console.log("Error detail: " + err);
    }
    else {
      parseJobDetail(body, url);
    }
  });
}

function getJobs(url) {
  curl.get(url, null, function(err, resp, body) {
    if (err) {
      console.log("Error fetching: " + url);
      console.log("Error detail: " + err);
    }
    else {
      parseJobList(body, url);
    }
  });
}

function parseJobDetail(html, url) {
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
  let description = $("[itemprop='description']").html();
  obj["description"] = description;
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

  console.log(obj.title + " | " + obj.datePosted);
  let json = JSON.stringify(obj);

}

function parseJobList(html, url) {
  const { JSDOM } = jsdom;
  const dom = new JSDOM(html);
  const $ = jquery(dom.window);

  let jobs = $(".searchResults").find("tr.data-row");

  for( let i = 0; i < 1; i++ ) {
  //for( let i = 0; i < jobs.length; i++ ) {
    let title = $(jobs[i]).find(".jobTitle-link").html();
    let jobURL = $(jobs[i]).find(".jobTitle-link").attr("href");
    jobURL = domain + jobURL;

    getJobDetail(jobURL);
  }

}

module.exports = {
  config: {
    url: domain + path
  },
  crawlJobs: function (url) {
    curl.get(url, null, function(err, resp, body) {
      if (err) {
        console.log("Error fetching: " + url);
        console.log("Error detail: " + err);
      }
      else {
         crawlJobCats(body);
      }
    });
  }
}

// webscraper.js
// https://github.com/halocline
// mdglissmann@gmail.com
// March 2018

const curl = require('curl');
const jquery = require('jquery');
const jsdom = require('jsdom');
//const { JSDOM } = jsdom;

/*
let url = "http://www.imdb.com/list/ls004489992/";

function parseData(html) {
  const { JSDOM } = jsdom;
  const dom = new JSDOM(html);
  const $ = jquery(dom.window);

  let items = $(".lister-item");

  for(let i = 0; i < items.length; i++) {
    var innerInfo = $(items[i]).children('.lister-item-content');
    var movieName = $( $(innerInfo).find('a')[0] ).html();
    var movieYear = $( $(innerInfo).find('.lister-item-year')[0] ).html();
    console.log(i + " -> " + movieYear + ":" + movieName);
  }
}
*/

const domain = "https://careers.centura.org";
const path = "/viewalljobs/";
const url = domain + path;

let jobCatURLs = [];
let jsonData = {};

function crawlJobCats(html) {
  const { JSDOM } = jsdom;
  const dom = new JSDOM(html);
  const $ = jquery(dom.window);

  let items = $(".searchbycat").children();
  console.log(items.length);

  for( let i = 0; i < items.length; i++ ) {
    let href = $(items[i]).find( ("a")[0] ).attr("href");
    href = domain + href;
    jobCatURLs.push(href);
    getJobs(href);
  }

  //console.log(jobCatURLs);
}

function parseJobDetail(html, url) {
  const { JSDOM } = jsdom;
  const dom = new JSDOM(html);
  const $ = jquery(dom.window);

  let obj = {};
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

  console.log(obj.title);
  let json = JSON.stringify(obj);
  
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

function parseJobList(html, url) {
  const { JSDOM } = jsdom;
  const dom = new JSDOM(html);
  const $ = jquery(dom.window);

  let jobs = $(".searchResults").find("tr.data-row");
  console.log(url);
  console.log(jobs.length);

  for( let i = 0; i < 1; i++ ) {
  //for( let i = 0; i < jobs.length; i++ ) {
    let title = $(jobs[i]).find(".jobTitle-link").html();
    let jobURL = $(jobs[i]).find(".jobTitle-link").attr("href");
    jobURL = domain + jobURL;
    //console.log(jobURL);
    getJobDetail(jobURL);
  }

}

function getJobs(url) {
  curl.get(url, null, function(err, resp, body) {
    if(resp.statusCode == 200) {
      parseJobList(body, url);
    }
    else {
      //some error handling
      console.log("error while fetching url: " + url);
    }
  });
}

curl.get(url, null, function(err, resp, body) {
  if(resp.statusCode == 200) {
    crawlJobCats(body);
  }
  else{
     //some error handling
     console.log("error while fetching url");
  }
});

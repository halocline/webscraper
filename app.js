// job-centura-health.js
// https://github.com/halocline
// mdglissmann@gmail.com
// March 2018

/* Libraries */
const fs = require('fs');
const centura = require('./sites/centura-health/jobs-centura-health');
const c2 = require('./sites/centura-health/jobs-centura-health_v0.3');

const centuraURL = centura.config.url;
const c2URL = c2.config.url;
/*
centura.crawlJobs(centuraURL, function(err, res) {
  if (err) {
    console.log("Error detail: " + err);
  }
  console.log("# Job Postings collected: " + res.length);
  let data = JSON.stringify(res);
  //console.log(data);

  fs.writeFile("./sites/centura-health/data-out/data.json", data, function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("SUCCESS: Collected job postings file saved.");
  });
});
*/
c2.getJobPosts(c2URL, handleJobData);

function handleJobData(err, res) {
  if(err) { console.error("Error getting job postings: ", err); }
  console.log("# Job Postings collected: " + res.length);
  saveResults(c2.config.saveDestination, 'centura-health-jobs', res);
}

function saveResults(path, file, data, format = 'json') {
  let uri = path + file + '.' + format;
  fs.writeFile(uri, data, saveStatus);
}

function saveStatus(err, res) {
  if(err) { return console.error("Error saving data file: ", err); }
  console.log("SUCCESS: Collected job postings file saved.");
}

// job-centura-health.js
// https://github.com/halocline
// mdglissmann@gmail.com
// March 2018

/* Libraries */
const fs = require('fs');
const centura = require('./sites/centura-health/jobs-centura-health');

const centuraURL = centura.config.url;

centura.crawlJobs(centuraURL, function(err, res) {
  if (err) {
    console.log("Error detail: " + err);
  }
  console.log(res.length);
  let data = JSON.stringify(res);
  console.log(data);

  fs.writeFile("./sites/centura-health/data-out/data.json", data, function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("The file was saved!");
  });
});

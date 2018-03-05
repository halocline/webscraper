// job-centura-health.js
// https://github.com/halocline
// mdglissmann@gmail.com
// March 2018

/* Libraries */
const centura = require('./sites/centura-health/jobs-centura-health');

const centuraURL = centura.config.url;

centura.crawlJobs(centuraURL);

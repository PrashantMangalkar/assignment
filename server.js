const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
var app = express();

/**
 * Extracting data from returned response
 * @param {*} resString 
 * @returns 
 */
const extractList = (resString) => {
    const $ = cheerio.load(resString);
    const jobPostings = $('div.lever-jobs-wrapper').find($('div.job-posting'))
        .map((i, job) => {
            return {
                department: $(job).find($('.job-heading .department')).text(),
                noOfOpening: $(job).find($('.job-content')).find($('.listing')).length,
                jobs: $(job).find($('.job-content')).find($('.listing')).map((i, jobEl) => {
                    return {
                        name: $(jobEl).find($('a div.job-name')).text(),
                        position: $(jobEl).find($('a div.job-position')).text(),
                        link: $(jobEl).find('a').attr('href')
                    }
                }).toArray()
            }
        })
        .toArray()
    return jobPostings
}

/**
 * fetching jobs from Actian Careers
 */
app.get('/fetchjobs', async (req, res) => {
    try {
        if (req.query.department) {
            const response = await axios.get('https://www.actian.com/company/careers/')
            const jobData = extractList(response.data)
            if (jobData.length > 0) {
                const filteredJobs = jobData.find(obj => obj.department === req.query.department)
                if (filteredJobs) {
                    res.send(filteredJobs);
                } else {
                    res.send('No Jobs found for provided department!');
                }
            } else {
                res.send('No department found!');
            }

        } else {
            res.send('Department is required!');
        }
    } catch (err) {
        res.send(err);
    }
});

app.listen(3000, () => {
    console.log("server is running on port 3000")
})

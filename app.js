const scrape = require('website-scraper');
const express = require('express');
var bodyParser = require('body-parser');
const path = require("path");
const fs = require("fs");
const cors = require("cors");
var app = express()
const auth = require("./functions/auth");
var rimraf = require("rimraf");
var zipFolder = require('zip-folder');
const dotenv = require('dotenv');
dotenv.config();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
const port = process.env.PORT

// CORS Middleware
app.use(cors());

// Set Static Folder
app.use(express.static(path.join(__dirname, "public")));

//get user URL
app.post('/sendUrl', (req, res) => {

    //validate user URL
    var validatUrl = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/;
    if (!validatUrl.test(req.body.url)) {
        return res.json({ success: false })
    }
    else {
        let options = {
            urls: [req.body.url],
            directory: './temp',
        };
        scraper(options).then(res => {
            zipper(options).then(res => {

                authUser();
            })

        });


    }
    //download whole website
    async function scraper(options) {
        try {
            // with async/await
            await scrape(options);

        } catch (error) {
            if (fs.existsSync('./temp')) {
                rimraf('./temp', async function () {
                    console.log("Deleting Temp Folder...");
                    await scrape(options);
                });
            }
        }


    }
    //auth user in buils.phonegap with token
    async function authUser() {
        authunticate = await auth.authUser()

    }

    //zip downloaded website
    async function zipper(options) {
        zipFolder(options.directory, './temp.zip', function (err) {
            if (err) {
                console.log('oh no!', err);
            } else {
                console.log('EXCELLENT');
                rimraf('./temp', async function () {
                    console.log("Deleting Temp Folder...");
                });
            }
        });
    }

});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
const scrape = require('website-scraper');
const express = require('express');
var bodyParser = require('body-parser');
const path = require("path");
const fs = require("fs");
const cors = require("cors");
var app = express()
const auth = require("./functions/auth");
var rimraf = require("rimraf");
const { zip } = require('zip-a-folder');

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
app.post('/sendUrl',async (req, res) => {

    //validate user URL
    var validatUrl = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/;
    if (!validatUrl.test(req.body.url)) {
        return res.json({ success: false })
    }
    else {
        let options = {
            urls: [req.body.url],
            directory: './temp/www',
        };
       scraper(options).then(res=>{
           zipper()
       });

    }
    //download whole website
    async function scraper(options) {
        return new Promise(async function (resolve, reject) {
            console.log('scraper start..');

            if (fs.existsSync(options.directory)) {
                rimraf(options.directory, async function () {
                    console.log("Deleting www Folder...");
                    console.log('scrapping....');
                    scrape(options).then((result) => {
                        resolve();
                    });

                });
            } else {
                // with async/await
                console.log('scrapping....');
                scrape(options).then((result) => {
                    resolve();
                    console.log('done scrapping');
                });
            }

        })

    }
    //auth user in buils.phonegap with token
    async function authUser() {
        console.log('auth');

        authunticate = await auth.authUser()

    }

    //zip downloaded website
  async  function zipper(params) {
        let buildFolder = './temp'
        try {
            await zip(buildFolder, './temp.zip').then(res=>{
                authUser()
                
            });
            
        } catch (error) {
         console.log(error);
            
        }
    }

});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
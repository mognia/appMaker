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
const Jimp = require('jimp');
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
app.post('/sendUrl', async (req, res) => {

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
        scraper(options).then(res => {
            imageResizer()
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

    function imageResizer(params) {
        console.log('start resizing');
        //making android icons
        Jimp.read('lenna.png')
            .then(lenna => {
                return lenna
                .resize(192, 192, Jimp.RESIZE_NEAREST_NEIGHBOR) // resize
                .write('./Temp/res/icon/android/drawable-xxxhdpi-icon.png'); // save
                  
            }).then(lenna => {
                return lenna
                .resize(144, 144, Jimp.RESIZE_NEAREST_NEIGHBOR) // resize
                .write('./Temp/res/icon/android/drawable-xxhdpi-icon.png'); // save
         
            });
            Jimp.read('lenna.png')
            .then(lenna => {
                return lenna
                .resize(96, 96, Jimp.RESIZE_NEAREST_NEIGHBOR) // resize
                .write('./Temp/res/icon/android/drawable-xhdpi-icon.png'); // save
                   
            }).then(lenna => {
                return lenna
                .resize(48, 48, Jimp.RESIZE_NEAREST_NEIGHBOR) // resize
                .write('./Temp/res/icon/android/drawable-mdpi-icon.png'); // save
            });
            Jimp.read('lenna.png')
            .then(lenna => {
                return lenna
                .resize(72, 72, Jimp.RESIZE_NEAREST_NEIGHBOR) // resize
                .write('./Temp/res/icon/android/drawable-hdpi-icon.png'); // save
              
            }).then(lenna => {
                return lenna
                .resize(36, 36, Jimp.RESIZE_NEAREST_NEIGHBOR) // resize
                .write('./Temp/res/icon/android/drawable-ldpi-icon.png'); // save
            }).then(lenna => {
                console.log('done resizing');

                zipper()
            }
            )
            .catch(err => {
                console.error(err);
            });
    }

    //zip downloaded website
    async function zipper(params) {
        let buildFolder = './temp';
        console.log('start zipping');
        
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
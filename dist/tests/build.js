"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request");
const dotenv = require("dotenv");
dotenv.config();
describe("build scenarios", () => {
    it("shoud build with url", done => {
        request({
            url: "http://localhost:" + (process.env.port || 3000) + "/sendUrl",
            method: "post",
            json: {
                url: "https://www.w3schools.com/"
            }
        }, (err, res, body) => {
            if (err)
                throw err;
            console.log(err, body);
            done();
        });
    }).timeout(0);
});

const NodeID3 = require('node-id3')
const fs = require('fs');

const express = require('express')
const app = express()

var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }));

let inputPath = "D:\\Corrin\\Downloads\\JubyPhonic☆Covers\\"

let filesArr = []

let iteration = 0;

app.get('/', function (req, res) {

    if (iteration == 0) {
        fs.readdir(inputPath, (err, files) => {
            files.forEach(file => {
                let artists = file.match(/\[(.*?)\]/)
                if (!artists) artists = ["none", "JubyPhonic"]

                let artistsFinal;

                if (artists.length > 1) artistsFinal = artists[1].split("+")
                else artistsFinal = [artists[1]]

                let fileObj = {
                    title: file.split("[")[0].trim(),
                    "artists": artistsFinal
                }

                filesArr.push(inputPath + file, [fileObj])
            });

            // let tags = {
            //     title: "Tomorrow",
            //     artist: "Kevin Penkin",
            //     album: "TVアニメ「メイドインアビス」オリジナルサウンドトラック",
            //     APIC: "./example/mia_cover.jpg",
            //     TRCK: "27"
            // }

            // const success = NodeID3.write(tags, filepath) // Returns true/Error
            // // async version
            // NodeID3.write(tags, file, function (err) {})

            res.send('<form method="POST" action="/post"> <input type="text" name="data" /> <input type="submit" /></form>')



        });
    } else{
        res.send("Welcome Back!")
    }



})

app.post('/post', function (req, res) {
    console.log(req.body.data);
    iteration++
    res.redirect("/")
});

app.listen(3000)
const NodeID3 = require('node-id3')
const fs = require('fs');
const {
    image_search,
    image_search_generator
} = require('duckduckgo-images-api')
const axios = require('axios');
const sharp = require('sharp');

const express = require('express')
const app = express()

app.use(express.json())

const PORT = 3000;

let inputPath = "D:\\Corrin\\Downloads\\JBC2\\"

let filesArr = []

let iteration = 0;

app.get('/', function (req, res) {

    if (iteration == 0) {
        fs.readdir(inputPath, async (err, files) => {
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

                filesArr.push([inputPath + file, fileObj])
            });

            sendPage()

        });
    } else {
        sendPage()
    }

    async function sendPage() {
        if (iteration == filesArr.length) return res.send("Reached End")

        let searchQuery = filesArr[iteration][1].title + " by " + filesArr[iteration][1].artists

        let results = await image_search({
            query: searchQuery,
            moderate: false,
            iterations: 1,
            retries: 2
        })

        let baseHTML = '<style> img { /* float: left; */ width: auto; height: 200px; object-fit: cover; object-position: 50%; } main { padding-left: 50px; padding-right: 50px; padding-top: 25px; }</style><main> <label for="overwriteURL">Overwrite URL</label> <input type="text" id="overwriteURL" name="overwriteURL" /> <button onclick="submit()">Submit</button> <br> <br><img onclick="submit(event)"'
        let imageHTML = "";
        let endingHTML = '</main><script> window.post = function (data) { return fetch("/post", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); }; let content = document.getElementsByClassName("modal-content")[0]; function checkImage(src, good, bad) { var img = new Image(); img.onload = good; img.onerror = bad; img.src = src; } function submit(e) { let data = { failed: false }; let selectedImage = e; if (selectedImage) data.url = e.target.src; else if (document.getElementById("overwriteURL").value != "") data.url = document.getElementById("overwriteURL") .value; else data.failed = true; checkImage(data.url, function () { return finish(data) }, function () { alert("Overwrite Image URL Invalid"); }); function finish(data) { fetch("/post", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); setTimeout(function () { window.location.reload() }); } }</script>'

        let imagesCount = 0

        for (var i = 0; i < results.length; i++) {
            imageHTML += `<img onclick="submit(event)" src="${results[i].image}">`
            if (imagesCount >= 9) break;
            imagesCount++
        }

        iteration++

        res.send(`Search: ${searchQuery}` + baseHTML + imageHTML + endingHTML)

    }

})

app.post('/post', async function (req, res) {
    let data = req.body


    // let finalImage = (await axios.get(data.url, {responseType: 'arraybuffer'})).data
    let finalImage = await sharp((await axios.get(data.url, {
        responseType: 'arraybuffer'
    })).data).resize({
        width: 600,
        height: 600,
        fit: sharp.fit.cover,
        position: sharp.strategy.entropy
    }).toBuffer()


    // Make change with the data?
    let tags = {
        title: filesArr[iteration - 1][1].title,
        artist: filesArr[iteration - 1][1].artists.join(";"),
        APIC: finalImage,
    }

    const success = NodeID3.write(tags, filesArr[iteration - 1][0]) // Returns true/Error

});

app.listen(PORT)

console.log(`Listening on http://localhost:${PORT}`)
const express = require('express');
const server = express();
const port = 5000;
var bot = require('nodemw');
var fs = require('fs');

var client = new bot({
    protocol: 'https',
    server: 'es.wikipedia.org',
    path: '/w',
    debug: false
});

server.use(express.static('public'));

server.get("/", (req, res) => {
    let slug = ''

    if(req.query.slug){
        slug = req.query.slug;
    }

    if(slug != ''){
        client.getArticleRevisions(slug, function (err, data) {
            if (err) {
                res.send(err)
                return;
            }
            if (data) {
                var json = JSON.stringify(data);
                fs.writeFile('./public/data/' +slug + '.json', json, 'utf8', () => {
                    
                });
                // res.json(data);
                res.send('<a href="http://localhost:' + port + '/viz/?slug=' + slug + '">enlace</a>')
            }
        });
    } else {
        res.send('no slug')
    }
        
});

server.get("/viz", (req, res) => {
    res.sendFile(__dirname + '/public/viz.html');
})

server.listen(port, () => {
    console.log(`Server listening at ${port}`);
});
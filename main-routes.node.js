
var fs = require('fs')

var sttic = {}
sttic['index.html'] = fs.readFileSync('./index.html');
sttic[',.js'] = fs.readFileSync('./,.js');
sttic[',.css'] = fs.readFileSync('./,.css');
sttic['background.png'] = fs.readFileSync('./background.png');

try {
    var data = fs.readFileSync('./data.json')
} catch(e) {
    if(e.code == 'ENOENT')
        data = '{}'
    else
        throw e
}
data = JSON.parse(data)

module.exports = function(app) {

    var routes = { };

    //routes['/asciimo'] = function(req, res) {
    //    var link = "http://i.imgur.com/kmbjB.png";
    //    res.send("<html><body><img src='" + link + "'></body></html>");
    //};

    app.get('/', function(req, res) {
        res.setHeader('Content-Type', 'text/html; charset="UTF-8"');
        res.send(sttic['index.html'] );
    })
    app.get('/,.js', function(req, res) {
        res.setHeader('Content-Type', 'text/javascript; charset="UTF-8"');
        res.send(sttic[',.js'] );
    })
    app.get('/,.css', function(req, res) {
        res.setHeader('Content-Type', 'text/css; charset="UTF-8"');
        res.send(sttic[',.css'] );
    })
    app.get('/background.png', function(req, res) {
        res.setHeader('Content-Type', 'image/png; charset="UTF-8"');
        res.send(sttic['background.png'] );
    })
    app.post('/post', doPost)

}

function save() {
    fs.writeFileSync('./data.json.new', JSON.stringify(data, null, 4))
    fs.renameSync('./data.json.new', './data.json')
}

function doPost(req, res) {
    res.setHeader('Content-Type', 'text/plain; charset="UTF-8"');
    if(req.body.action == 'login')
        doPostLogin(req, res)
    else if(req.body.action == 'refresh')
        doPostRefresh(req, res)
    else
        res.send('{"whoops":"That does not compute!"}')
}
function doPostRefresh(req, res) {
}
function doPostLogin(req, res) {
    if(!data.users)
        data.users = [{
            "id": 1,
            "username":"PeskyWabbit",
            "password":"wildplay!!"
        }]
    for(var i = 0; i < data.users.length; i++) {
        if(data.users[i].username == req.body.username) {
            if(data.users[i].password == req.body.password) {
                res.send('{"thanks":' + JSON.stringify(JSON.stringify([data.users[i].username, data.users[i].password])) + '}')
                return
            }
        }
    }
    res.send('{"whoops":"Rejected!"}')
}
function checkAuth(cookie) {
    cookie = JSON.parse(cookie)
    if(Array.isArray(cookie))
        return null
    var username = cookie[0]
    var password = cookie[1]
    if(typeof username == 'string' && typeof password == 'string')
        for(var i = 0; i < data.users.length; i++)
            if(data.users[i].username == req.body.username)
                if(data.users[i].password == req.body.password) 
                    return data.users[i]
    return null
}


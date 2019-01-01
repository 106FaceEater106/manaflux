const polka = require('polka'), rp = require('request-promise-native');
const os = require('os');

class RemoteConnectionHandler {
  constructor() {
    this.address = this._queryAddress();
  }

  async start() {
    function log(req, res, next) {
      console.log(`[RemoteConnectionHandler] > ${req.url}`);
      next();
    }

    function handle( req, res, next ) {
      var data = '';
      req.on( 'data', function( chunk ) {
        data += chunk;
      });
      req.on( 'end', function() {
        req.rawBody = data;
        console.log('Phone token handled: ' + req.rawBody);
        rp.post({
          method: 'POST',
          uri: 'https://manaflux-server.herokuapp.com/v1/phone/update-token',
          body: req.rawBody
        }).then(() => {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end('OK');
        }).catch(console.error);        
        next();
      });
    }

    this._server = polka()
      .use(log)
      .use(handle)
      .get('/summoner', (req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ summonerName: Mana.user.getDisplayName() }));
      })
      .post('/phone-token', (req, res) => {        
        console.log("[RemoteConnectionHandler] New token");
      })
      .listen(4500, err => {
        if (err) throw err;
        console.log(`[RemoteConnectionHandler] > Running on localhost:4500`);
      });
  }

  async stop() {

  }

  _queryAddress() {
    const interfaces = os.networkInterfaces();

    var all = Object.keys(interfaces).map(function (nic) {
      if (nic.includes('VirtualBox')) return undefined;

      var addresses = interfaces[nic].filter(function (details) {
        details.family = details.family.toLowerCase();
        if (details.family !== 'ipv4' && details.internal === false) return false;
        else return true;
      });

      return addresses.length ? addresses[0].address : undefined;
    }).filter(Boolean);

    return all[0];
  }
}

module.exports = RemoteConnectionHandler;

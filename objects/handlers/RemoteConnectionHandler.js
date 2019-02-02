const polka = require('polka'), rp = require('request-promise-native');
const os = require('os');

class RemoteConnectionHandler {
  constructor() {
    this.address = this._queryAddress();
  }

  auth(req, res, next) {
    let list = Mana.getStore().get('authentified-devices', {});

    if (req.path.startsWith('/api/v1/authentify')) next();
    else if (!req.headers['authorization']) {
      console.log(`[RemoteConnectionHandler] Unauthorized > ${req.url}`);
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, errorCode: 'UNAUTHORIZED', error: 'You are not authorized' }));
    } else {
      if (list[req.connection.remoteAddress.split(":").pop().replace(/\./g, '-')]) {
        console.log(`[RemoteConnectionHandler] > ${req.url}`);
        next();
      } else {
        console.log(`[RemoteConnectionHandler] Forbidden > ${req.url}`);
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, errorCode: 'UNAUTHORIZED', error: 'You are not authorized' }));
      }
    }
  }

  async start() {
    this._server = polka()
      .use(this.auth)
      .post('/api/v1/authentify/:deviceType/:name', (req, res) => {
        Mana.getStore().set('authentified-devices.' + req.connection.remoteAddress.split(":").pop().replace(/\./g, '-'), { deviceType: req.params.deviceType || 'UNKNOWN', deviceName: req.params.name || 'UNKNOWN' });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, authentified: true }));
      })
      .get('/api/v1/heartbeat', (req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, inChampionSelect: Mana.championSelectHandler._inChampionSelect, ...Mana.champions[Mana.championSelectHandler._inChampionSelect ? Mana.championSelectHandler.getPlayer().championId : -1] }));
      })
      .get('/api/v1/summoner', (req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });

        if (Mana.user)
          res.end(JSON.stringify({ success: true, summonerName: Mana.user.getDisplayName(), summonerLevel: Mana.user.getSummonerLevel() }));
        else res.end(JSON.stringify({ success: false, errorCode: 'SUMMONER_NOT_CONNECTED', error: 'Summoner is not connected' }));
      })
      .get('/api/v1/actions/positions', (req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });

        if (!Mana.championSelectHandler._inChampionSelect) res.end(JSON.stringify({ success: false, errorCode: 'NOT_IN_CHAMPION_SELECT', error: 'Not in Champion Select' }));

        res.end(JSON.stringify({ success: true, positions: Array.from(document.getElementById('positions').childNodes).map(x => x.value) }));
      })
      .post('/api/v1/actions/positions/:id', (req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        if (!Mana.championSelectHandler._inChampionSelect) res.end(JSON.stringify({ success: false, errorCode: 'NOT_IN_CHAMPION_SELECT', error: 'Not in Champion Select' }));

        document.getElementById('positions').selectedIndex = req.params.id;
        document.getElementById('positions').onchange();

        res.end(JSON.stringify({ success: true }));
      })
      .post('/api/v1/actions/summoner-spells/load', (req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        if (!Mana.championSelectHandler._inChampionSelect) res.end(JSON.stringify({ success: false, errorCode: 'NOT_IN_CHAMPION_SELECT', error: 'Not in Champion Select' }));

        res.end(JSON.stringify({ success: true }));
      })
      .post('/api/v1/actions/runes/load', (req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        if (!Mana.championSelectHandler._inChampionSelect) res.end(JSON.stringify({ success: false, errorCode: 'NOT_IN_CHAMPION_SELECT', error: 'Not in Champion Select' }));

        res.end(JSON.stringify({ success: true }));
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
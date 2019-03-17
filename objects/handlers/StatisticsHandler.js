class StatisticsHandler {
  constructor() {
    UI.dots.hideFor('home');
  }

  load() {}

  onChampionSelectEnd() {
    document.querySelector('#matchup > .tab-activable').innerHTML = '';
    document.querySelector('#statistics > .tab-activable').innerHTML = `<div class="statistics-portrait">
 <img id="champion">
 <img id="hextechAnimationBackground" data-custom-component="hextech-background" src="assets/img/vfx-white.png">
 <p id="statistics-champion-name"></p>
 </div>
 <p style="text-align: left;">
 <span style="color: #ffff;" data-i18n="statistics-header-stat"></span>
 <span style="position: absolute; left: 150px; color: #e58e26;" data-i18n="statistics-header-avg"></span>
 <span style="position: absolute; left: 250px; color: #38ada9;" data-i18n="statistics-header-role-placement"></span>
 <span style="position: absolute; left: 400px; color: #78e08f;" data-i18n="statistics-header-patch-change"></span>
 </p>`;

    UI.tabs.disable('home', 1);
    UI.tabs.disable('home', 2);

    UI.dots.hideFor('home');
  }

  display(champion = Mana.gameClient.champions[1], data, position) {
    if (!data)
      data = {
        stats: {
          winrate: { avg: '42.68%', rolePlacement: '49/49', patchChange: '-2' },
          playrate: { avg: '0.22%', rolePlacement: '48/49', patchChange: '-1' },
          banrate: { avg: '0.08%', rolePlacement: '37/49', patchChange: '+5' },
          k: { avg: '6.20', rolePlacement: '49/49', patchChange: '-2' },
          d: { avg: '6.94', rolePlacement: '49/49', patchChange: '-2' },
          a: { avg: '8.29', rolePlacement: '49/49', patchChange: '-2' },
          overall: { rolePlacement: '7/49', patchChange: '+5' }
        },
        matchups: {
          counters: {
            1: { games: 1989, wr: 17, position: 'MIDDLE' },
            2: { games: 1320, wr: 39, position: 'MIDDLE' },
            3: { games: 1874, wr: 41.90, position: 'MIDDLE' },
            4: { games: 1989, wr: 44.90, position: 'MIDDLE' },
            5: { games: 1320, wr: 44.55, position: 'MIDDLE' },
            6: { games: 1874, wr: 44.95, position: 'MIDDLE' },
            7: { games: 1989, wr: 45.95, position: 'MIDDLE' },
            8: { games: 1320, wr: 46.95, position: 'MIDDLE' },
            9: { games: 1874, wr: 47.95, position: 'MIDDLE' },
            10: { games: 1989, wr: 48.95, position: 'MIDDLE' },
            11: { games: 1320, wr: 49.95, position: 'MIDDLE' },
            12: { games: 1874, wr: 50.95, position: 'SUPPORT', link: 'https://champion.gg/champion/Alistar/Support' }
          },
          synergies: {
            1: { games: 1989, wr: 17, position: 'MIDDLE' },
            2: { games: 1320, wr: 39, position: 'MIDDLE' },
            3: { games: 1874, wr: 41.90, position: 'MIDDLE' },
            4: { games: 1989, wr: 44.90, position: 'MIDDLE' },
            5: { games: 1320, wr: 44.55, position: 'MIDDLE' },
            6: { games: 1874, wr: 44.95, position: 'MIDDLE' },
            7: { games: 1989, wr: 45.95, position: 'MIDDLE' },
            8: { games: 1320, wr: 46.95, position: 'MIDDLE' },
            9: { games: 1874, wr: 47.95, position: 'MIDDLE' },
            10: { games: 1989, wr: 48.95, position: 'MIDDLE' },
            11: { games: 1320, wr: 49.95, position: 'MIDDLE' },
            12: { games: 1874, wr: 50.95, position: 'SUPPORT', link: 'https://champion.gg/champion/Alistar/Support' }
          }
        }
      };

    if (Mana.getStore().get('statistics')) this.displayStatistics(champion, data);
    else UI.disableTab(document.getElementById('statistics'));
    if (Mana.getStore().get('matchups')) this.displayMatchups(champion, data);
    else UI.disableTab(document.getElementById('matchup'));

    UI.dots.showFor('home');
  }

  displayStatistics(champion, data) {
    let content = document.querySelector('#statistics > .tab-activable'), html = ``;

    document.getElementById('statistics-champion-name').innerHTML = `${champion.name}<br>${UI.stylizeRole(data.position)}`;
    document.querySelector('#statistics > .tab-activable > .statistics-portrait > #champion').src = champion.img;

    for (const [key, value] of Object.entries(data.stats)) {
      if (key === 'overall') continue;

      html += `<p style="text-align: left;">
        <span style="color: #ffff;">${i18n.__('statistics-stats-' + key)}</span>
        <span style="position: absolute; left: 150px; color: #e58e26;">${value.avg || i18n.__('statistics-no-data')}</span>
        <span style="position: absolute; left: 250px; color: #38ada9;">${value.rolePlacement || i18n.__('statistics-no-data')}</span>
        <span style="position: absolute; left: 400px; color: #78e08f;">(${value.patchChange || i18n.__('statistics-no-data')})</span>
      </p>`;
    }

    content.innerHTML += html;
    UI.tabs.enable('home', 2);
  }

  displayMatchups(champion, data) {
    let content = document.querySelector('#matchup > .tab-activable'), html = `<div class="matchup-list list-left">`;

    let vs2, vs1, type = 'synergy';

    if (Mana.getStore().get('statistics-data-preferences', 0) == 1 || !data.matchups.synergies) {
      let sorted = Object.entries(data.matchups.counters).sort((a, b) => a[1].wr - b[1].wr);
      let length = sorted.length >= 12 ? 12 : sorted.length;

      vs1 = sorted.slice(0, length / 2);
      vs2 = sorted.slice(length / 2, length).sort((a, b) => b[1].wr - a[1].wr);

      type = 'counter-them';
      html += `<p style="color: #b33939;font-size: 21px;margin: -3% 0 3%;">${i18n.__('statistics-counter-you')}</p>`;
    }
    else {
      vs1 = Object.entries(data.matchups.counters).sort((a, b) => a[1].wr - b[1].wr).slice(0, 6);
      vs2 = Object.entries(data.matchups.synergy).sort((a, b) => b[1].wr - a[1].wr).slice(0, 6);

      html += `<p style="color: #b33939;font-size: 21px;margin: -3% 0 3%;">${i18n.__('statistics-counters')}</p>`;
    }

    for (const [id, value] of vs1) {
      html += `<div class="matchup matchup-left">
        <img src="${Mana.gameClient.champions[id].img}" />
        <div class="champion-data">
          <span style="color: #dcdde1;">${value.games ? i18n.__('statistics-games', value.games) : i18n.__('statistics-winrate')}</span>
          <progress class="matchup-progress matchup-progress-counter" id="progress-vs-${id}" max="100" value="${value.wr}" data-label="${value.wr}%">
          </progress>
        </div>
      </div>`;
    }
    html += `</div><div class="matchup-list list-right" id="${type}"><p style="color: #${type === 'synergy' ? '27ae60' : 'ffb142'};font-size: 21px;margin: -3% 0 3%;">${i18n.__('statistics-' + type)}</p>`;
    for (const [id, value] of vs2) {
      html += `<div class="matchup matchup-right">
        <div class="champion-data">
          <span style="color: #dcdde1;">${value.games ? i18n.__('statistics-games', value.games) : i18n.__('statistics-no-data')}</span>
          <progress class="matchup-progress matchup-progress-synergy" id="progress-vs-${id}" max="100" value="${value.wr}" data-label="${value.wr}%"></progress>
        </div>
        <img src="${Mana.gameClient.champions[id].img}" />
      </div>`;
    }

    content.innerHTML = html + '</div>';

    /* Tooltips */
    tippy(document.querySelector('.matchup.matchup-left > .champion-data > progress'), { content: i18n.__('statistics-tooltips-winrate', champion.name, Mana.gameClient.champions[vs1[0][0]].name) });

    UI.tabs.enable('home', 1);
  }
}

module.exports = StatisticsHandler;

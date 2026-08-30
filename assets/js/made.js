/*  The studio credit, and the door behind it.
 *  ------------------------------------------------------------------
 *  One chip in the footer rack on every page. Pressing it opens a
 *  dialog with three ways out: this site's own about page, the studio,
 *  and the founder's own writing.
 *
 *  The markup is built here rather than repeated in four HTML files —
 *  it is identical on all of them, and four copies of a dialog is four
 *  places to forget to fix something.
 *  ------------------------------------------------------------------ */
(function () {
  'use strict';

  var DOORS = [
    { href: 'about.html', kind: 'here',
      name: 'About', sub: 'On this site',
      line: 'Who made this, and the studio behind it.' },
    { href: 'https://lovelace.co.in', kind: 'out',
      name: 'Lovelace', sub: 'lovelace.co.in',
      line: 'The studio. Websites, brands and digital products.' },
    { href: 'https://misterlove.in', kind: 'out',
      name: 'Mister Love', sub: 'misterlove.in',
      line: 'Long-form essays and research by Lovepreet Singh.' },
  ];

  function build() {
    var wrap = document.createElement('div');
    wrap.id = 'made';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-labelledby', 'made-h');
    wrap.hidden = true;
    wrap.innerHTML =
      '<div class="made__in">' +
        '<p class="made__kick">Made by</p>' +
        '<h2 class="made__mark" id="made-h">Lovelace</h2>' +
        '<p class="made__line">Creative design studio. Where would you like to go?</p>' +
        '<div class="made__doors">' +
          DOORS.map(function (d) {
            var ext = d.kind === 'out';
            return '<a class="door" href="' + d.href + '"' +
              (ext ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' +
              '<span class="door__name">' + d.name +
                (ext ? '<svg class="door__out" viewBox="0 0 24 24" aria-hidden="true">' +
                       '<path d="M7 17L17 7M9 7h8v8"/></svg>' : '') +
              '</span>' +
              '<span class="door__sub">' + d.sub + '</span>' +
              '<span class="door__line">' + d.line + '</span>' +
            '</a>';
          }).join('') +
        '</div>' +
        '<button class="chip made__close" type="button">Close</button>' +
      '</div>';
    document.body.appendChild(wrap);
    return wrap;
  }

  function ready() {
    var key = document.getElementById('k-made');
    if (!key) return;
    var el = build();

    function open(on) {
      if (on) el.hidden = false;
      requestAnimationFrame(function () {
        if (on) el.setAttribute('data-open', ''); else el.removeAttribute('data-open');
        if (!on) setTimeout(function () { el.hidden = true; }, 240);
      });
      key.setAttribute('aria-expanded', String(on));
      if (on) setTimeout(function () { el.querySelector('.door').focus(); }, 130);
      else if (el.contains(document.activeElement)) key.focus();
    }

    key.setAttribute('aria-haspopup', 'dialog');
    key.setAttribute('aria-expanded', 'false');
    key.addEventListener('click', function () {
      open(key.getAttribute('aria-expanded') !== 'true');
    });
    el.querySelector('.made__close').addEventListener('click', function () { open(false); });
    /* the ground behind the doors closes it, like any dialog */
    el.addEventListener('click', function (e) { if (e.target === el) open(false); });
    addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !el.hidden) open(false);
    });
  }

  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', ready);
  else ready();
})();

/*  The about page has no player, so the corridor has no beat to move to.
    It gets one frame, held — the same shader as everywhere else, drawn
    once and then left alone. If WebGL will not come up, the CSS floor
    behind the canvas stands in and the page is unaffected. */
(function () {
  'use strict';
  function go() {
    var cv = document.getElementById('bg');
    var gpu = window.CORRIDOR ? window.CORRIDOR.start(cv) : null;
    if (!gpu) { cv.style.display = 'none'; return; }
    function paint() {
      gpu.draw({ time: 8.5, dist: 6.2, beat: 0, bar: 0, force: 0.55, roll: 0,
                 accent: [0.95, 0.69, 0.12], lamp: [1.00, 0.86, 0.62],
                 mood: 0.24, party: 0 });
    }
    paint();
    /* the shader sizes itself off the canvas, so a resize needs a redraw */
    addEventListener('resize', paint);
  }
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', go);
  else go();
})();

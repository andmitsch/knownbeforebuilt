/* Visitor statistics with PostHog, shared by knownbeforebuilt.com and andreasmitschke.com.

   Cookieless: nothing is stored on or read from the visitor's device (no cookies, no local storage). PostHog's
   servers count a visit with a one-way code made from IP address, browser and a random value that changes and is
   deleted every day. EU servers. No session recordings, no surveys, no personal profiles, no form contents.

   What is recorded: page views, how long a page stays open, where visitors came from (referrer, utm_ tags), and
   these named clicks:
     shop_click      a bookshop on the buy page (shop, market, price)
     cta_click       a link to the buy or pre-launch page ("Get the Book", Signal), with its ?from= placement
     download        a PDF (file name)
     email_click     a mailto link (only the mailbox name, e.g. "publishing")
     outbound_click  a link to another website (host and path)
   Pages can add their own with kbTrack('name', { ... }), e.g. the launch sign-up.

   Browsers that send Do Not Track or Global Privacy Control are not counted, and nothing runs outside the two live
   domains (local copies, the design canvas, previews). The library is loaded only after the page has finished
   loading, so it never slows the page down. */
(function () {
  var TOKEN = 'phc_nRJkcQFPz3JnmNxn8vhabF49S9v6dtYPbjqffFfvbyjB';
  var HOST = 'https://eu.i.posthog.com';
  var LIB = 'vendor/posthog-1.446.0.js';   /* next to this file */
  var LIVE = /^(www\.)?(knownbeforebuilt|andreasmitschke)\.com$/;

  var ready = false, queue = [];
  function send(name, props) {
    if (ready) window.posthog.capture(name, props, { transport: 'sendBeacon' });
    else if (queue.length < 20) queue.push([name, props]);
  }
  var off = !LIVE.test(location.hostname) || navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.globalPrivacyControl === true;
  window.kbTrack = off ? function () {} : function (name, props) { try { send(name, props || {}); } catch (e) {} };
  if (off) return;

  var me = document.currentScript, base = me && me.src ? me.src.replace(/[^/]*$/, '') : '';
  function load() {
    var s = document.createElement('script');
    s.src = base + LIB; s.async = true;
    s.onload = function () {
      if (!window.posthog || !window.posthog.init) return;
      window.posthog.init(TOKEN, {
        api_host: HOST,
        cookieless_mode: 'always',          /* nothing on the device */
        person_profiles: 'never',           /* never tie events to a person */
        respect_dnt: true,
        autocapture: false,                 /* only the named clicks below, nothing else on the page */
        capture_pageview: true,
        capture_pageleave: true,
        disable_session_recording: true,
        disable_surveys: true,
        disable_web_experiments: true,
        disable_product_tours: true,
        capture_performance: false,
        capture_heatmaps: false,
        capture_dead_clicks: false,
        capture_exceptions: false,
        advanced_disable_flags: true,       /* no feature-flag requests */
        loaded: function () { ready = true; queue.forEach(function (q) { send(q[0], q[1]); }); queue = []; }
      });
    };
    document.head.appendChild(s);
  }
  if (document.readyState === 'complete') setTimeout(load, 300);
  else window.addEventListener('load', function () { setTimeout(load, 300); });

  function txt(root, sel) { var el = root.querySelector(sel); return el ? el.textContent.trim() : ''; }
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null; if (!a) return;
    var url; try { url = new URL(a.href, location.href); } catch (_) { return; }
    var shop = a.closest('.shop');
    if (shop) return window.kbTrack('shop_click', { shop: txt(shop, '.shop-n'), market: txt(shop, '.shop-s'), price: txt(shop, '.shop-p') });
    if (url.protocol === 'mailto:') return window.kbTrack('email_click', { to: url.pathname.split('@')[0] });
    if (!/^https?:$/.test(url.protocol)) return;
    if (/\.pdf$/i.test(url.pathname)) return window.kbTrack('download', { file: decodeURIComponent(url.pathname.split('/').pop()) });
    if (/\/(buy|prelaunch)(\.html)?$/.test(url.pathname) && /knownbeforebuilt\.com$|^localhost/.test(url.hostname) || (url.host === location.host && /\/(buy|prelaunch)(\.html)?$/.test(url.pathname)))
      return window.kbTrack('cta_click', { to: url.pathname.replace(/^.*\//, '').replace('.html', ''), from: url.searchParams.get('from') || '', label: a.textContent.trim().slice(0, 40) });
    if (url.host !== location.host) return window.kbTrack('outbound_click', { host: url.host, path: url.pathname });
  }, true);
})();

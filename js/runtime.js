/*
 * kbb-runtime — renders the Design canvas artboards (.dc.html) as a normal web page.
 * Templates use {{holes}}, <sc-if>, <sc-for>, ref / on* handlers; logic classes extend DCLogic.
 * Rendering is done with Preact (React-compatible, MIT).
 */
(function () {
  'use strict';
  var P = window.preact, h = P.h, Fragment = P.Fragment;
  var HOLE = /\{\{\s*([^}]*?)\s*\}\}/g;
  var WHOLE = /^\s*\{\{\s*([^}]*?)\s*\}\}\s*$/;

  function lookup(expr, scopes) {
    if (expr === 'true') return true;
    if (expr === 'false') return false;
    if (expr === 'null') return null;
    if (expr === 'undefined' || expr === '') return undefined;
    if (/^-?\d+(\.\d+)?$/.test(expr)) return parseFloat(expr);
    var q = expr.match(/^(['"])(.*)\1$/); if (q) return q[2];
    var parts = expr.split('.'), head = parts[0], v;
    for (var i = 0; i < scopes.length; i++) { if (scopes[i] && head in scopes[i]) { v = scopes[i][head]; break; } }
    for (var j = 1; j < parts.length && v != null; j++) v = v[parts[j]];
    return v;
  }
  function interp(str, scopes) {
    return str.replace(HOLE, function (_, e) { var v = lookup(e, scopes); return v == null ? '' : String(v); });
  }

  function build(node, scopes) {
    if (node.nodeType === 3) {
      var t = node.nodeValue; return t.indexOf('{{') < 0 ? t : interp(t, scopes);
    }
    if (node.nodeType !== 1) return null;
    var tag = node.localName;
    if (tag === 'helmet') return null;
    if (tag === 'sc-if') {
      var cond = lookup((node.getAttribute('value') || '').replace(WHOLE, '$1'), scopes);
      return cond ? h(Fragment, null, kids(node, scopes)) : null;
    }
    if (tag === 'sc-for') {
      var list = lookup((node.getAttribute('list') || '').replace(WHOLE, '$1'), scopes) || [];
      var as = node.getAttribute('as') || 'item';
      return h(Fragment, null, list.map(function (item, idx) {
        var sc = {}; sc[as] = item; sc.$index = idx;
        return h(Fragment, { key: idx }, kids(node, [sc].concat(scopes)));
      }));
    }
    var props = {};
    for (var a = 0; a < node.attributes.length; a++) {
      var at = node.attributes[a], name = at.name, val = at.value;
      if (name.indexOf('hint-') === 0) continue;
      var m = val.match(WHOLE);
      var v = m ? lookup(m[1], scopes) : (val.indexOf('{{') >= 0 ? interp(val, scopes) : val);
      if (name === 'ref') { if (typeof v === 'function') props.ref = v; continue; }
      if (v === false || v == null) { if (/^on/.test(name)) continue; if (v == null) continue; }
      props[name] = v;
    }
    return h(tag, props, kids(node, scopes));
  }
  function kids(node, scopes) {
    var out = [];
    for (var c = node.firstChild; c; c = c.nextSibling) { var r = build(c, scopes); if (r !== null && r !== undefined) out.push(r); }
    return out;
  }

  function DCLogic(props) { P.Component.call(this, props); this.state = this.state || {}; }
  DCLogic.prototype = Object.create(P.Component.prototype);
  DCLogic.prototype.constructor = DCLogic;
  DCLogic.prototype.render = function () {
    var vals = this.renderVals ? this.renderVals() : {};
    return h(Fragment, null, kids(this.constructor.__tpl, [vals]));
  };
  window.DCLogic = DCLogic;

  window.kbbMount = function (Cls, tplId, mountEl, props) {
    var tpl = document.getElementById(tplId);
    Cls.__tpl = tpl.content;
    P.render(h(Cls, props || {}), mountEl);
  };
})();

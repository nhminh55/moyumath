/*
 * Scratchpad — nháp vẽ tay phủ lên khu vực làm bài (giống ALEKS).
 * Dùng: <script src="js/scratchpad.js"></script> rồi gọi
 *   Scratchpad.init(document.getElementById('sheet'));
 * Không phụ thuộc file nào khác, không đụng tới logic sinh đề / chấm điểm.
 */
(function(){
  'use strict';

  if(window.Scratchpad) return;

  var STYLE_ID = 'scratchpad-styles';
  var instances = [];

  var CSS_TEXT = [
    '.scratchpad-canvas{position:absolute; top:0; left:0; touch-action:none;',
    '  pointer-events:none; z-index:500; cursor:default;}',
    '.scratchpad-canvas.sp-active{pointer-events:auto; cursor:crosshair;}',
    '[data-scratchpad-active="true"]{outline:2px dashed #B08D3E; outline-offset:2px;}',
    '.sp-toolbar{position:fixed; right:16px; bottom:16px; z-index:99999;',
    '  background:#fff; border:1.5px solid #B08D3E; border-radius:18px;',
    '  box-shadow:0 10px 30px -8px rgba(0,0,0,0.35); padding:10px 12px;',
    '  display:flex; align-items:center; gap:10px; flex-wrap:wrap;',
    '  font-family:Inter,system-ui,sans-serif; max-width:min(94vw,480px);',
    '  touch-action:manipulation;}',
    '.sp-toggle-btn{display:flex; align-items:center; gap:6px; font-weight:700;',
    '  font-size:13px; border:1.5px solid #213A54; background:#213A54; color:#fff;',
    '  padding:8px 14px; border-radius:14px; cursor:pointer; white-space:nowrap;}',
    '.sp-toggle-btn.sp-off{background:#fff; color:#213A54;}',
    '.sp-toolbar-body{display:flex; align-items:center; gap:10px; flex-wrap:wrap;}',
    '.sp-toolbar.sp-collapsed .sp-toolbar-body{display:none;}',
    '.sp-swatch{width:26px; height:26px; border-radius:50%; border:2px solid transparent;',
    '  cursor:pointer; padding:0; box-shadow:inset 0 0 0 1px rgba(0,0,0,0.15);}',
    '.sp-swatch.sp-selected{border-color:#B08D3E; box-shadow:0 0 0 2px #fff, 0 0 0 4px #B08D3E;}',
    '.sp-width-btn{font-size:11.5px; font-weight:600; padding:6px 10px; border-radius:12px;',
    '  border:1.5px solid #C9C1AC; background:#fff; color:#3E3B34; cursor:pointer;}',
    '.sp-width-btn.sp-selected{border-color:#213A54; color:#213A54; background:#F3EEE1;}',
    '.sp-clear-btn{font-size:12px; font-weight:600; padding:7px 12px; border-radius:12px;',
    '  border:1.5px solid #B23A2E; background:#fff; color:#B23A2E; cursor:pointer;}',
    '.sp-clear-btn:hover{background:#FCEEEC;}',
    '@media (max-width:480px){.sp-toolbar{left:8px; right:8px; bottom:8px; justify-content:center;}}'
  ].join('\n');

  function injectStyles(){
    if(document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS_TEXT;
    document.head.appendChild(style);
  }

  var DEFAULT_COLORS = [
    { key:'blue', label:'Xanh dương', value:'#1a56db' },
    { key:'red', label:'Đỏ', value:'#c0392b' },
    { key:'pencil', label:'Bút chì', value:'#2b2b2b' }
  ];
  var DEFAULT_WIDTHS = [
    { key:'thin', label:'Mảnh', value:2 },
    { key:'medium', label:'Vừa', value:4.5 }
  ];

  function init(container, options){
    options = options || {};
    if(typeof container === 'string') container = document.querySelector(container);
    if(!container){ console.warn('Scratchpad: không tìm thấy container'); return null; }

    injectStyles();
    if(window.getComputedStyle(container).position === 'static'){
      container.style.position = 'relative';
    }

    var COLORS = options.colors || DEFAULT_COLORS;
    var WIDTHS = options.widths || DEFAULT_WIDTHS;

    var canvas = document.createElement('canvas');
    canvas.className = 'scratchpad-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    container.appendChild(canvas);
    var ctx = canvas.getContext('2d');

    var state = {
      active: false,
      color: COLORS[0].value,
      lineWidth: WIDTHS[0].value,
      strokes: [],
      currentStroke: null,
      activePointerId: null,
      cssWidth: 0,
      cssHeight: 0,
      dpr: 1
    };

    function toAbs(pt){
      return { x: pt.xr * state.cssWidth, y: pt.yr * state.cssHeight };
    }

    function strokePath(stroke){
      var pts = stroke.points;
      if(pts.length === 0) return;
      if(pts.length === 1){
        var p = toAbs(pts[0]);
        ctx.beginPath();
        ctx.fillStyle = stroke.color;
        ctx.arc(p.x, p.y, stroke.width / 2, 0, Math.PI * 2);
        ctx.fill();
        return;
      }
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      var p0 = toAbs(pts[0]);
      ctx.moveTo(p0.x, p0.y);
      for(var i = 1; i < pts.length; i++){
        var p = toAbs(pts[i]);
        ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }

    function redrawAll(){
      ctx.clearRect(0, 0, state.cssWidth, state.cssHeight);
      state.strokes.forEach(strokePath);
    }

    function resize(){
      var w = Math.max(container.scrollWidth, container.clientWidth, 1);
      var h = Math.max(container.scrollHeight, container.clientHeight, 1);
      var dpr = window.devicePixelRatio || 1;
      if(w === state.cssWidth && h === state.cssHeight && dpr === state.dpr) return;
      state.cssWidth = w;
      state.cssHeight = h;
      state.dpr = dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      redrawAll();
    }

    function relPoint(e){
      var rect = container.getBoundingClientRect();
      return {
        xr: (e.clientX - rect.left) / state.cssWidth,
        yr: (e.clientY - rect.top) / state.cssHeight
      };
    }

    function drawSegment(color, width, from, to){
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    }

    function onPointerDown(e){
      if(!state.active) return;
      if(state.activePointerId !== null) return;
      if(e.pointerType === 'mouse' && e.button !== 0) return;
      state.activePointerId = e.pointerId;
      try{ canvas.setPointerCapture(e.pointerId); }catch(err){}
      e.preventDefault();
      var pt = relPoint(e);
      state.currentStroke = { color: state.color, width: state.lineWidth, points: [pt] };
      var abs = toAbs(pt);
      ctx.beginPath();
      ctx.fillStyle = state.color;
      ctx.arc(abs.x, abs.y, state.lineWidth / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    function onPointerMove(e){
      if(state.activePointerId !== e.pointerId || !state.currentStroke) return;
      e.preventDefault();
      var events = (e.getCoalescedEvents && e.getCoalescedEvents()) || [e];
      for(var i = 0; i < events.length; i++){
        var pts = state.currentStroke.points;
        var prev = toAbs(pts[pts.length - 1]);
        var pt = relPoint(events[i]);
        pts.push(pt);
        drawSegment(state.currentStroke.color, state.currentStroke.width, prev, toAbs(pt));
      }
    }

    function endStroke(e){
      if(state.activePointerId !== e.pointerId) return;
      if(state.currentStroke && state.currentStroke.points.length){
        state.strokes.push(state.currentStroke);
      }
      state.currentStroke = null;
      state.activePointerId = null;
      try{ canvas.releasePointerCapture(e.pointerId); }catch(err){}
    }

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', endStroke);
    canvas.addEventListener('pointercancel', endStroke);
    canvas.addEventListener('contextmenu', function(e){ if(state.active) e.preventDefault(); });

    function clear(){
      state.strokes = [];
      state.currentStroke = null;
      state.activePointerId = null;
      ctx.clearRect(0, 0, state.cssWidth, state.cssHeight);
    }

    function setActive(on){
      state.active = !!on;
      canvas.classList.toggle('sp-active', state.active);
      container.setAttribute('data-scratchpad-active', state.active ? 'true' : 'false');
      toolbar.toggleBtn.textContent = state.active ? '✏️ Đang bật nháp' : '✏️ Bật nháp';
      toolbar.toggleBtn.classList.toggle('sp-off', !state.active);
    }

    function buildToolbar(){
      var bar = document.createElement('div');
      bar.className = 'sp-toolbar';

      var toggleBtn = document.createElement('button');
      toggleBtn.type = 'button';
      toggleBtn.className = 'sp-toggle-btn sp-off';
      toggleBtn.textContent = '✏️ Bật nháp';
      bar.appendChild(toggleBtn);

      var body = document.createElement('div');
      body.className = 'sp-toolbar-body';
      bar.appendChild(body);

      var swatches = COLORS.map(function(c, idx){
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'sp-swatch' + (idx === 0 ? ' sp-selected' : '');
        b.style.background = c.value;
        b.title = c.label;
        b.addEventListener('click', function(){
          state.color = c.value;
          swatches.forEach(function(s){ s.classList.remove('sp-selected'); });
          b.classList.add('sp-selected');
        });
        body.appendChild(b);
        return b;
      });

      var widthBtns = WIDTHS.map(function(w, idx){
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'sp-width-btn' + (idx === 0 ? ' sp-selected' : '');
        b.textContent = w.label;
        b.addEventListener('click', function(){
          state.lineWidth = w.value;
          widthBtns.forEach(function(x){ x.classList.remove('sp-selected'); });
          b.classList.add('sp-selected');
        });
        body.appendChild(b);
        return b;
      });

      var clearBtn = document.createElement('button');
      clearBtn.type = 'button';
      clearBtn.className = 'sp-clear-btn';
      clearBtn.textContent = '🗑 Xóa nháp';
      clearBtn.addEventListener('click', clear);
      body.appendChild(clearBtn);

      toggleBtn.addEventListener('click', function(){ setActive(!state.active); });

      document.body.appendChild(bar);
      return { bar: bar, toggleBtn: toggleBtn };
    }

    var toolbar = buildToolbar();

    var resizeObserver = null;
    if(window.ResizeObserver){
      resizeObserver = new ResizeObserver(function(){ resize(); });
      resizeObserver.observe(container);
    } else {
      window.addEventListener('resize', resize);
    }
    window.addEventListener('orientationchange', function(){ setTimeout(resize, 200); });

    resize();

    var instance = {
      clear: clear,
      enable: function(){ setActive(true); },
      disable: function(){ setActive(false); },
      toggle: function(){ setActive(!state.active); },
      destroy: function(){
        if(resizeObserver) resizeObserver.disconnect();
        else window.removeEventListener('resize', resize);
        canvas.remove();
        toolbar.bar.remove();
        var idx = instances.indexOf(instance);
        if(idx !== -1) instances.splice(idx, 1);
      }
    };
    instances.push(instance);
    return instance;
  }

  window.Scratchpad = { init: init };
  window.clearScratchpad = function(){
    instances.forEach(function(inst){ inst.clear(); });
  };
})();

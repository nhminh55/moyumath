/*
 * Scratchpad — bảng nháp dạng cột thứ 3 trong layout chia 3 cột
 * (split-pane, có thể kéo thanh resizer để đổi độ rộng), thay vì vẽ đè
 * lên đề bài hay mở cửa sổ nổi che chữ.
 *
 * Dùng: <script src="js/scratchpad.js"></script> rồi gọi
 *   Scratchpad.init(document.getElementById('sheet'));
 * `container` (vd `.sheet`) được bọc lại thành "Cột 2" trong một hàng
 * flex `.sp-split`; "Cột 1" (sidebar, nếu trang có) nằm ngoài, không bị
 * đụng tới. "Cột 3" (bảng nháp) + thanh resizer được chèn làm em kế bên
 * trong `.sp-split`. Không phụ thuộc file nào khác, không đụng tới logic
 * sinh đề / chấm điểm.
 */
(function(){
  'use strict';

  if(window.Scratchpad) return;

  var STYLE_ID = 'scratchpad-styles';
  var instances = [];
  var GRID_SIZE = 24;
  var DEFAULT_COL_PERCENT = 38; // % độ rộng cột 3 mặc định khi bật
  var STACK_BREAKPOINT = 820; // px — dưới mốc này xếp cột 3 xuống dưới
  var COL_MIN_HEIGHT = 600; // px — chiều cao tối thiểu riêng của cột bảng nháp
  var COL_VIEWPORT_OFFSET = 130; // px — trừ vào 100vh để ước lượng phần header/lề phía trên

  var CSS_TEXT = [
    /* nút bật/tắt — tab nhô lên góc trên khung bài tập */
    '.sp-toggle-btn{position:absolute; top:-17px; right:28px; z-index:80;',
    '  display:inline-flex; align-items:center; gap:6px; font-family:Inter,system-ui,sans-serif;',
    '  font-size:13px; font-weight:700; color:#213A54; background:#fff;',
    '  border:1.5px solid #B08D3E; border-radius:14px 14px 5px 5px; padding:8px 14px 7px;',
    '  box-shadow:0 6px 14px -6px rgba(0,0,0,0.35); cursor:pointer;}',
    '.sp-toggle-btn:hover{background:#F7F1DE;}',
    '.sp-toggle-btn.sp-on{background:#213A54; color:#fff;}',
    '@media (max-width:480px){.sp-toggle-btn{right:12px; font-size:12px; padding:7px 10px 6px;}}',

    /* hàng chia 3 cột — cột giữa (đề bài) và cột phải (nháp) có chiều cao
       ĐỘC LẬP với nhau: align-items:flex-start để không đứa nào bị kéo
       giãn theo đứa còn lại. */
    '.sp-split{display:flex; align-items:flex-start; justify-content:center; width:100%; gap:0;}',
    /* cột giữa — chỉ ôm vừa nội dung câu hỏi, không kéo dài theo cột nháp */
    '.sp-main{flex:1 1 0%; min-width:0; align-self:flex-start; height:auto;}',

    /* thanh resizer */
    '.sp-resizer{flex:0 0 auto; width:14px; align-self:stretch; cursor:col-resize;',
    '  touch-action:none; position:relative; background:transparent;}',
    '.sp-resizer::before{content:""; position:absolute; left:50%; top:6%; bottom:6%; width:3px;',
    '  transform:translateX(-50%); background:#C9C1AC; border-radius:3px;}',
    '.sp-resizer:hover::before, .sp-resizer.sp-dragging::before{background:#B08D3E;}',
    '.sp-split.sp-off .sp-resizer, .sp-split.sp-off .sp-col{display:none;}',

    /* cột 3 — bảng nháp: chiều cao riêng, kéo dài gần hết chiều cao màn
       hình bất kể cột giữa ngắn hay dài */
    '.sp-col{flex:0 0 auto; width:' + DEFAULT_COL_PERCENT + '%; min-width:240px; max-width:60%;',
    '  height:calc(100vh - ' + COL_VIEWPORT_OFFSET + 'px); min-height:' + COL_MIN_HEIGHT + 'px;',
    '  align-self:flex-start; display:flex; flex-direction:column; background:#fff;',
    '  border:1px solid #E7E2D3; border-radius:12px; overflow:hidden;',
    '  box-shadow:0 10px 26px -16px rgba(33,58,84,0.4);}',
    '.sp-toolbar{display:flex; align-items:center; gap:6px; flex-wrap:wrap; padding:8px 10px;',
    '  background:#FBF9F3; border-bottom:1px solid #E7E2D3; font-family:Inter,system-ui,sans-serif;}',
    '.sp-toolbar-label{font-weight:700; font-size:12.5px; color:#213A54; margin-right:2px; white-space:nowrap;}',
    '.sp-tool-group{display:flex; align-items:center; gap:6px;}',
    '.sp-tool-sep{width:1px; align-self:stretch; margin:2px 2px; background:#E0DACB; flex:none;}',
    '.sp-icon-btn{width:28px; height:28px; border-radius:50%; border:2px solid transparent; padding:0;',
    '  cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:14px;',
    '  line-height:1; background:#fff; color:#3E3B34; box-shadow:inset 0 0 0 1px rgba(0,0,0,0.15); flex:none;}',
    '.sp-icon-btn.sp-selected{border-color:#B08D3E; box-shadow:0 0 0 2px #fff, 0 0 0 3px #B08D3E;}',
    '.sp-icon-btn.sp-eraser-btn.sp-selected{background:#EFE9D8;}',
    '.sp-icon-btn.sp-clear-btn{margin-left:auto; color:#B23A2E; box-shadow:inset 0 0 0 1.5px #E3A9A0;}',
    '.sp-icon-btn.sp-clear-btn:hover{background:#FCEEEC;}',
    '.sp-canvas-wrap{position:relative; flex:1; min-height:160px; overflow:hidden; background-color:#fff;',
    '  background-image:linear-gradient(rgba(70,110,150,0.14) 1px, transparent 1px),',
    '    linear-gradient(90deg, rgba(70,110,150,0.14) 1px, transparent 1px);',
    '  background-size:' + GRID_SIZE + 'px ' + GRID_SIZE + 'px;}',
    '.sp-canvas{position:absolute; inset:0; display:block; touch-action:none; cursor:crosshair; height:100%;}',

    /* màn hình hẹp (tablet đứng / điện thoại): xếp cột 3 xuống dưới */
    '@media (max-width:' + STACK_BREAKPOINT + 'px){',
    '  .sp-split{flex-direction:column;}',
    '  .sp-resizer{width:100%; height:16px; align-self:stretch; cursor:row-resize;}',
    '  .sp-resizer::before{left:10%; right:10%; top:50%; bottom:auto; width:auto; height:3px;',
    '    transform:translateY(-50%);}',
    '  .sp-col{width:100% !important; max-width:none; height:280px; min-width:0; min-height:180px;',
    '    max-height:60vh;}',
    '}'
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
    { key:'thin', label:'•', title:'Nét mảnh', value:2, iconSize:14 },
    { key:'medium', label:'●', title:'Nét vừa', value:4.5, iconSize:19 }
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

    var state = {
      tool: 'pen',
      color: COLORS[0].value,
      lineWidth: WIDTHS[0].value,
      strokes: [],
      currentStroke: null,
      activePointerId: null,
      cssWidth: 0,
      cssHeight: 0,
      dpr: 1,
      open: false
    };

    /* ---------- bọc container thành "Cột 2" trong hàng sp-split ---------- */
    var parent = container.parentNode;
    var split = document.createElement('div');
    split.className = 'sp-split sp-off';
    parent.insertBefore(split, container);
    split.appendChild(container);
    container.classList.add('sp-main');

    var resizer = document.createElement('div');
    resizer.className = 'sp-resizer';
    resizer.setAttribute('role', 'separator');
    resizer.setAttribute('aria-label', 'Kéo để đổi độ rộng bảng nháp');
    split.appendChild(resizer);

    var col = document.createElement('div');
    col.className = 'sp-col';
    split.appendChild(col);

    var toolbar = document.createElement('div');
    toolbar.className = 'sp-toolbar';
    var label = document.createElement('span');
    label.className = 'sp-toolbar-label';
    label.textContent = '📝 Nháp';
    toolbar.appendChild(label);

    var toolGroupPen = document.createElement('div');
    toolGroupPen.className = 'sp-tool-group';
    toolbar.appendChild(toolGroupPen);

    var swatches = COLORS.map(function(c){
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'sp-icon-btn sp-swatch';
      b.style.background = c.value;
      b.title = c.label;
      toolGroupPen.appendChild(b);
      return b;
    });

    var eraserBtn = document.createElement('button');
    eraserBtn.type = 'button';
    eraserBtn.className = 'sp-icon-btn sp-eraser-btn';
    eraserBtn.title = 'Cục gôm — xóa nét đã vẽ';
    eraserBtn.textContent = '🧹';
    toolGroupPen.appendChild(eraserBtn);

    function refreshToolSelection(){
      swatches.forEach(function(s, idx){
        s.classList.toggle('sp-selected', state.tool === 'pen' && state.color === COLORS[idx].value);
      });
      eraserBtn.classList.toggle('sp-selected', state.tool === 'eraser');
    }
    swatches.forEach(function(b, idx){
      b.addEventListener('click', function(){
        state.tool = 'pen';
        state.color = COLORS[idx].value;
        refreshToolSelection();
      });
    });
    eraserBtn.addEventListener('click', function(){
      state.tool = 'eraser';
      refreshToolSelection();
    });

    var sep1 = document.createElement('div');
    sep1.className = 'sp-tool-sep';
    toolbar.appendChild(sep1);

    var toolGroupWidth = document.createElement('div');
    toolGroupWidth.className = 'sp-tool-group';
    toolbar.appendChild(toolGroupWidth);

    var widthBtns = WIDTHS.map(function(w, idx){
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'sp-icon-btn sp-width-btn' + (idx === 0 ? ' sp-selected' : '');
      b.textContent = w.label;
      if(w.iconSize) b.style.fontSize = w.iconSize + 'px';
      b.title = w.title || w.label;
      b.addEventListener('click', function(){
        state.lineWidth = w.value;
        widthBtns.forEach(function(x){ x.classList.remove('sp-selected'); });
        b.classList.add('sp-selected');
      });
      toolGroupWidth.appendChild(b);
      return b;
    });

    var clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'sp-icon-btn sp-clear-btn';
    clearBtn.title = 'Xóa hết nét vẽ';
    clearBtn.textContent = '🗑️';
    toolbar.appendChild(clearBtn);

    col.appendChild(toolbar);
    refreshToolSelection();

    var canvasWrap = document.createElement('div');
    canvasWrap.className = 'sp-canvas-wrap';
    var canvas = document.createElement('canvas');
    canvas.className = 'sp-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    canvasWrap.appendChild(canvas);
    col.appendChild(canvasWrap);

    var toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'sp-toggle-btn';
    toggleBtn.textContent = '📝 Bảng nháp';
    container.appendChild(toggleBtn);

    var ctx = canvas.getContext('2d');

    /* ---------- vẽ — lưu nét theo toạ độ tỉ lệ 0..1 để resize không méo ---------- */
    function toAbs(pt){
      return { x: pt.xr * state.cssWidth, y: pt.yr * state.cssHeight };
    }

    function strokePath(stroke){
      var pts = stroke.points;
      if(pts.length === 0) return;
      ctx.globalCompositeOperation = stroke.composite || 'source-over';
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
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, state.cssWidth, state.cssHeight);
      state.strokes.forEach(strokePath);
      ctx.globalCompositeOperation = 'source-over';
    }

    // Gọi lại mỗi khi khung vẽ đổi kích thước (kéo resizer, bật/tắt cột,
    // xoay màn hình...). Nét vẽ được lưu theo toạ độ tỉ lệ 0..1 nên chỉ
    // cần vẽ lại là vừa khít, không cần backup bitmap và không bị méo.
    function resizeCanvas(){
      var w = Math.max(canvasWrap.clientWidth, 1);
      var h = Math.max(canvasWrap.clientHeight, 1);
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
      var rect = canvasWrap.getBoundingClientRect();
      return {
        xr: (e.clientX - rect.left) / state.cssWidth,
        yr: (e.clientY - rect.top) / state.cssHeight
      };
    }

    function drawSegment(color, width, from, to, composite){
      ctx.globalCompositeOperation = composite || 'source-over';
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
      if(state.activePointerId !== null) return;
      if(e.pointerType === 'mouse' && e.button !== 0) return;
      state.activePointerId = e.pointerId;
      try{ canvas.setPointerCapture(e.pointerId); }catch(err){}
      e.preventDefault();
      var pt = relPoint(e);
      var isEraser = state.tool === 'eraser';
      var composite = isEraser ? 'destination-out' : 'source-over';
      var color = isEraser ? '#000000' : state.color;
      state.currentStroke = { color: color, width: state.lineWidth, composite: composite, points: [pt] };
      var abs = toAbs(pt);
      ctx.globalCompositeOperation = composite;
      ctx.beginPath();
      ctx.fillStyle = color;
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
        drawSegment(state.currentStroke.color, state.currentStroke.width, prev, toAbs(pt), state.currentStroke.composite);
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
    canvas.addEventListener('contextmenu', function(e){ e.preventDefault(); });

    function clear(){
      state.strokes = [];
      state.currentStroke = null;
      state.activePointerId = null;
      ctx.clearRect(0, 0, state.cssWidth, state.cssHeight);
    }
    clearBtn.addEventListener('click', clear);

    /* ---------- theo dõi kích thước khung vẽ để tự resize canvas ---------- */
    var resizeObserver = null;
    if(window.ResizeObserver){
      resizeObserver = new ResizeObserver(function(){ resizeCanvas(); });
      resizeObserver.observe(canvasWrap);
    } else {
      window.addEventListener('resize', resizeCanvas);
    }
    window.addEventListener('orientationchange', function(){ setTimeout(resizeCanvas, 200); });

    /* ---------- bật / tắt cột 3 ---------- */
    function open(){
      state.open = true;
      split.classList.remove('sp-off');
      toggleBtn.classList.add('sp-on');
      requestAnimationFrame(resizeCanvas);
    }
    function close(){
      state.open = false;
      split.classList.add('sp-off');
      toggleBtn.classList.remove('sp-on');
    }
    function toggle(){ state.open ? close() : open(); }
    toggleBtn.addEventListener('click', toggle);

    /* ---------- kéo thanh resizer (chuột + Pointer Events cho bút cảm ứng) ---------- */
    var dragPointerId = null;

    function isStacked(){
      return window.getComputedStyle(split).flexDirection.indexOf('column') === 0;
    }

    function onResizerDown(e){
      if(dragPointerId !== null) return;
      dragPointerId = e.pointerId;
      resizer.classList.add('sp-dragging');
      try{ resizer.setPointerCapture(e.pointerId); }catch(err){}
      e.preventDefault();
    }
    function onResizerMove(e){
      if(dragPointerId !== e.pointerId) return;
      e.preventDefault();
      var splitRect = split.getBoundingClientRect();
      if(isStacked()){
        var newHeight = splitRect.bottom - e.clientY;
        var minH = 160, maxH = splitRect.height * 0.7;
        newHeight = Math.min(Math.max(newHeight, minH), maxH);
        col.style.height = newHeight + 'px';
      } else {
        var newWidth = splitRect.right - e.clientX;
        var minW = 240, maxW = splitRect.width * 0.6;
        newWidth = Math.min(Math.max(newWidth, minW), maxW);
        col.style.width = newWidth + 'px';
      }
    }
    function onResizerUp(e){
      if(dragPointerId !== e.pointerId) return;
      dragPointerId = null;
      resizer.classList.remove('sp-dragging');
      try{ resizer.releasePointerCapture(e.pointerId); }catch(err){}
    }
    resizer.addEventListener('pointerdown', onResizerDown);
    resizer.addEventListener('pointermove', onResizerMove);
    resizer.addEventListener('pointerup', onResizerUp);
    resizer.addEventListener('pointercancel', onResizerUp);

    var instance = {
      open: open,
      close: close,
      toggle: toggle,
      clear: clear,
      enable: open,
      disable: close,
      destroy: function(){
        if(resizeObserver) resizeObserver.disconnect();
        else window.removeEventListener('resize', resizeCanvas);
        parent.insertBefore(container, split);
        container.classList.remove('sp-main');
        toggleBtn.remove();
        split.remove();
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

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
  var EXTRA_HEIGHT_STEP = 500; // px — mỗi lần bấm "Thêm chỗ nháp" cộng thêm bấy nhiêu

  var CSS_TEXT = [
    /* nút bật/tắt — tab nhô lên góc trên khung bài tập */
    '.sp-toggle-btn{position:absolute; top:-17px; right:28px; z-index:80;',
    '  display:inline-flex; align-items:center; gap:6px; font-family:Inter,system-ui,sans-serif;',
    '  font-size:13px; font-weight:700; color:#213A54; background:#fff;',
    '  border:1.5px solid #B08D3E; border-radius:14px 14px 5px 5px; padding:8px 14px 7px;',
    '  box-shadow:0 6px 14px -6px rgba(0,0,0,0.35); cursor:pointer;}',
    '.sp-toggle-btn:hover{background:#F7F1DE;}',
    /* bảng nháp đang mở thì ẩn nút — đóng bằng nút × trên thanh tiêu đề */
    '.sp-toggle-btn.sp-on{display:none;}',
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
    '  transform:translateX(-50%); background:#D1D5DB; border-radius:3px; transition:background .15s;}',
    '.sp-resizer:hover::before, .sp-resizer.sp-dragging::before{background:#6366F1;}',
    '.sp-split.sp-off .sp-resizer, .sp-split.sp-off .sp-col{display:none;}',

    /* cột 3 — bảng nháp: chiều cao riêng, kéo dài gần hết chiều cao màn
       hình bất kể cột giữa ngắn hay dài. Luôn là giấy sáng (như tờ đề).
       Trên xuống: thanh tiêu đề gọn · giấy kẻ ô · thanh công cụ một hàng. */
    '.sp-col{position:relative; flex:0 0 auto; width:' + DEFAULT_COL_PERCENT + '%; min-width:240px; max-width:60%;',
    '  height:calc(100vh - ' + COL_VIEWPORT_OFFSET + 'px); min-height:' + COL_MIN_HEIGHT + 'px;',
    '  align-self:flex-start; display:flex; flex-direction:column; background:#fff; color:#374151;',
    '  border:1px solid #E5E7EB; border-radius:16px; overflow:hidden; container-type:inline-size;',
    '  font-family:Inter,system-ui,sans-serif; box-shadow:0 1px 2px rgba(16,24,40,.04), 0 2px 8px rgba(16,24,40,.04);}',
    '.sp-head{flex:none; display:flex; align-items:center; gap:8px; height:40px; padding:0 6px 0 14px;',
    '  border-bottom:1px solid #EEF0F3;}',
    '.sp-title{flex:1; min-width:0; font:600 13.5px "Be Vietnam Pro",Inter,system-ui,sans-serif; color:#111827;',
    '  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;}',
    '.sp-toolbar{flex:none; position:relative; display:flex; align-items:center; gap:2px; padding:5px 6px;',
    '  border-top:1px solid #EEF0F3; background:#fff;}',
    '.sp-tool-sep{width:1px; height:18px; margin:0 4px; background:#E5E7EB; flex:none;}',
    '.sp-spacer{flex:1; min-width:0;}',
    '.sp-btn{width:30px; height:30px; flex:none; display:grid; place-items:center; padding:0; border:0;',
    '  border-radius:8px; background:transparent; color:#636A76; cursor:pointer;',
    '  transition:background .12s, color .12s;}',
    '.sp-btn:hover:not(:disabled){background:#F4F5F9; color:#111827;}',
    '.sp-btn:disabled{opacity:.35; cursor:default;}',
    '.sp-btn:focus-visible{outline:2px solid #6366F1; outline-offset:1px;}',
    '.sp-btn.sp-selected{background:#EEF0FF; color:#4F46E5;}',
    '.sp-btn.sp-clear-btn:hover{background:#FEF2F2; color:#DC2626;}',
    '.sp-btn svg{width:18px; height:18px; fill:none; stroke:currentColor; stroke-width:1.8;',
    '  stroke-linecap:round; stroke-linejoin:round;}',
    '.sp-close svg{width:16px; height:16px;}',
    /* chấm màu hiện tại — bấm để mở bảng chọn màu + độ dày nét */
    '.sp-dot{display:block; width:14px; height:14px; border-radius:50%; box-shadow:0 0 0 2px #fff, 0 0 0 3px #D1D5DB;}',
    '.sp-color-btn[aria-expanded="true"]{background:#F4F5F9;}',
    '.sp-pop{position:absolute; bottom:calc(100% + 6px); z-index:2; display:flex; flex-direction:column; gap:6px;',
    '  padding:8px; background:#fff; border:1px solid #E5E7EB; border-radius:12px;',
    '  box-shadow:0 4px 16px rgba(16,24,40,.08);}',
    '.sp-pop[hidden]{display:none;}',
    '.sp-pop-row{display:flex; align-items:center; gap:4px;}',
    '.sp-pop-row + .sp-pop-row{padding-top:6px; border-top:1px solid #EEF0F3;}',
    '.sp-pop .sp-btn.sp-selected .sp-dot{box-shadow:0 0 0 2px #fff, 0 0 0 3.5px #6366F1;}',
    '.sp-width-dot{display:block; border-radius:50%; background:currentColor;}',
    /* bảng nháp hẹp: nút nhỏ lại để thanh công cụ vẫn nằm gọn một hàng */
    '@container (max-width:270px){.sp-toolbar .sp-btn{width:27px;} .sp-tool-sep{margin:0 2px;}}',
    /* khung cuộn của bảng nháp — canvas bên trong có thể cao hơn khung
       nhìn thấy được (sau khi bấm "Thêm chỗ nháp"), cuộn dọc để xem hết */
    '.sp-canvas-wrap{flex:1; min-height:160px; overflow-y:auto; overflow-x:hidden;',
    '  position:relative; background-color:#fff; scrollbar-width:thin;',
    '  scrollbar-color:#D1D5DB transparent;}',
    '.sp-canvas-wrap::-webkit-scrollbar{width:9px;}',
    '.sp-canvas-wrap::-webkit-scrollbar-track{background:transparent;}',
    '.sp-canvas-wrap::-webkit-scrollbar-thumb{background:#D1D5DB; border-radius:5px;',
    '  border:2px solid transparent; background-clip:padding-box;}',
    '.sp-canvas-wrap::-webkit-scrollbar-thumb:hover{background:#9CA3AF; background-clip:padding-box;}',
    /* giấy kẻ ô thật nhạt — nét chữ của bé mới là thứ nổi bật */
    '.sp-canvas{display:block; width:100%; touch-action:none; cursor:crosshair; background-color:#fff;',
    '  background-image:linear-gradient(rgba(99,110,140,0.075) 1px, transparent 1px),',
    '    linear-gradient(90deg, rgba(99,110,140,0.075) 1px, transparent 1px);',
    '  background-size:' + GRID_SIZE + 'px ' + GRID_SIZE + 'px;}',

    /* màn hình hẹp (tablet đứng / điện thoại): xếp cột 3 xuống dưới */
    '@media (max-width:' + STACK_BREAKPOINT + 'px){',
    '  .sp-split{flex-direction:column;}',
    '  .sp-resizer{width:100%; height:16px; align-self:stretch; cursor:row-resize;}',
    '  .sp-resizer::before{left:10%; right:10%; top:50%; bottom:auto; width:auto; height:3px;',
    '    transform:translateY(-50%);}',
    '  .sp-col{width:100% !important; max-width:none; height:340px; min-width:0; min-height:220px;',
    '    max-height:60vh;}',
    '  .sp-toolbar .sp-btn{width:34px; height:34px;}',
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
      undoStack: [], // các bản chụp `strokes` trước mỗi thao tác (vẽ một nét / xóa hết)
      redoStack: [],
      currentStroke: null,
      activePointerId: null,
      cssWidth: 0,
      cssHeight: 0,
      baseHeight: 0, // px — chiều cao khung nhìn thấy (đo từ .sp-canvas-wrap)
      extraHeight: 0, // px — phần "nháp thêm" cộng dồn qua nút ➕
      dpr: 1,
      open: false,
      // Theo dõi nhiều pointer cùng lúc để phân biệt: 1 ngón/bút = vẽ,
      // 2 ngón = cuộn trang (không vẽ lem).
      activePointers: new Map(),
      scrollGesture: false,
      scrollLastY: 0
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

    /* ---------- thanh tiêu đề · giấy nháp · thanh công cụ (dưới cùng) ---------- */
    function iconBtn(cls, title, svg){
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'sp-btn ' + cls;
      b.title = title;
      b.setAttribute('aria-label', title);
      b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + svg + '</svg>';
      return b;
    }
    function el(tag, cls){
      var n = document.createElement(tag);
      n.className = cls;
      return n;
    }

    var head = el('div', 'sp-head');
    var title = el('span', 'sp-title');
    title.textContent = '📝 Bảng nháp';
    head.appendChild(title);
    var closeBtn = iconBtn('sp-close', 'Đóng bảng nháp', '<path d="M6 6l12 12M18 6 6 18"/>');
    head.appendChild(closeBtn);
    col.appendChild(head);

    var canvasWrap = el('div', 'sp-canvas-wrap');
    var canvas = el('canvas', 'sp-canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvasWrap.appendChild(canvas);
    col.appendChild(canvasWrap);

    var toolbar = el('div', 'sp-toolbar');
    var penBtn = iconBtn('sp-pen-btn', 'Bút', '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>');
    var eraserBtn = iconBtn('sp-eraser-btn', 'Cục gôm — xóa nét đã vẽ',
      '<path d="M8.5 20 4 15.5a1.5 1.5 0 0 1 0-2.1l9.4-9.4a1.5 1.5 0 0 1 2.1 0l4.5 4.5a1.5 1.5 0 0 1 0 2.1L11 20z"/><path d="M11 20h9"/><path d="m8.5 9 6.5 6.5"/>');
    var colorBtn = el('button', 'sp-btn sp-color-btn');
    colorBtn.type = 'button';
    colorBtn.title = 'Màu và độ dày nét';
    colorBtn.setAttribute('aria-label', colorBtn.title);
    colorBtn.setAttribute('aria-haspopup', 'true');
    colorBtn.setAttribute('aria-expanded', 'false');
    var colorDot = el('span', 'sp-dot');
    colorBtn.appendChild(colorDot);
    var undoBtn = iconBtn('sp-undo-btn', 'Hoàn tác', '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>');
    var redoBtn = iconBtn('sp-redo-btn', 'Làm lại', '<path d="m15 14 5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/>');
    var addSpaceBtn = iconBtn('sp-addspace-btn', 'Thêm chỗ nháp (+' + EXTRA_HEIGHT_STEP + 'px)',
      '<path d="M5 20h14"/><path d="M12 4v11M7.5 10.5 12 15l4.5-4.5"/>');
    var clearBtn = iconBtn('sp-clear-btn', 'Xóa hết nét vẽ',
      '<path d="M4 7h16"/><path d="M10 11v6M14 11v6"/><path d="m6 7 1 13h10l1-13"/><path d="M9 7V4h6v3"/>');
    [penBtn, eraserBtn, colorBtn, el('span', 'sp-tool-sep'), undoBtn, redoBtn, el('span', 'sp-spacer'), addSpaceBtn, clearBtn]
      .forEach(function(n){ toolbar.appendChild(n); });

    // bảng chọn màu + độ dày nét — mở từ chấm màu, nổi phía trên thanh công cụ
    var pop = el('div', 'sp-pop');
    pop.hidden = true;
    var colorRow = el('div', 'sp-pop-row');
    var widthRow = el('div', 'sp-pop-row');
    pop.appendChild(colorRow);
    pop.appendChild(widthRow);
    toolbar.appendChild(pop);

    var swatches = COLORS.map(function(c){
      var b = el('button', 'sp-btn sp-swatch');
      b.type = 'button';
      b.title = c.label;
      b.setAttribute('aria-label', c.label);
      var dot = el('span', 'sp-dot');
      dot.style.background = c.value;
      b.appendChild(dot);
      b.addEventListener('click', function(){
        state.tool = 'pen';
        state.color = c.value;
        refreshToolSelection();
        closePop();
      });
      colorRow.appendChild(b);
      return b;
    });
    var widthBtns = WIDTHS.map(function(w){
      var b = el('button', 'sp-btn sp-width-btn');
      b.type = 'button';
      b.title = w.title || w.label;
      b.setAttribute('aria-label', b.title);
      var dot = el('span', 'sp-width-dot');
      dot.style.width = dot.style.height = Math.round(w.value * 1.6 + 2) + 'px';
      b.appendChild(dot);
      b.addEventListener('click', function(){
        state.lineWidth = w.value;
        refreshToolSelection();
        closePop();
      });
      widthRow.appendChild(b);
      return b;
    });

    function refreshToolSelection(){
      penBtn.classList.toggle('sp-selected', state.tool === 'pen');
      eraserBtn.classList.toggle('sp-selected', state.tool === 'eraser');
      penBtn.setAttribute('aria-pressed', String(state.tool === 'pen'));
      eraserBtn.setAttribute('aria-pressed', String(state.tool === 'eraser'));
      colorDot.style.background = state.color;
      swatches.forEach(function(s, idx){ s.classList.toggle('sp-selected', state.color === COLORS[idx].value); });
      widthBtns.forEach(function(b, idx){ b.classList.toggle('sp-selected', state.lineWidth === WIDTHS[idx].value); });
    }
    function openPop(){
      pop.hidden = false;
      pop.style.left = Math.max(colorBtn.offsetLeft - 8, 4) + 'px';
      colorBtn.setAttribute('aria-expanded', 'true');
    }
    function closePop(){
      pop.hidden = true;
      colorBtn.setAttribute('aria-expanded', 'false');
    }
    penBtn.addEventListener('click', function(){ state.tool = 'pen'; refreshToolSelection(); });
    eraserBtn.addEventListener('click', function(){ state.tool = 'eraser'; refreshToolSelection(); });
    colorBtn.addEventListener('click', function(){ pop.hidden ? openPop() : closePop(); });
    document.addEventListener('pointerdown', function(e){
      if(!pop.hidden && !pop.contains(e.target) && !colorBtn.contains(e.target)) closePop();
    });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && !pop.hidden) closePop(); });

    col.appendChild(toolbar);
    refreshToolSelection();

    var toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'sp-toggle-btn';
    toggleBtn.textContent = '📝 Bảng nháp';
    container.appendChild(toggleBtn);

    var ctx = canvas.getContext('2d');

    /* ---------- vẽ ---------- */
    // Toạ độ lưu theo pixel TUYỆT ĐỐI như trên giấy thật: kéo resizer cho
    // cột rộng ra thì lộ thêm giấy, hẹp lại thì phần bên phải tạm khuất
    // (vẫn còn nguyên) — nét chữ không bị kéo giãn hay bóp méo. Bấm "Thêm
    // chỗ nháp" chỉ nối thêm giấy trắng ở dưới, nét cũ đứng yên chỗ cũ.
    function toAbs(pt){
      return { x: pt.x, y: pt.yAbs };
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
    // xoay màn hình, hoặc bấm "➕ Thêm chỗ nháp"). Chiều rộng luôn khớp
    // đúng khung nhìn thấy (`.sp-canvas-wrap`); chiều cao = chiều cao
    // khung nhìn thấy + phần đã "thêm chỗ nháp" (có thể cao hơn khung
    // nhìn thấy nhiều, phần dư cuộn dọc để xem). Nét vẽ lưu theo toạ độ
    // tuyệt đối nên vẽ lại là vừa khít, không cần backup bitmap và không
    // bị méo hay dịch chỗ.
    function resizeCanvas(){
      var w = Math.max(canvasWrap.clientWidth, 1);
      state.baseHeight = Math.max(canvasWrap.clientHeight, 1);
      var h = Math.max(state.baseHeight + state.extraHeight, 1);
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
      // Dùng bounding rect của chính canvas (không phải khung cuộn ngoài)
      // nên tự động đúng toạ độ dù đang cuộn tới đâu — không cần cộng
      // thêm scrollTop thủ công.
      var rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        yAbs: e.clientY - rect.top
      };
    }

    function addSpace(){
      state.extraHeight += EXTRA_HEIGHT_STEP;
      resizeCanvas();
      canvasWrap.scrollTo({ top: canvasWrap.scrollHeight, behavior: 'smooth' });
    }
    addSpaceBtn.addEventListener('click', addSpace);

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

    // Trung bình toạ độ Y các ngón tay đang chạm — dùng để tính khoảng
    // cuộn khi phát hiện cử chỉ 2 ngón.
    function averageTouchY(){
      var sum = 0, n = 0;
      state.activePointers.forEach(function(p){
        if(p.type === 'touch'){ sum += p.y; n++; }
      });
      return n ? sum / n : 0;
    }

    function cancelCurrentStroke(){
      if(state.activePointerId !== null){
        try{ canvas.releasePointerCapture(state.activePointerId); }catch(err){}
      }
      state.currentStroke = null;
      state.activePointerId = null;
      redrawAll(); // xoá luôn vệt lem lỡ vẽ trước khi phát hiện ngón thứ 2
    }

    function beginDraw(e){
      state.activePointerId = e.pointerId;
      try{ canvas.setPointerCapture(e.pointerId); }catch(err){}
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

    // Bút (Apple Pencil/S-Pen) hoặc giữ chuột trái luôn luôn vẽ. Chạm 1
    // ngón tay cũng vẽ (để bé không có bút vẫn dùng được), nhưng ngay khi
    // ngón tay thứ 2 chạm vào, chuyển hẳn sang cử chỉ CUỘN (huỷ nét lỡ vẽ)
    // — nhờ vậy dùng 2 ngón cuộn trang không bị quẹt mực lung tung. Thanh
    // cuộn dọc bên phải hoạt động độc lập, không đi qua canvas nên không
    // ảnh hưởng.
    function onPointerDown(e){
      state.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY, type: e.pointerType });

      if(state.scrollGesture){
        e.preventDefault();
        return;
      }

      if(state.activePointers.size >= 2 && e.pointerType === 'touch'){
        if(state.currentStroke) cancelCurrentStroke();
        state.scrollGesture = true;
        state.scrollLastY = averageTouchY();
        e.preventDefault();
        return;
      }

      if(state.activePointerId !== null) return;
      if(e.pointerType === 'mouse' && e.button !== 0) return;
      e.preventDefault();
      beginDraw(e);
    }

    function onPointerMove(e){
      if(state.activePointers.has(e.pointerId)){
        state.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY, type: e.pointerType });
      }

      if(state.scrollGesture){
        if(e.pointerType !== 'touch') return;
        e.preventDefault();
        var y = averageTouchY();
        canvasWrap.scrollTop -= (y - state.scrollLastY);
        state.scrollLastY = y;
        return;
      }

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
      state.activePointers.delete(e.pointerId);

      if(state.activePointerId === e.pointerId){
        if(state.currentStroke && state.currentStroke.points.length){
          commit(state.strokes.concat([state.currentStroke]));
        }
        state.currentStroke = null;
        state.activePointerId = null;
        try{ canvas.releasePointerCapture(e.pointerId); }catch(err){}
      }

      if(state.activePointers.size === 0) state.scrollGesture = false;
    }

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', endStroke);
    canvas.addEventListener('pointercancel', endStroke);
    canvas.addEventListener('contextmenu', function(e){ e.preventDefault(); });

    /* ---------- hoàn tác / làm lại / xóa hết ---------- */
    var HISTORY_LIMIT = 100;
    function refreshHistoryButtons(){
      undoBtn.disabled = state.undoStack.length === 0;
      redoBtn.disabled = state.redoStack.length === 0;
    }
    // Mỗi thao tác thay cả mảng `strokes` (nét đã vẽ thì không đổi nữa nên
    // bản chụp chỉ là mảng tham chiếu, rẻ).
    function commit(strokes){
      state.undoStack.push(state.strokes);
      if(state.undoStack.length > HISTORY_LIMIT) state.undoStack.shift();
      state.redoStack = [];
      state.strokes = strokes;
      refreshHistoryButtons();
    }
    function step(from, to){
      if(!from.length || state.currentStroke) return;
      to.push(state.strokes);
      state.strokes = from.pop();
      redrawAll();
      refreshHistoryButtons();
    }
    undoBtn.addEventListener('click', function(){ step(state.undoStack, state.redoStack); });
    redoBtn.addEventListener('click', function(){ step(state.redoStack, state.undoStack); });
    // nút 🗑 — xóa hết nhưng vẫn hoàn tác được
    clearBtn.addEventListener('click', function(){
      if(!state.strokes.length) return;
      commit([]);
      redrawAll();
    });
    // xóa sạch cả lịch sử — khi trang ra câu mới (window.clearScratchpad)
    function clear(){
      state.strokes = [];
      state.undoStack = [];
      state.redoStack = [];
      state.currentStroke = null;
      state.activePointerId = null;
      ctx.clearRect(0, 0, state.cssWidth, state.cssHeight);
      refreshHistoryButtons();
    }
    refreshHistoryButtons();

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
      var hadFocus = col.contains(document.activeElement);
      split.classList.add('sp-off');
      toggleBtn.classList.remove('sp-on');
      if(hadFocus) toggleBtn.focus(); // nút × vừa biến mất → trả focus về nút mở
      closePop();
    }
    function toggle(){ state.open ? close() : open(); }
    toggleBtn.addEventListener('click', toggle);
    closeBtn.addEventListener('click', close);

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
        var minH = 220, maxH = splitRect.height * 0.7;
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

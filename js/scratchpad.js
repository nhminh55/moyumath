/*
 * Scratchpad — bảng nháp dạng cột thứ 3 trong layout chia 3 cột
 * (split-pane, có thể kéo thanh resizer để đổi độ rộng), thay vì vẽ đè
 * lên đề bài hay mở cửa sổ nổi che chữ. Màn hẹp (điện thoại, iPad dọc):
 * bảng nháp là tấm trượt từ đáy màn hình (bottom sheet) đè lên trang, đề
 * bài vẫn cuộn được ở phía trên; kéo thanh tiêu đề để đổi chiều cao.
 *
 * Dùng: <script src="js/scratchpad.js"></script> rồi gọi
 *   Scratchpad.init(document.getElementById('sheet'));
 * `container` (vd `.sheet`) được bọc lại thành "Cột 2" trong một hàng
 * flex `.sp-split`; "Cột 1" (sidebar, nếu trang có) nằm ngoài, không bị
 * đụng tới. "Cột 3" (bảng nháp) + thanh resizer được chèn làm em kế bên
 * trong `.sp-split`. Không phụ thuộc file nào khác, không đụng tới logic
 * sinh đề / chấm điểm. Bật/tắt bắn sự kiện `scratchpad:toggle`
 * ({detail:{open}}) lên `container`; trạng thái mở, độ rộng, chiều cao
 * tấm trượt được nhớ trong localStorage (`moyumath_scratchpad`).
 */
(function(){
  'use strict';

  if(window.Scratchpad) return;

  var STYLE_ID = 'scratchpad-styles';
  var instances = [];
  var GRID_SIZE = 24;
  var DEFAULT_COL_PERCENT = 38; // % độ rộng cột 3 mặc định khi bật
  var SHEET_BREAKPOINT = 820; // px — dưới mốc này bảng nháp là tấm trượt từ đáy
  var SHEET_DEFAULT = 0.45; // tỉ lệ chiều cao màn hình của tấm trượt khi mở lần đầu
  var COL_MIN_HEIGHT = 600; // px — chiều cao tối thiểu riêng của cột bảng nháp
  var COL_VIEWPORT_OFFSET = 130; // px — trừ vào 100vh để ước lượng phần header/lề phía trên
  var EXTRA_HEIGHT_STEP = 500; // px — mỗi lần bấm "Thêm chỗ nháp" cộng thêm bấy nhiêu
  var ERASER_WIDTH = 22; // px — cục gôm cố định, không theo độ dày bút
  var HISTORY_LIMIT = 100; // số bước hoàn tác tối đa
  var STORE_KEY = 'moyumath_scratchpad';

  var ERASER_CURSOR = 'url("data:image/svg+xml,' + encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><circle cx='12' cy='12' r='10.5'" +
    " fill='rgba(255,255,255,.6)' stroke='#636A76' stroke-width='1.2'/></svg>") + '") 12 12, cell';

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
       hình bất kể cột giữa ngắn hay dài; dính ở mép trên khi cuộn đề dài
       để luôn nằm cạnh câu đang làm. Luôn là giấy sáng (như tờ đề).
       Trên xuống: thanh tiêu đề gọn · giấy kẻ ô · thanh công cụ một hàng. */
    '.sp-col{position:sticky; top:16px; flex:0 0 auto; width:' + DEFAULT_COL_PERCENT + '%; min-width:240px; max-width:60%;',
    '  height:calc(100vh - ' + COL_VIEWPORT_OFFSET + 'px); min-height:' + COL_MIN_HEIGHT + 'px;',
    '  align-self:flex-start; display:flex; flex-direction:column; background:#fff; color:#374151;',
    '  border:1px solid #E5E7EB; border-radius:16px; overflow:hidden; container-type:inline-size;',
    '  font-family:Inter,system-ui,sans-serif; box-shadow:0 1px 2px rgba(16,24,40,.04), 0 2px 8px rgba(16,24,40,.04);',
    '  -webkit-user-select:none; user-select:none; -webkit-touch-callout:none;}',
    '.sp-head{flex:none; position:relative; display:flex; align-items:center; gap:8px; height:40px; padding:0 6px 0 14px;',
    '  border-bottom:1px solid #EEF0F3;}',
    '.sp-grab{display:none;}',
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
    /* nhãn hiện khi nhấn giữ một nút trên màn cảm ứng (không có tooltip) */
    '.sp-tip{position:absolute; z-index:3; max-width:200px; padding:5px 9px; border-radius:6px;',
    '  background:#111827; color:#fff; font:500 12.5px/1.35 Inter,system-ui,sans-serif; pointer-events:none;}',
    '.sp-tip[hidden]{display:none;}',
    /* bảng nháp hẹp: nút nhỏ lại để thanh công cụ vẫn nằm gọn một hàng */
    '@container (max-width:270px){.sp-toolbar .sp-btn{width:27px;} .sp-tool-sep{margin:0 2px;}}',
    /* khung cuộn của bảng nháp — canvas bên trong có thể cao hơn (sau khi
       bấm "Thêm chỗ nháp") hoặc rộng hơn (khi kéo hẹp cột) khung nhìn thấy,
       cuộn dọc / ngang để xem hết */
    '.sp-canvas-wrap{flex:1; min-height:120px; overflow:auto;',
    '  position:relative; background-color:#fff; scrollbar-width:thin;',
    '  scrollbar-color:#D1D5DB transparent;}',
    '.sp-canvas-wrap::-webkit-scrollbar{width:9px; height:9px;}',
    '.sp-canvas-wrap::-webkit-scrollbar-track{background:transparent;}',
    '.sp-canvas-wrap::-webkit-scrollbar-thumb{background:#D1D5DB; border-radius:5px;',
    '  border:2px solid transparent; background-clip:padding-box;}',
    '.sp-canvas-wrap::-webkit-scrollbar-thumb:hover{background:#9CA3AF; background-clip:padding-box;}',
    /* giấy kẻ ô thật nhạt — nét chữ của bé mới là thứ nổi bật */
    '.sp-canvas{display:block; touch-action:none; cursor:crosshair; background-color:#fff;',
    '  background-image:linear-gradient(rgba(99,110,140,0.075) 1px, transparent 1px),',
    '    linear-gradient(90deg, rgba(99,110,140,0.075) 1px, transparent 1px);',
    '  background-size:' + GRID_SIZE + 'px ' + GRID_SIZE + 'px;}',
    '.sp-canvas.sp-erasing{cursor:' + ERASER_CURSOR + ';}',

    /* màn hẹp (điện thoại, iPad dọc): tấm trượt cố định ở đáy màn hình, đè
       lên trang; trang được chừa thêm khoảng trống phía dưới để cuộn được
       hết đề lên trên tấm trượt. Kéo thanh tiêu đề để đổi chiều cao. */
    '@media (max-width:' + SHEET_BREAKPOINT + 'px){',
    '  .sp-resizer{display:none !important;}',
    '  .sp-col{position:fixed; left:0; right:0; top:auto; bottom:0; z-index:50; width:auto !important;',
    '    max-width:none; min-width:0; height:var(--sp-sheet-h, 45vh); min-height:0;',
    '    border-width:1px 0 0; border-radius:16px 16px 0 0; box-shadow:0 -8px 28px rgba(16,24,40,.14);}',
    '  .sp-head{height:46px; padding-top:6px; touch-action:none; cursor:ns-resize;}',
    '  .sp-grab{display:block; position:absolute; top:6px; left:50%; width:40px; height:4px; margin-left:-20px;',
    '    border-radius:2px; background:#D1D5DB;}',
    '  .sp-toolbar{padding-bottom:calc(5px + env(safe-area-inset-bottom, 0px));}',
    '  .sp-toolbar .sp-btn{width:36px; height:36px;}',
    '}',
    'html.sp-sheet-open body{padding-bottom:calc(var(--sp-sheet-h, 45vh) + 24px);}'
  ].join('\n');

  function injectStyles(){
    if(document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS_TEXT;
    document.head.appendChild(style);
  }

  // localStorage an toàn (chế độ riêng tư / bị chặn thì bỏ qua, trang vẫn chạy)
  function readStore(){
    try{ return JSON.parse(window.localStorage.getItem(STORE_KEY)) || {}; }catch(err){ return {}; }
  }
  function writeStore(patch){
    try{
      var s = readStore();
      for(var k in patch) s[k] = patch[k];
      window.localStorage.setItem(STORE_KEY, JSON.stringify(s));
    }catch(err){}
  }
  function clamp(v, lo, hi){ return Math.min(Math.max(v, lo), hi); }

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
    var saved = readStore();
    var sheetMq = window.matchMedia('(max-width:' + SHEET_BREAKPOINT + 'px)');

    var state = {
      tool: 'pen',
      color: COLORS[0].value,
      lineWidth: WIDTHS[0].value,
      strokes: [],
      undoStack: [], // bản chụp trước mỗi thao tác: { strokes, extra? } (extra chỉ có ở bước "sang trang mới")
      redoStack: [],
      currentStroke: null,
      activePointerId: null,
      cssWidth: 0,
      cssHeight: 0,
      baseHeight: 0, // px — chiều cao khung nhìn thấy (đo từ .sp-canvas-wrap)
      extraHeight: 0, // px — phần "nháp thêm" cộng dồn qua nút "Thêm chỗ nháp"
      dpr: 1,
      open: false,
      sheetHeight: 0, // px — chiều cao tấm trượt (màn hẹp)
      // Đã từng thấy bút cảm ứng (Apple Pencil/S-Pen) thì ngón tay chỉ để
      // cuộn, không bao giờ vẽ (chống lòng bàn tay). Nhớ qua các lần tải.
      penSeen: !!saved.pen,
      penUpAt: 0,
      // các ngón tay đang chạm canvas: id → { x, y, palm }
      touches: new Map(),
      scrollGesture: false,
      scrollLast: null
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
    if(saved.width) col.style.width = saved.width + 'px'; // min/max-width của CSS tự kẹp lại
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
    head.appendChild(el('span', 'sp-grab'));
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
    var undoBtn = iconBtn('sp-undo-btn', 'Hoàn tác (Ctrl+Z)', '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>');
    var redoBtn = iconBtn('sp-redo-btn', 'Làm lại (Ctrl+Y)', '<path d="m15 14 5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/>');
    var addSpaceBtn = iconBtn('sp-addspace-btn', 'Thêm trang nháp bên dưới',
      '<path d="M14 3.5H7A1.5 1.5 0 0 0 5.5 5v14A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5V8z"/><path d="M14 3.5V8h4.5"/><path d="M12 11v6M9 14h6"/>');
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
      canvas.classList.toggle('sp-erasing', state.tool === 'eraser');
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

    /* ---------- nhấn giữ một nút (cảm ứng) → hiện nhãn, không bấm nút ---------- */
    var tip = el('div', 'sp-tip');
    tip.hidden = true;
    tip.setAttribute('aria-hidden', 'true');
    col.appendChild(tip);
    var tipTimer = null, tipHideTimer = null, suppressClick = false;

    function showTip(btn){
      tip.textContent = btn.title;
      tip.hidden = false;
      var c = col.getBoundingClientRect(), r = btn.getBoundingClientRect();
      var left = clamp(r.left - c.left + r.width / 2 - tip.offsetWidth / 2, 4, c.width - tip.offsetWidth - 4);
      var top = r.top - c.top - tip.offsetHeight - 8;
      if(top < 4) top = r.bottom - c.top + 8; // nút ở thanh tiêu đề → hiện nhãn bên dưới
      tip.style.left = left + 'px';
      tip.style.top = top + 'px';
    }
    col.addEventListener('pointerdown', function(e){
      suppressClick = false; // nhấn giữ lần trước không sinh click → đừng nuốt lần bấm này
      var btn = e.target.closest && e.target.closest('.sp-btn');
      if(!btn || e.pointerType === 'mouse') return;
      clearTimeout(tipTimer);
      clearTimeout(tipHideTimer);
      tip.hidden = true;
      tipTimer = setTimeout(function(){ showTip(btn); suppressClick = true; }, 450);
    });
    function endPress(){
      clearTimeout(tipTimer);
      if(!tip.hidden){
        clearTimeout(tipHideTimer);
        tipHideTimer = setTimeout(function(){ tip.hidden = true; }, 1200);
      }
    }
    col.addEventListener('pointerup', endPress);
    col.addEventListener('pointercancel', endPress);
    // nhấn giữ để đọc nhãn thì thả tay ra không tính là bấm nút
    col.addEventListener('click', function(e){
      if(!suppressClick) return;
      suppressClick = false;
      e.preventDefault();
      e.stopPropagation();
    }, true);
    col.addEventListener('contextmenu', function(e){ e.preventDefault(); });

    var toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'sp-toggle-btn';
    toggleBtn.textContent = '📝 Bảng nháp';
    container.appendChild(toggleBtn);

    var ctx = canvas.getContext('2d');

    /* ---------- vẽ ---------- */
    // Toạ độ lưu theo pixel TUYỆT ĐỐI như trên giấy thật: kéo resizer cho
    // cột rộng ra thì lộ thêm giấy, hẹp lại thì giấy cuộn ngang được — nét
    // chữ không bị kéo giãn hay bóp méo. Bấm "Thêm chỗ nháp" chỉ nối thêm
    // giấy trắng ở dưới, nét cũ đứng yên chỗ cũ.
    // Nét vẽ được làm mượt: đi qua trung điểm các đoạn bằng đường cong bậc
    // 2 (điểm đo làm điểm điều khiển). Bút cảm ứng: độ dày theo lực nhấn
    // (`p` của từng điểm). Vẽ dần lúc kéo và vẽ lại toàn bộ dùng cùng một
    // cách chia đoạn nên khớp nhau.
    function mid(a, b){ return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; }

    function setPen(stroke, width){
      ctx.globalCompositeOperation = stroke.composite || 'source-over';
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
    function widthAt(stroke, pt){
      return stroke.pressure ? stroke.width * (pt.p || 1) : stroke.width;
    }
    // đoạn thứ i (i ≥ 1): từ trung điểm (i-2, i-1) qua điểm i-1 tới trung điểm (i-1, i)
    function drawPiece(stroke, i){
      var pts = stroke.points, a = pts[i - 1], b = pts[i];
      var from = i === 1 ? a : mid(pts[i - 2], a), to = mid(a, b);
      setPen(stroke, widthAt(stroke, a));
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.quadraticCurveTo(a.x, a.y, to.x, to.y);
      ctx.stroke();
    }
    // nửa đoạn cuối: từ trung điểm cuối tới điểm cuối cùng
    function drawTail(stroke){
      var pts = stroke.points, n = pts.length;
      if(n < 2) return;
      var a = pts[n - 2], b = pts[n - 1], from = mid(a, b);
      setPen(stroke, widthAt(stroke, b));
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    function drawDot(stroke, pt){
      ctx.globalCompositeOperation = stroke.composite || 'source-over';
      ctx.beginPath();
      ctx.fillStyle = stroke.color;
      ctx.arc(pt.x, pt.y, widthAt(stroke, pt) / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    function strokePath(stroke){
      var pts = stroke.points, n = pts.length;
      if(n === 0) return;
      if(n === 1){ drawDot(stroke, pts[0]); return; }
      if(stroke.pressure){
        // gom các đoạn cùng độ dày (làm tròn 0,5px) vào một path — vẽ rời
        // từng đoạn thì mép mờ chồng lên nhau thành nét lấm tấm như hạt
        var runW = null;
        for(var i = 1; i < n; i++){
          var a = pts[i - 1], b = pts[i];
          var wq = Math.max(Math.round(widthAt(stroke, a) * 2) / 2, 0.5);
          var from = i === 1 ? a : mid(pts[i - 2], a), to = mid(a, b);
          if(wq !== runW){
            if(runW !== null) ctx.stroke();
            setPen(stroke, wq);
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            runW = wq;
          }
          ctx.quadraticCurveTo(a.x, a.y, to.x, to.y);
        }
        ctx.lineTo(pts[n - 1].x, pts[n - 1].y);
        ctx.stroke();
        return;
      }
      // nét đều: một path duy nhất (nhanh, mối nối đẹp), cùng hình với vẽ dần
      setPen(stroke, stroke.width);
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for(var j = 1; j < n; j++){
        var m = mid(pts[j - 1], pts[j]);
        ctx.quadraticCurveTo(pts[j - 1].x, pts[j - 1].y, m.x, m.y);
      }
      ctx.lineTo(pts[n - 1].x, pts[n - 1].y);
      ctx.stroke();
    }

    function redrawAll(){
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, state.cssWidth, state.cssHeight);
      state.strokes.forEach(strokePath);
      ctx.globalCompositeOperation = 'source-over';
    }

    // khung bao các nét đã vẽ (để giấy luôn đủ rộng/cao chứa hết nét cũ)
    function contentExtent(){
      var w = 0, h = 0;
      state.strokes.forEach(function(s){
        if(s.maxX > w) w = s.maxX;
        if(s.maxY > h) h = s.maxY;
      });
      return { w: w, h: h };
    }

    // Gọi lại mỗi khi khung vẽ đổi kích thước (kéo resizer, bật/tắt cột,
    // xoay màn hình, kéo tấm trượt, "Thêm chỗ nháp", hoàn tác...). Giấy
    // tối thiểu bằng khung nhìn thấy (`.sp-canvas-wrap`) + phần "thêm chỗ
    // nháp", và luôn đủ lớn để chứa hết nét đã vẽ — khung hẹp hơn thì cuộn.
    // Nét vẽ lưu theo toạ độ tuyệt đối nên vẽ lại là vừa khít, không cần
    // backup bitmap. Trả về true nếu đã vẽ lại.
    function resizeCanvas(){
      var ext = contentExtent();
      var viewW = Math.max(canvasWrap.clientWidth, 1);
      state.baseHeight = Math.max(canvasWrap.clientHeight, 1);
      // lệch vài px (vd thanh cuộn dọc vừa hiện) thì thôi, khỏi bật cuộn ngang
      var minH = Math.max(state.baseHeight + state.extraHeight, 1);
      var w = ext.w > viewW + 12 ? Math.ceil(ext.w) : viewW;
      var h = ext.h > minH + 12 ? Math.ceil(ext.h) : minH;
      var dpr = window.devicePixelRatio || 1;
      if(w === state.cssWidth && h === state.cssHeight && dpr === state.dpr) return false;
      state.cssWidth = w;
      state.cssHeight = h;
      state.dpr = dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      redrawAll();
      return true;
    }
    function refreshCanvas(){ if(!resizeCanvas()) redrawAll(); }

    function relPoint(e, stroke){
      // Dùng bounding rect của chính canvas (không phải khung cuộn ngoài)
      // nên tự động đúng toạ độ dù đang cuộn tới đâu. Kẹp trong giấy: kéo
      // chuột ra ngoài mép không làm giấy phình ra.
      var rect = canvas.getBoundingClientRect();
      var pt = {
        x: clamp(e.clientX - rect.left, 0, state.cssWidth),
        y: clamp(e.clientY - rect.top, 0, state.cssHeight)
      };
      if(stroke && stroke.pressure){
        var raw = e.pressure > 0 ? e.pressure : 0.5;
        var p = 0.45 + raw * 1.1; // lực 0.5 (mặc định) → độ dày gốc
        var pts = stroke.points;
        pt.p = pts.length ? pts[pts.length - 1].p * 0.6 + p * 0.4 : p; // làm mượt lực nhấn
      }
      return pt;
    }

    function addSpace(){
      state.extraHeight += EXTRA_HEIGHT_STEP;
      resizeCanvas();
      canvasWrap.scrollTo({ top: canvasWrap.scrollHeight, behavior: 'smooth' });
    }
    addSpaceBtn.addEventListener('click', addSpace);

    /* ---------- bút, chuột, ngón tay ---------- */
    // Chuột: giữ nút trái để vẽ (như cũ). Bút cảm ứng: luôn vẽ, và thắng
    // nét đang vẽ dở bằng ngón tay (lòng bàn tay chạm trước). Ngón tay:
    // - chưa từng thấy bút: 1 ngón vẽ (bé không có bút vẫn dùng được),
    //   ngón thứ 2 chạm vào thì chuyển sang cuộn (huỷ nét lỡ vẽ);
    // - đã thấy bút: ngón tay chỉ cuộn, không bao giờ vẽ.
    // Cuộn = cuộn giấy nháp trước, hết đường thì cuộn trang (đề bài).
    function cancelCurrentStroke(){
      if(state.activePointerId !== null){
        try{ canvas.releasePointerCapture(state.activePointerId); }catch(err){}
      }
      state.currentStroke = null;
      state.activePointerId = null;
      redrawAll(); // xoá luôn vệt lem lỡ vẽ
    }

    function beginDraw(e){
      state.activePointerId = e.pointerId;
      try{ canvas.setPointerCapture(e.pointerId); }catch(err){}
      var isEraser = state.tool === 'eraser';
      var stroke = {
        kind: e.pointerType,
        color: isEraser ? '#000000' : state.color,
        width: isEraser ? ERASER_WIDTH : state.lineWidth,
        composite: isEraser ? 'destination-out' : 'source-over',
        pressure: e.pointerType === 'pen' && !isEraser,
        points: []
      };
      stroke.points.push(relPoint(e, stroke));
      state.currentStroke = stroke;
      drawDot(stroke, stroke.points[0]);
    }

    function finishStroke(){
      var s = state.currentStroke;
      state.currentStroke = null;
      state.activePointerId = null;
      if(!s || !s.points.length) return;
      drawTail(s);
      var r = s.width * (s.pressure ? 1.6 : 1) / 2;
      s.maxX = 0; s.maxY = 0; // cục gôm không thêm mực → không tính vào khổ giấy
      if(s.composite === 'source-over') s.points.forEach(function(p){
        if(p.x + r > s.maxX) s.maxX = p.x + r;
        if(p.y + r > s.maxY) s.maxY = p.y + r;
      });
      commit(state.strokes.concat([s]));
      redrawAll(); // vẽ lại nét vừa xong thành một path liền (lúc kéo vẽ từng đoạn cho nhanh)
    }

    // Trung bình toạ độ các ngón tay đang chạm (bỏ qua lòng bàn tay).
    function touchCenter(){
      var sx = 0, sy = 0, n = 0;
      state.touches.forEach(function(t){ if(!t.palm){ sx += t.x; sy += t.y; n++; } });
      return n ? { x: sx / n, y: sy / n } : null;
    }
    function startScroll(){
      state.scrollGesture = true;
      state.scrollLast = touchCenter();
    }
    function scrollBy(dx, dy){
      var w = canvasWrap;
      var left = clamp(w.scrollLeft + dx, 0, w.scrollWidth - w.clientWidth);
      var top = clamp(w.scrollTop + dy, 0, w.scrollHeight - w.clientHeight);
      var restX = dx - (left - w.scrollLeft), restY = dy - (top - w.scrollTop);
      w.scrollLeft = left;
      w.scrollTop = top;
      if(Math.abs(restX) >= 0.5 || Math.abs(restY) >= 0.5) window.scrollBy(restX, restY);
    }
    // Lòng bàn tay: chạm lúc bút đang vẽ / vừa nhấc bút, hoặc vùng chạm rất to.
    function isPalm(e){
      if(e.pointerType !== 'touch') return false;
      if(state.currentStroke && state.currentStroke.kind === 'pen') return true;
      if(state.penSeen && Date.now() - state.penUpAt < 500) return true;
      return (e.width || 0) > 40 || (e.height || 0) > 40;
    }
    function blurOutside(){
      // preventDefault() trên canvas chặn việc mất focus mặc định → tự bỏ
      // focus ô nhập để Ctrl+Z về bảng nháp và bàn phím ảo được cất đi.
      var a = document.activeElement;
      if(a && a !== document.body && !col.contains(a) && a.blur) a.blur();
    }

    function onPointerDown(e){
      blurOutside();
      if(e.pointerType === 'pen' && !state.penSeen){
        state.penSeen = true;
        writeStore({ pen: true });
      }

      if(e.pointerType === 'touch'){
        e.preventDefault();
        state.touches.set(e.pointerId, { x: e.clientX, y: e.clientY, palm: isPalm(e) });
        var fingers = 0;
        state.touches.forEach(function(t){ if(!t.palm) fingers++; });
        if(state.penSeen || fingers >= 2 || state.scrollGesture){
          if(state.currentStroke && state.currentStroke.kind === 'touch') cancelCurrentStroke();
          startScroll();
          return;
        }
        if(state.activePointerId !== null || state.touches.get(e.pointerId).palm) return;
        beginDraw(e);
        return;
      }

      if(e.pointerType === 'pen' && state.currentStroke && state.currentStroke.kind === 'touch'){
        cancelCurrentStroke();
      }
      if(state.activePointerId !== null) return;
      if(e.pointerType === 'mouse' && e.button !== 0) return;
      e.preventDefault();
      beginDraw(e);
    }

    function onPointerMove(e){
      if(e.pointerType === 'touch' && state.touches.has(e.pointerId)){
        var t = state.touches.get(e.pointerId);
        t.x = e.clientX;
        t.y = e.clientY;
        if(state.scrollGesture){
          e.preventDefault();
          // bút đang vẽ thì tay tì lên giấy không được làm trôi trang
          if(state.currentStroke && state.currentStroke.kind === 'pen') return;
          var c = touchCenter();
          if(c && state.scrollLast) scrollBy(state.scrollLast.x - c.x, state.scrollLast.y - c.y);
          state.scrollLast = c;
          return;
        }
      }

      if(state.activePointerId !== e.pointerId || !state.currentStroke) return;
      e.preventDefault();
      var stroke = state.currentStroke;
      var events = (e.getCoalescedEvents && e.getCoalescedEvents()) || [e];
      if(!events.length) events = [e];
      for(var i = 0; i < events.length; i++){
        stroke.points.push(relPoint(events[i], stroke));
        drawPiece(stroke, stroke.points.length - 1);
      }
    }

    function endStroke(e){
      if(e.pointerType === 'touch'){
        state.touches.delete(e.pointerId);
        if(state.scrollGesture) state.scrollLast = touchCenter();
      }
      if(state.activePointerId === e.pointerId){
        if(state.currentStroke && state.currentStroke.kind === 'pen') state.penUpAt = Date.now();
        try{ canvas.releasePointerCapture(e.pointerId); }catch(err){}
        if(e.type === 'pointercancel') cancelCurrentStroke();
        else finishStroke();
      }
      if(state.touches.size === 0){
        state.scrollGesture = false;
        state.scrollLast = null;
      }
    }

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', endStroke);
    canvas.addEventListener('pointercancel', endStroke);

    /* ---------- hoàn tác / làm lại / xóa hết ---------- */
    function refreshHistoryButtons(){
      undoBtn.disabled = state.undoStack.length === 0;
      redoBtn.disabled = state.redoStack.length === 0;
    }
    // Mỗi thao tác thay cả mảng `strokes` (nét đã vẽ thì không đổi nữa nên
    // bản chụp chỉ là mảng tham chiếu, rẻ). `resetExtra`: bước "sang trang
    // mới" — bỏ luôn phần giấy thêm, hoàn tác thì lấy lại.
    function commit(strokes, resetExtra){
      var entry = { strokes: state.strokes };
      if(resetExtra){
        entry.extra = state.extraHeight;
        state.extraHeight = 0;
      }
      state.undoStack.push(entry);
      if(state.undoStack.length > HISTORY_LIMIT) state.undoStack.shift();
      state.redoStack = [];
      state.strokes = strokes;
      refreshHistoryButtons();
    }
    function step(from, to){
      if(!from.length || state.currentStroke) return;
      var snap = from.pop();
      var back = { strokes: state.strokes };
      if('extra' in snap){
        back.extra = state.extraHeight;
        state.extraHeight = snap.extra;
      }
      to.push(back);
      state.strokes = snap.strokes;
      refreshCanvas();
      refreshHistoryButtons();
    }
    function undo(){ step(state.undoStack, state.redoStack); }
    function redo(){ step(state.redoStack, state.undoStack); }
    undoBtn.addEventListener('click', undo);
    redoBtn.addEventListener('click', redo);
    // nút 🗑 — xóa hết nhưng vẫn hoàn tác được
    clearBtn.addEventListener('click', function(){
      if(!state.strokes.length) return;
      commit([]);
      redrawAll();
    });
    // Sang câu mới (window.clearScratchpad): giấy trắng, bỏ phần giấy thêm,
    // cuộn về đầu — nhưng là một bước hoàn tác được (bấm Hoàn tác lấy lại
    // bài nháp cũ, Làm lại thì xoá tiếp).
    function newPage(){
      if(state.currentStroke) cancelCurrentStroke();
      if(state.strokes.length || state.extraHeight) commit([], true);
      canvasWrap.scrollTop = 0;
      canvasWrap.scrollLeft = 0;
      refreshCanvas();
    }
    refreshHistoryButtons();

    // Ctrl+Z / Ctrl+Y (Ctrl+Shift+Z) khi bảng nháp đang mở và không gõ trong ô nhập
    document.addEventListener('keydown', function(e){
      if(!state.open || !(e.ctrlKey || e.metaKey) || e.altKey) return;
      var t = e.target;
      if(t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      var k = (e.key || '').toLowerCase();
      if(k === 'z' && !e.shiftKey){ e.preventDefault(); undo(); }
      else if(k === 'y' || (k === 'z' && e.shiftKey)){ e.preventDefault(); redo(); }
    });

    /* ---------- theo dõi kích thước khung vẽ để tự resize canvas ---------- */
    var resizeObserver = null;
    if(window.ResizeObserver){
      resizeObserver = new ResizeObserver(function(){ resizeCanvas(); });
      resizeObserver.observe(canvasWrap);
    } else {
      window.addEventListener('resize', resizeCanvas);
    }
    window.addEventListener('orientationchange', function(){ setTimeout(resizeCanvas, 200); });

    /* ---------- tấm trượt (màn hẹp) ---------- */
    function setSheetHeight(h){
      state.sheetHeight = clamp(Math.round(h), 180, Math.max(window.innerHeight - 72, 180));
      document.documentElement.style.setProperty('--sp-sheet-h', state.sheetHeight + 'px');
    }
    function syncSheet(){
      var on = state.open && sheetMq.matches;
      document.documentElement.classList.toggle('sp-sheet-open', on);
      if(on) setSheetHeight(state.sheetHeight || saved.sheetH || window.innerHeight * SHEET_DEFAULT);
    }
    if(sheetMq.addEventListener) sheetMq.addEventListener('change', syncSheet);
    else if(sheetMq.addListener) sheetMq.addListener(syncSheet);
    window.addEventListener('resize', function(){ if(state.open && sheetMq.matches) setSheetHeight(state.sheetHeight); });

    // kéo thanh tiêu đề lên/xuống để đổi chiều cao tấm trượt
    var sheetDrag = null;
    head.addEventListener('pointerdown', function(e){
      if(!sheetMq.matches || sheetDrag || (e.target.closest && e.target.closest('.sp-close'))) return;
      if(e.pointerType === 'mouse' && e.button !== 0) return;
      sheetDrag = { id: e.pointerId, offset: e.clientY - col.getBoundingClientRect().top };
      try{ head.setPointerCapture(e.pointerId); }catch(err){}
      e.preventDefault();
    });
    head.addEventListener('pointermove', function(e){
      if(!sheetDrag || sheetDrag.id !== e.pointerId) return;
      e.preventDefault();
      setSheetHeight(window.innerHeight - (e.clientY - sheetDrag.offset));
    });
    function endSheetDrag(e){
      if(!sheetDrag || sheetDrag.id !== e.pointerId) return;
      sheetDrag = null;
      try{ head.releasePointerCapture(e.pointerId); }catch(err){}
      writeStore({ sheetH: state.sheetHeight });
    }
    head.addEventListener('pointerup', endSheetDrag);
    head.addEventListener('pointercancel', endSheetDrag);

    /* ---------- bật / tắt cột 3 ---------- */
    function announce(){
      var ev;
      try{ ev = new CustomEvent('scratchpad:toggle', { bubbles: true, detail: { open: state.open } }); }
      catch(err){ return; }
      container.dispatchEvent(ev);
    }
    function open(){
      state.open = true;
      split.classList.remove('sp-off');
      toggleBtn.classList.add('sp-on');
      syncSheet();
      writeStore({ open: true });
      requestAnimationFrame(resizeCanvas);
      announce();
    }
    function close(){
      state.open = false;
      var hadFocus = col.contains(document.activeElement);
      split.classList.add('sp-off');
      toggleBtn.classList.remove('sp-on');
      if(hadFocus) toggleBtn.focus(); // nút × vừa biến mất → trả focus về nút mở
      closePop();
      syncSheet();
      writeStore({ open: false });
      announce();
    }
    function toggle(){ state.open ? close() : open(); }
    toggleBtn.addEventListener('click', toggle);
    closeBtn.addEventListener('click', close);

    /* ---------- kéo thanh resizer (chuột + Pointer Events cho bút cảm ứng) ---------- */
    var dragPointerId = null;

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
      var newWidth = splitRect.right - e.clientX;
      var minW = 240, maxW = splitRect.width * 0.6;
      newWidth = Math.min(Math.max(newWidth, minW), maxW);
      col.style.width = newWidth + 'px';
    }
    function onResizerUp(e){
      if(dragPointerId !== e.pointerId) return;
      dragPointerId = null;
      resizer.classList.remove('sp-dragging');
      try{ resizer.releasePointerCapture(e.pointerId); }catch(err){}
      writeStore({ width: Math.round(col.getBoundingClientRect().width) });
    }
    resizer.addEventListener('pointerdown', onResizerDown);
    resizer.addEventListener('pointermove', onResizerMove);
    resizer.addEventListener('pointerup', onResizerUp);
    resizer.addEventListener('pointercancel', onResizerUp);

    // lần trước để mở thì mở lại
    if(saved.open) open();

    var instance = {
      open: open,
      close: close,
      toggle: toggle,
      clear: newPage,
      undo: undo,
      redo: redo,
      enable: open,
      disable: close,
      destroy: function(){
        if(resizeObserver) resizeObserver.disconnect();
        else window.removeEventListener('resize', resizeCanvas);
        document.documentElement.classList.remove('sp-sheet-open');
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
  // gọi khi trang ra câu mới: giấy trắng (hoàn tác được)
  window.clearScratchpad = function(){
    instances.forEach(function(inst){ inst.clear(); });
  };
})();

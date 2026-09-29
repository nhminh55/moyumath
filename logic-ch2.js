(function(){
  var QuizLogicCh2 = {};

  var Ev = window.MathEvaluator;
  var num = Ev.num;

  function setFeedback(id, correct, note){
    var el = document.getElementById(id);
    if(!el) return;
    el.className = 'feedback show ' + (correct ? 'correct' : 'wrong');
    el.innerHTML = '<span class="mark">' + (correct ? '✓' : '✗') + '</span>' +
                    (note ? '<span class="note">' + note + '</span>' : '');
  }
  function clearFeedback(){
    document.querySelectorAll('.feedback').forEach(function(f){ f.className='feedback'; f.innerHTML=''; });
  }

  if(!window._matchGlobalInit) {
    window._matchGlobalInit = true;
    window._matchState = null;
    document.addEventListener('mousemove', function(e) { if(window._matchState) window._matchState.onMove(e); }, {passive:false});
    document.addEventListener('touchmove', function(e) { if(window._matchState) window._matchState.onMove(e); }, {passive:false});
    document.addEventListener('mouseup', function(e) { if(window._matchState) window._matchState.onEnd(e); });
    document.addEventListener('touchend', function(e) { if(window._matchState) window._matchState.onEnd(e); });
    window.addEventListener('resize', function() {
      document.querySelectorAll('.matching-widget').forEach(function(w) {
        if(w._drawConnections) w._drawConnections();
      });
    });
  }

  function initMatchingWidget(containerId) {
    var container = document.getElementById(containerId);
    if(!container) return;
    var svg = container.querySelector('svg');
    var state = { activeLine: null, startItem: null, connections: {} };
    
    function getCenter(el) {
      var dot = el.querySelector('.dot');
      var rect = dot.getBoundingClientRect();
      var cRect = container.getBoundingClientRect();
      return {
        x: rect.left - cRect.left + rect.width/2,
        y: rect.top - cRect.top + rect.height/2
      };
    }
    
    function drawConnections() {
      svg.innerHTML = '';
      Object.keys(state.connections).forEach(function(lId) {
        var rId = state.connections[lId];
        var lEl = container.querySelector('.match-left .match-item[data-id="'+lId+'"]');
        var rEl = container.querySelector('.match-right .match-item[data-id="'+rId+'"]');
        if(lEl && rEl) {
          var p1 = getCenter(lEl);
          var p2 = getCenter(rEl);
          var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', p1.x); line.setAttribute('y1', p1.y);
          line.setAttribute('x2', p2.x); line.setAttribute('y2', p2.y);
          line.setAttribute('stroke', '#213A54'); line.setAttribute('stroke-width', '2.5');
          line.setAttribute('stroke-linecap', 'round');
          svg.appendChild(line);
          lEl.querySelector('.dot').style.background = '#213A54';
          rEl.querySelector('.dot').style.background = '#213A54';
        }
      });
      
      container.querySelectorAll('.match-item').forEach(function(el){
        var id = el.getAttribute('data-id');
        var isLeft = el.closest('.match-left');
        var connected = false;
        if(isLeft) connected = !!state.connections[id];
        else connected = Object.values(state.connections).indexOf(id) !== -1;
        if(!connected) el.querySelector('.dot').style.background = '#CBD9E6';
      });
    }
    
    container._drawConnections = drawConnections;
    
    function getEventPos(e) {
      if(e.changedTouches && e.changedTouches.length > 0) return { clientX: e.changedTouches[0].clientX, clientY: e.changedTouches[0].clientY };
      return { clientX: e.clientX, clientY: e.clientY };
    }
    
    var localState = {
      onMove: function(e) {
        if(!state.activeLine) return;
        var pos = getEventPos(e);
        var cRect = container.getBoundingClientRect();
        var p1 = getCenter(state.startItem);
        var x2 = pos.clientX - cRect.left;
        var y2 = pos.clientY - cRect.top;
        state.activeLine.setAttribute('x1', p1.x);
        state.activeLine.setAttribute('y1', p1.y);
        state.activeLine.setAttribute('x2', x2);
        state.activeLine.setAttribute('y2', y2);
        if(e.type === 'touchmove') e.preventDefault();
      },
      onEnd: function(e) {
        window._matchState = null;
        if(state.activeLine) { state.activeLine.remove(); state.activeLine = null; }
        
        var pos = getEventPos(e);
        var upEl = document.elementFromPoint(pos.clientX, pos.clientY);
        if(upEl) {
          var target = upEl.closest('.match-item');
          if(target && state.startItem) {
            var startSide = state.startItem.closest('.match-left') ? 'left' : 'right';
            var endSide = target.closest('.match-left') ? 'left' : 'right';
            if(startSide !== endSide) {
              var lId = startSide === 'left' ? state.startItem.getAttribute('data-id') : target.getAttribute('data-id');
              var rId = startSide === 'right' ? state.startItem.getAttribute('data-id') : target.getAttribute('data-id');
              state.connections[lId] = rId;
            }
          }
        }
        drawConnections();
        container.setAttribute('data-connections', JSON.stringify(state.connections));
      }
    };
    
    function onStart(e) {
      var target = e.target.closest('.match-item');
      if(!target) return;
      var side = target.closest('.match-left') ? 'left' : (target.closest('.match-right') ? 'right' : null);
      if(!side) return;
      
      window._matchState = localState;
      state.startItem = target;
      
      var id = target.getAttribute('data-id');
      if(side === 'left') delete state.connections[id];
      else {
        Object.keys(state.connections).forEach(function(k){
          if(state.connections[k] === id) delete state.connections[k];
        });
      }
      
      state.activeLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      state.activeLine.setAttribute('stroke', '#213A54');
      state.activeLine.setAttribute('stroke-width', '2.5');
      state.activeLine.setAttribute('stroke-dasharray', '4');
      state.activeLine.setAttribute('stroke-linecap', 'round');
      
      drawConnections();
      svg.appendChild(state.activeLine);
      localState.onMove(e);
    }
    
    container.addEventListener('mousedown', onStart);
    container.addEventListener('touchstart', onStart, {passive: false});
    
    setTimeout(drawConnections, 50);
  }

  QuizLogicCh2.maxPoints = window.Chuong2Generators.basic.maxPoints;
  QuizLogicCh2.gen = window.Chuong2Generators.basic.gen;

  QuizLogicCh2.render = {
    q1: function(d){
      document.getElementById('q1-body').innerHTML =
        '<div class="sub">' +
          '<span class="sub-label">a.</span> ' + d.a1 + 'a - ' + d.b1 + 'b khi a = ' + d.A + '; b = ' + d.B +
          '<br><input type="text" class="blank mt-1" id="c1a" style="width:80px;">' +
          '<div class="feedback" id="fb-c1a"></div>' +
        '</div>' +
        '<div class="sub">' +
          '<span class="sub-label">b.</span> ' + d.c + 'x² + ' + d.d + 'x khi x = ' + d.X +
          '<br><input type="text" class="blank mt-1" id="c1b" style="width:80px;">' +
          '<div class="feedback" id="fb-c1b"></div>' +
        '</div>';
    },
    q2: function(d){
      var html = '<p class="q-prompt">Một chiếc giỏ có chứa m quả táo. Nối mỗi phát biểu với một biểu thức tương ứng.</p>' +
                 '<div class="matching-widget" id="mw-q2" data-connections="{}" style="position:relative; display:flex; gap:40px; margin-bottom:12px; user-select:none; touch-action:none;">';
      var leftHtml = '<div class="match-left" style="flex:1;">';
      d.left.forEach(function(item, idx) {
        leftHtml += '<div class="match-item" data-id="' + item.id + '" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; padding:10px; background:#fff; border:1.5px solid #CBD9E6; border-radius:8px; cursor:pointer;">' +
                    '<span style="font-weight:bold; margin-right:8px;">' + String.fromCharCode(65 + idx) + '.</span>' + 
                    '<span style="flex:1;">' + item.text + '</span>' +
                    '<div class="dot" style="width:12px; height:12px; background:#CBD9E6; border-radius:50%; margin-left:12px;"></div>' +
                    '</div>' +
                    '<div class="feedback" id="fb-c2-' + item.id + '" style="margin-bottom:12px; margin-top:-8px;"></div>';
      });
      leftHtml += '</div>';

      var rightHtml = '<div class="match-right" style="flex:1;">';
      d.right.forEach(function(item, idx) {
        var roman = ['i','ii','iii','iv','v'][idx];
        rightHtml += '<div class="match-item" data-id="' + item.id + '" style="display:flex; align-items:center; margin-bottom:12px; padding:10px; background:#fff; border:1.5px solid #CBD9E6; border-radius:8px; cursor:pointer;">' +
                     '<div class="dot" style="width:12px; height:12px; background:#CBD9E6; border-radius:50%; margin-right:12px;"></div>' +
                     '<span style="font-weight:bold; margin-right:8px;">' + roman + '.</span>' + 
                     '<span style="flex:1;">' + item.expr + '</span>' +
                     '</div>';
      });
      rightHtml += '</div>';

      html += leftHtml + rightHtml + '<svg style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:10; overflow:visible;"></svg></div>';
      document.getElementById('q2-body').innerHTML = html;
      initMatchingWidget('mw-q2');
    },
    q3: function(d){
      document.getElementById('q3-body').innerHTML =
        '<p class="q-prompt">Bạn Minh nghĩ đến một số x. Viết biểu thức cho mỗi phát biểu sau:</p>' +
        '<div class="sub">' +
          '<span class="sub-label">a.</span> ' + d.a.p +
          '<br><input type="text" class="blank mt-1" id="c3a" placeholder="vd: x/3 + 5" style="width:120px;">' +
          '<span class="hint">Nhập phân số dùng dấu /, luỹ thừa bằng dấu ^ (vd: x/3 + 5, x^2)</span>' +
          '<div class="feedback" id="fb-c3a"></div>' +
        '</div>' +
        '<div class="sub">' +
          '<span class="sub-label">b.</span> ' + d.b.p +
          '<br><input type="text" class="blank mt-1" id="c3b" style="width:120px;">' +
          '<div class="feedback" id="fb-c3b"></div>' +
        '</div>';
    },
    q4: function(d){
      document.getElementById('q4-body').innerHTML =
        '<p class="q-prompt">Phân tích các biểu thức sau thành nhân tử:</p>' +
        '<div class="sub">' +
          '<span class="sub-label">a.</span> ' + d.a_term1 + 'x + ' + d.a_term2 + ' = ' +
          '<input type="text" class="blank" id="c4a" style="width:120px;">' +
          '<div class="feedback" id="fb-c4a"></div>' +
        '</div>' +
        '<div class="sub">' +
          '<span class="sub-label">b.</span> ' + d.b_term1 + 'x + ' + d.b_term2 + 'x² = ' +
          '<input type="text" class="blank" id="c4b" style="width:120px;">' +
          '<div class="feedback" id="fb-c4b"></div>' +
        '</div>' +
        '<div class="sub">' +
          '<span class="sub-label">c.</span> ' + d.c_term1 + 'x + ' + d.c_term2 + 'y - ' + d.c_term3 + ' = ' +
          '<input type="text" class="blank" id="c4c" style="width:120px;">' +
          '<div class="feedback" id="fb-c4c"></div>' +
        '</div>';
    },
    q5: function(d){
      document.getElementById('q5-body').innerHTML =
        '<p class="q-prompt">Khai triển và thu gọn các biểu thức:</p>' +
        '<div class="sub">' +
          '<span class="sub-label">a.</span> ' + d.a.a + '(' + d.a.b + 'x - ' + d.a.c + ') = ' +
          '<input type="text" class="blank" id="c5a" style="width:120px;">' +
          '<div class="feedback" id="fb-c5a"></div>' +
        '</div>' +
        '<div class="sub">' +
          '<span class="sub-label">b.</span> ' + d.b.a + '(' + d.b.b + 'x + ' + d.b.c + ') + ' + d.b.d + '(' + d.b.e + 'x + ' + d.b.f + ') = ' +
          '<input type="text" class="blank" id="c5b" style="width:120px;">' +
          '<div class="feedback" id="fb-c5b"></div>' +
        '</div>' +
        '<div class="sub">' +
          '<span class="sub-label">c.</span> ' + d.c.a + '(' + d.c.b + 'x + ' + d.c.c + ') - ' + d.c.d + '(' + d.c.e + 'x + ' + d.c.f + ') = ' +
          '<input type="text" class="blank" id="c5c" style="width:120px;">' +
          '<div class="feedback" id="fb-c5c"></div>' +
        '</div>';
    },
    q6: function(d){
      var html = '<p class="q-prompt">Lập công thức biểu diễn chữ x (nối thông tin ở Cột A với Cột B):</p>' +
                 '<div class="matching-widget" id="mw-q6" data-connections="{}" style="position:relative; display:flex; gap:40px; margin-bottom:12px; user-select:none; touch-action:none;">';
      var leftHtml = '<div class="match-left" style="flex:1;">';
      d.left.forEach(function(item, idx) {
        leftHtml += '<div class="match-item" data-id="' + item.id + '" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; padding:10px; background:#fff; border:1.5px solid #CBD9E6; border-radius:8px; cursor:pointer;">' +
                    '<span style="font-weight:bold; margin-right:8px;">' + (idx+1) + ')</span>' + 
                    '<span style="flex:1;">' + item.text + '</span>' +
                    '<div class="dot" style="width:12px; height:12px; background:#CBD9E6; border-radius:50%; margin-left:12px;"></div>' +
                    '</div>' +
                    '<div class="feedback" id="fb-c6-' + item.id + '" style="margin-bottom:12px; margin-top:-8px;"></div>';
      });
      leftHtml += '</div>';

      var rightHtml = '<div class="match-right" style="flex:1;">';
      d.right.forEach(function(item, idx) {
        rightHtml += '<div class="match-item" data-id="' + item.id + '" style="display:flex; align-items:center; margin-bottom:12px; padding:10px; background:#fff; border:1.5px solid #CBD9E6; border-radius:8px; cursor:pointer;">' +
                     '<div class="dot" style="width:12px; height:12px; background:#CBD9E6; border-radius:50%; margin-right:12px;"></div>' +
                     '<span style="font-weight:bold; margin-right:8px;">' + String.fromCharCode(65 + idx) + '.</span>' + 
                     '<span style="flex:1;">' + item.text + '</span>' +
                     '</div>';
      });
      rightHtml += '</div>';

      html += leftHtml + rightHtml + '<svg style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:10; overflow:visible;"></svg></div>';
      document.getElementById('q6-body').innerHTML = html;
      initMatchingWidget('mw-q6');
    },
    q7: function(d){
      document.getElementById('q7-body').innerHTML =
        '<p class="q-prompt">Cho đa thức P(x) = ' + d.a + 'x³ + ' + d.b + 'x² - ' + d.c + 'x + ' + d.d + 'x³ - ' + d.e + 'x² + ' + d.f + '</p>' +
        '<div class="sub">' +
          '<span class="sub-label">a.</span> Thu gọn đa thức P(x): P(x) = ' +
          '<input type="text" class="blank" id="c7a" style="width:160px;">' +
          '<div class="feedback" id="fb-c7a"></div>' +
        '</div>' +
        '<div class="sub">' +
          '<span class="sub-label">b.</span> Bậc của đa thức là: ' +
          '<input type="text" class="blank" id="c7b" style="width:40px;">' +
          '<div class="feedback" id="fb-c7b"></div>' +
        '</div>';
    },
    q8: function(d){
      document.getElementById('q8-body').innerHTML =
        '<div class="sub">' +
          '<span class="sub-label">Thực hiện phép chia:</span> (' + d.a + 'x³ + ' + d.b + 'x² + ' + d.c + 'x) : ' + d.k + 'x = ' +
          '<input type="text" class="blank" id="c8" style="width:160px;">' +
          '<div class="feedback" id="fb-c8"></div>' +
        '</div>';
    },
    q9: function(d){
      document.getElementById('q9-body').innerHTML =
        '<div class="sub">' +
          '<span class="sub-label">Tìm x, biết:</span> ' + d.A + 'x + ' + d.B + ' = ' + d.C +
          '<br>x = <input type="text" class="blank mt-1" id="c9" style="width:60px;">' +
          '<div class="feedback" id="fb-c9"></div>' +
        '</div>';
    }
  };

  /* Helper to normalize expressions by stripping spaces and replacing commas/minuses */
  function normalizeExpr(str) {
    if(!str) return "";
    return str.replace(/[−–—]/g, '-').replace(/,/g, '.').replace(/\s+/g, '').toLowerCase();
  }
  
  function checkMatchExpr(input, validList) {
    var normInput = normalizeExpr(input);
    return validList.some(function(v) { return normalizeExpr(v) === normInput; });
  }

  QuizLogicCh2.grade = {
    q1: function(d){
      var earn = 0;
      var a = num(document.getElementById('c1a').value);
      var ca = (a === d.ans1);
      setFeedback('fb-c1a', ca, ca ? '' : 'Đ/a: ' + d.ans1);
      if(ca) earn += 1;

      var b = num(document.getElementById('c1b').value);
      var cb = (b === d.ans2);
      setFeedback('fb-c1b', cb, cb ? '' : 'Đ/a: ' + d.ans2);
      if(cb) earn += 1;

      return earn;
    },
    q2: function(d){
      var earn = 0;
      var container = document.getElementById('mw-q2');
      if(!container) return 0;
      var conns = JSON.parse(container.getAttribute('data-connections') || '{}');
      
      d.left.forEach(function(item) {
        var selectedId = conns[item.id];
        var correct = false;
        var rItem = d.right.find(function(r) { return r.id === selectedId; });
        if(rItem && rItem.originalIndex === item.originalIndex) {
          correct = true;
          earn += 0.5;
        }
        var targetR = d.right.find(function(r) { return r.originalIndex === item.originalIndex; });
        var targetRoman = targetR ? ['i','ii','iii','iv','v'][d.right.indexOf(targetR)] : '';
        setFeedback('fb-c2-' + item.id, correct, correct ? '' : 'Đ/a: nối với ' + targetRoman);
      });
      return earn;
    },
    q3: function(d){
      var earn = 0;
      var ca = checkMatchExpr(document.getElementById('c3a').value, d.a.ans);
      setFeedback('fb-c3a', ca, ca ? '' : 'Đ/a: ' + d.a.ansAlt);
      if(ca) earn += 0.5;

      var cb = checkMatchExpr(document.getElementById('c3b').value, d.b.ans);
      setFeedback('fb-c3b', cb, cb ? '' : 'Đ/a: ' + d.b.ansAlt);
      if(cb) earn += 0.5;

      return earn;
    },
    q4: function(d){
      var earn = 0;
      var ansA = d.a_factor + "(" + d.a1 + "x+" + d.b1 + ")";
      var ansA2 = d.a_factor + "(" + d.b1 + "+" + d.a1 + "x)";
      var ca = checkMatchExpr(document.getElementById('c4a').value, [ansA, ansA2]);
      setFeedback('fb-c4a', ca, ca ? '' : 'Đ/a: ' + d.a_factor + "(" + d.a1 + "x + " + d.b1 + ")");
      if(ca) earn += 0.5;

      var ansB = d.b_factor + "x(1+" + d.d2 + "x)";
      var ansB2 = d.b_factor + "x(" + d.d2 + "x+1)";
      var cb = checkMatchExpr(document.getElementById('c4b').value, [ansB, ansB2]);
      setFeedback('fb-c4b', cb, cb ? '' : 'Đ/a: ' + d.b_factor + "x(1 + " + d.d2 + "x)");
      if(cb) earn += 0.5;

      var ansC = d.c_factor + "(" + d.e3 + "x+" + d.f3 + "y-" + d.g3 + ")";
      var cc = checkMatchExpr(document.getElementById('c4c').value, [ansC]);
      setFeedback('fb-c4c', cc, cc ? '' : 'Đ/a: ' + d.c_factor + "(" + d.e3 + "x + " + d.f3 + "y - " + d.g3 + ")");
      if(cc) earn += 0.5;
      return earn;
    },
    q5: function(d){
      var earn = 0;
      var formatAns = function(ax, num) {
        var res = ax + "x";
        if(num > 0) res += "+" + num;
        else if (num < 0) res += num; // num already negative
        return res;
      };
      
      var ca = checkMatchExpr(document.getElementById('c5a').value, [formatAns(d.a.ans_x, d.a.ans_num)]);
      setFeedback('fb-c5a', ca, ca ? '' : 'Đ/a: ' + formatAns(d.a.ans_x, d.a.ans_num));
      if(ca) earn += 0.5;

      var cb = checkMatchExpr(document.getElementById('c5b').value, [formatAns(d.b.ans_x, d.b.ans_num)]);
      setFeedback('fb-c5b', cb, cb ? '' : 'Đ/a: ' + formatAns(d.b.ans_x, d.b.ans_num));
      if(cb) earn += 0.5;

      var cc = checkMatchExpr(document.getElementById('c5c').value, [formatAns(d.c.ans_x, d.c.ans_num)]);
      setFeedback('fb-c5c', cc, cc ? '' : 'Đ/a: ' + formatAns(d.c.ans_x, d.c.ans_num));
      if(cc) earn += 0.5;
      return earn;
    },
    q6: function(d){
      var earn = 0;
      var container = document.getElementById('mw-q6');
      if(!container) return 0;
      var conns = JSON.parse(container.getAttribute('data-connections') || '{}');

      d.left.forEach(function(item) {
        var selectedId = conns[item.id];
        var correct = false;
        var rItem = d.right.find(function(r) { return r.id === selectedId; });
        if(rItem && rItem.originalIndex === item.originalIndex) {
          correct = true;
          earn += 0.5;
        }
        var targetR = d.right.find(function(r) { return r.originalIndex === item.originalIndex; });
        var targetChar = targetR ? String.fromCharCode(65 + d.right.indexOf(targetR)) : '';
        setFeedback('fb-c6-' + item.id, correct, correct ? '' : 'Đ/a: nối với ' + targetChar);
      });
      return earn;
    },
    q7: function(d){
      var earn = 0;
      var fmt = d.ans_x3 + "x^3";
      if(d.ans_x2 > 0) fmt += "+" + d.ans_x2 + "x^2"; else if (d.ans_x2 < 0) fmt += d.ans_x2 + "x^2";
      if(d.ans_x > 0) fmt += "+" + d.ans_x + "x"; else if (d.ans_x < 0) fmt += d.ans_x + "x";
      if(d.ans_num > 0) fmt += "+" + d.ans_num; else if (d.ans_num < 0) fmt += d.ans_num;
      
      var ca = checkMatchExpr(document.getElementById('c7a').value, [fmt, fmt.replace(/\^2/g,'²').replace(/\^3/g,'³')]);
      setFeedback('fb-c7a', ca, ca ? '' : 'Đ/a: ' + fmt.replace(/\^2/g,'²').replace(/\^3/g,'³'));
      if(ca) earn += 0.5;

      var cb = (num(document.getElementById('c7b').value) === 3);
      setFeedback('fb-c7b', cb, cb ? '' : 'Đ/a: 3');
      if(cb) earn += 0.5;
      return earn;
    },
    q8: function(d){
      var fmt = d.ans_x2 + "x^2";
      if(d.ans_x > 0) fmt += "+" + d.ans_x + "x"; else if (d.ans_x < 0) fmt += d.ans_x + "x";
      if(d.ans_num > 0) fmt += "+" + d.ans_num; else if (d.ans_num < 0) fmt += d.ans_num;
      
      var ca = checkMatchExpr(document.getElementById('c8').value, [fmt, fmt.replace(/\^2/g,'²')]);
      setFeedback('fb-c8', ca, ca ? '' : 'Đ/a: ' + fmt.replace(/\^2/g,'²'));
      return ca ? 1 : 0;
    },
    q9: function(d){
      var ca = (num(document.getElementById('c9').value) === d.ans);
      setFeedback('fb-c9', ca, ca ? '' : 'Đ/a: ' + d.ans);
      return ca ? 1 : 0;
    }
  };

  window.QuizLogicCh2 = QuizLogicCh2;
})();

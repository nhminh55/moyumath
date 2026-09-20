/* Rendering and grading logic for the 60-minute "Kiểm tra 1 tiết" — Chương 1
   (Số tự nhiên, số nguyên, số hữu tỉ). Independent from logic.js (used by
   the 15-phút exam / practice pages), but shares the same question-
   generation module (js/generators-ch1.js) and math-input evaluator
   (js/evaluator.js) — load both before this file. */
(function(){
  var Test1Tiet = {};

  var H = window.Chuong1Generators.helpers;
  var sup = H.sup;

  var Ev = window.MathEvaluator;
  var num = Ev.num;
  var parseFactorization = Ev.parseFactorization;
  var factorizationMatches = Ev.factorizationMatches;
  var parseNumberSet = Ev.parseNumberSet;
  var sameNumberSet = Ev.sameNumberSet;
  var sameIndexSet = Ev.sameIndexSet;
  var regionOf = Ev.regionOf;

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
  function getCheckedIdx(group){
    var boxes = document.querySelectorAll('.checkbox-grid[data-group="'+group+'"] input[type=checkbox]');
    var out = [];
    boxes.forEach(function(b){ if(b.checked) out.push(parseInt(b.dataset.idx,10)); });
    return out;
  }
  function markCheckboxes(group, correctIdxSet){
    var labels = document.querySelectorAll('.checkbox-grid[data-group="'+group+'"] .chk');
    labels.forEach(function(label){
      var input = label.querySelector('input');
      var i = parseInt(input.dataset.idx,10);
      var shouldBeChecked = correctIdxSet.indexOf(i) !== -1;
      label.classList.remove('marked-correct','marked-wrong');
      label.classList.add(input.checked === shouldBeChecked ? 'marked-correct' : 'marked-wrong');
    });
  }

  Test1Tiet.maxPoints = window.Chuong1Generators.tiet.maxPoints;
  Test1Tiet.gen = window.Chuong1Generators.tiet.gen;

  /* ---------- renderers ---------- */
  Test1Tiet.render = {
    q1: function(d){
      document.getElementById('q1-body').innerHTML =
        '<div class="sub">' +
          '<span class="sub-label">a.</span> Phân tích số ' + d.n1 + ' ra thừa số nguyên tố: ' +
          '<input type="text" class="blank" id="c1a" placeholder="vd: 2^2 x 3 x 5">' +
          '<span class="hint">Nhập dạng lũy thừa dùng dấu ^ , ví dụ 2^2 x 3 x 5 — thứ tự các thừa số không quan trọng.</span>' +
          '<div class="feedback" id="fb-c1a"></div>' +
        '</div>' +
        '<div class="sub">' +
          '<span class="sub-label">b.</span> Tìm các ước nguyên tố của ' + d.n2 + ': ' +
          '<input type="text" class="blank" id="c1b" placeholder="vd: 2, 3, 5">' +
          '<div class="feedback" id="fb-c1b"></div>' +
        '</div>';
    },
    q2: function(d){
      document.getElementById('q2-body').innerHTML =
        '<p class="q-prompt">Cho hai số ' + d.n1 + ' và ' + d.n2 + '.</p>' +
        '<div class="sub">' +
          '<span class="sub-label">a. ƯCLN =</span> ' +
          '<input type="text" class="blank" id="c2a" style="width:80px;">' +
          '<div class="feedback" id="fb-c2a"></div>' +
        '</div>' +
        '<div class="sub">' +
          '<span class="sub-label">b. BCNN =</span> ' +
          '<input type="text" class="blank" id="c2b" style="width:80px;">' +
          '<div class="feedback" id="fb-c2b"></div>' +
        '</div>';
    },
    q3: function(d){
      var labels = ['a','b','c'];
      document.getElementById('q3-body').innerHTML = d.items.map(function(it, i){
        return '<div class="sub"><span class="sub-label">' + labels[i] + '.</span> ' +
          it.a + ' ' + it.op + ' (' + it.b + ') = ' +
          '<input type="text" class="blank" id="c3-' + i + '" style="width:80px;">' +
          '<div class="feedback" id="fb-c3-' + i + '"></div></div>';
      }).join('');
    },
    q4: function(d){
      var labels = ['a','b'];
      document.getElementById('q4-body').innerHTML = d.items.map(function(it, i){
        return '<div class="sub"><span class="sub-label">' + labels[i] + '.</span> ' +
          it.prompt + ' = ' +
          '<input type="text" class="blank" id="c4-' + i + '" style="width:90px;">' +
          '<div class="feedback" id="fb-c4-' + i + '"></div></div>';
      }).join('');
    },
    q5: function(d){
      document.getElementById('q5-body').innerHTML =
        '<div class="sub">' +
          '<span class="sub-label">a.</span> Tìm căn bậc hai của ' + d.n + ': ' +
          '<input type="text" class="blank" id="c5a" placeholder="vd: 5 ; -5">' +
          '<span class="hint">Nếu có nhiều giá trị, cách nhau bằng dấu phẩy.</span>' +
          '<div class="feedback" id="fb-c5a"></div>' +
        '</div>' +
        '<div class="sub">' +
          '<span class="sub-label">b.</span> Giải phương trình: x³ = ' + d.k + ' &nbsp;→&nbsp; x = ' +
          '<input type="text" class="blank" id="c5b" style="width:70px;">' +
          '<div class="feedback" id="fb-c5b"></div>' +
        '</div>';
    },
    q6: function(d){
      var mul=d.mul, div=d.div, pw=d.pow;
      document.getElementById('q6-body').innerHTML =
        '<div class="sub exponent-line"><span class="sub-label">a.</span> ' + mul.base + sup(mul.m) + ' × ' + mul.base + sup(mul.n) +
          ' &nbsp;=&nbsp; <span class="base3">' + mul.base + '</span>^' +
          '<input type="text" class="blank" id="c6a" style="width:56px;"><span class="feedback" id="fb-c6a"></span></div>' +
        '<div class="sub exponent-line"><span class="sub-label">b.</span> ' + div.base + sup(div.m) + ' ÷ ' + div.base + sup(div.n) +
          ' &nbsp;=&nbsp; <span class="base3">' + div.base + '</span>^' +
          '<input type="text" class="blank" id="c6b" style="width:56px;"><span class="feedback" id="fb-c6b"></span></div>' +
        '<div class="sub exponent-line"><span class="sub-label">c.</span> (' + pw.base + sup(pw.m) + ')' + sup(pw.n) +
          ' &nbsp;=&nbsp; <span class="base3">' + pw.base + '</span>^' +
          '<input type="text" class="blank" id="c6c" style="width:56px;"><span class="feedback" id="fb-c6c"></span></div>';
    },
    q7: function(d){
      var nums = d.numbers7;
      var stripHtml = nums.map(function(n){ return '<span>' + n.label + '</span>'; }).join('');
      function checkboxGroup(){
        return nums.map(function(n,i){
          return '<label class="chk"><input type="checkbox" data-idx="' + i + '">' + n.label + '</label>';
        }).join('');
      }
      document.getElementById('q7-body').innerHTML =
        '<div class="number-strip">' + stripHtml + '</div>' +
        '<div class="sub"><span class="sub-label">a. Các số tự nhiên:</span>' +
          '<div class="checkbox-grid" data-group="c7a">' + checkboxGroup() + '</div>' +
          '<div class="feedback" id="fb-c7a"></div></div>' +
        '<div class="sub"><span class="sub-label">b. Các số nguyên:</span>' +
          '<div class="checkbox-grid" data-group="c7b">' + checkboxGroup() + '</div>' +
          '<div class="feedback" id="fb-c7b"></div></div>' +
        '<div class="sub"><span class="sub-label">c. Các số hữu tỉ:</span>' +
          '<div class="checkbox-grid" data-group="c7c">' + checkboxGroup() + '</div>' +
          '<div class="feedback" id="fb-c7c"></div></div>';
    }
  };

  /* ---------- graders (return points earned) ---------- */
  Test1Tiet.grade = {
    q1: function(d){
      var total = 0;
      var f1in = parseFactorization(document.getElementById('c1a').value);
      var ok1 = factorizationMatches(f1in, d.f1);
      total += ok1 ? 0.75 : 0;
      var f1str = Object.keys(d.f1).map(function(p){ return d.f1[p]>1 ? p+'^'+d.f1[p] : p; }).join(' x ');
      setFeedback('fb-c1a', ok1, ok1 ? '+0.75 điểm' : ('Đáp án: ' + d.n1 + ' = ' + f1str));

      var chosen = parseNumberSet(document.getElementById('c1b').value);
      var ok2 = sameNumberSet(chosen, d.primes2);
      total += ok2 ? 0.75 : 0;
      setFeedback('fb-c1b', ok2, ok2 ? '+0.75 điểm' : ('Đáp án đúng: ' + d.primes2.join(', ')));
      return total;
    },
    q2: function(d){
      var total = 0;
      var a = num(document.getElementById('c2a').value);
      var okA = Math.abs(a-d.gcd) < 1e-9;
      total += okA ? 0.75 : 0;
      setFeedback('fb-c2a', okA, okA ? '+0.75 điểm' : ('Đáp án đúng: ' + d.gcd));

      var b = num(document.getElementById('c2b').value);
      var okB = Math.abs(b-d.lcm) < 1e-9;
      total += okB ? 0.75 : 0;
      setFeedback('fb-c2b', okB, okB ? '+0.75 điểm' : ('Đáp án đúng: ' + d.lcm));
      return total;
    },
    q3: function(d){
      var total = 0;
      d.items.forEach(function(it, i){
        var v = num(document.getElementById('c3-'+i).value);
        var ok = Math.abs(v-it.result) < 1e-9;
        total += ok ? 0.5 : 0;
        setFeedback('fb-c3-'+i, ok, ok ? '+0.5' : ('Đáp án đúng: ' + it.result));
      });
      return total;
    },
    q4: function(d){
      var total = 0;
      d.items.forEach(function(it, i){
        var v = num(document.getElementById('c4-'+i).value);
        var ok = Math.abs(v-it.result) < 1e-9;
        total += ok ? 1 : 0;
        setFeedback('fb-c4-'+i, ok, ok ? '+1 điểm' : ('Đáp án đúng: ' + it.result));
      });
      return total;
    },
    q5: function(d){
      var total = 0;
      var target = d.n === 0 ? [0] : [d.sqrtN, -d.sqrtN];
      var xs = parseNumberSet(document.getElementById('c5a').value);
      var okA = sameNumberSet(xs, target);
      total += okA ? 0.5 : 0;
      setFeedback('fb-c5a', okA, okA ? '+0.5' : ('Đáp án đúng: ' + target.join(', ')));

      var b = num(document.getElementById('c5b').value);
      var okB = Math.abs(b-d.m) < 1e-9;
      total += okB ? 0.5 : 0;
      setFeedback('fb-c5b', okB, okB ? '+0.5' : ('Đáp án đúng: x = ' + d.m));
      return total;
    },
    q6: function(d){
      var total = 0;
      [['c6a', d.mul.ans], ['c6b', d.div.ans], ['c6c', d.pow.ans]].forEach(function(pair){
        var v = num(document.getElementById(pair[0]).value);
        var ok = Math.abs(v-pair[1]) < 1e-9;
        total += ok ? 0.5 : 0;
        setFeedback('fb-'+pair[0], ok, ok ? '+0.5' : ('Đáp án đúng: ' + pair[1]));
      });
      return total;
    },
    q7: function(d){
      var total = 0;
      var nums = d.numbers7;
      var idxAll = nums.map(function(n,i){ return i; });
      var idxN = idxAll.filter(function(i){ return regionOf(nums[i].value)==='N'; });
      var idxZ = idxAll.filter(function(i){ return regionOf(nums[i].value)==='N' || regionOf(nums[i].value)==='Z'; });
      var idxQ = idxAll;

      var chosenA = getCheckedIdx('c7a');
      var okA = sameIndexSet(chosenA, idxN);
      total += okA ? 0.34 : 0;
      markCheckboxes('c7a', idxN);
      setFeedback('fb-c7a', okA, okA ? '+0.34' : ('Đáp án đúng: ' + idxN.map(function(i){return nums[i].label;}).join(' ; ')));

      var chosenB = getCheckedIdx('c7b');
      var okB = sameIndexSet(chosenB, idxZ);
      total += okB ? 0.33 : 0;
      markCheckboxes('c7b', idxZ);
      setFeedback('fb-c7b', okB, okB ? '+0.33' : ('Đáp án đúng: ' + idxZ.map(function(i){return nums[i].label;}).join(' ; ')));

      var chosenC = getCheckedIdx('c7c');
      var okC = sameIndexSet(chosenC, idxQ);
      total += okC ? 0.33 : 0;
      markCheckboxes('c7c', idxQ);
      setFeedback('fb-c7c', okC, okC ? '+0.33' : 'Đáp án đúng: cả 5 số đều là số hữu tỉ');
      return total;
    }
  };

  Test1Tiet.clearFeedback = clearFeedback;

  window.Test1Tiet = Test1Tiet;
})();

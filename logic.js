/* Shared question-generation, rendering and grading logic for Toán 7 — Chương 1.
   Used by both exam.html (full exam) and practice.html (drill single question). */
(function(){
  var QuizLogic = {};

  /* ---------- small helpers ---------- */
  function randInt(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
  function pick(arr){ return arr[randInt(0,arr.length-1)]; }
  function shuffle(arr){
    var a = arr.slice();
    for(var i=a.length-1;i>0;i--){
      var j = randInt(0,i);
      var t=a[i]; a[i]=a[j]; a[j]=t;
    }
    return a;
  }
  var SUP = {'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};
  function sup(n){ return String(n).split('').map(function(d){return SUP[d]||d;}).join(''); }
  function gcdOf(a,b){ a=Math.abs(a); b=Math.abs(b); while(b){ var t=b; b=a%b; a=t; } return a; }
  function lcmOf(a,b){ return Math.abs(a*b)/gcdOf(a,b); }
  function factorize(n){
    var map={}, x=n, d=2;
    while(d*d<=x){
      while(x%d===0){ map[d]=(map[d]||0)+1; x/=d; }
      d++;
    }
    if(x>1) map[x]=(map[x]||0)+1;
    return map;
  }
  function num(str){
    if(str===null || str===undefined) return NaN;
    str = String(str).trim().replace(',', '.');
    return parseFloat(str);
  }
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

  /* ---------- factorization parsing (for câu 1) ---------- */
  function parseFactorization(str){
    if(!str) return {};
    str = str.toLowerCase().replace(/\s+/g,'');
    var supMap = {'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9'};
    str = str.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, function(m){ return '^' + supMap[m]; });
    var tokens = str.split(/[x×*.]/).filter(Boolean);
    var map = {};
    tokens.forEach(function(t){
      var parts = t.split('^');
      var base = parseInt(parts[0], 10);
      var exp = parts[1] ? parseInt(parts[1], 10) : 1;
      if(!isNaN(base)){ map[base] = (map[base] || 0) + exp; }
    });
    return map;
  }
  function factorizationMatches(map, target){
    var keys1 = Object.keys(map).filter(function(k){ return map[k] !== 0; });
    var keys2 = Object.keys(target);
    if(keys1.length !== keys2.length) return false;
    return keys2.every(function(k){ return map[k] === target[k]; });
  }
  function parseNumberSet(str){
    if(!str) return [];
    var matches = str.match(/-?\d+(\.\d+)?/g) || [];
    var out = [];
    matches.forEach(function(m){
      var v = parseFloat(m);
      if(!isNaN(v) && out.indexOf(v) === -1) out.push(v);
    });
    return out;
  }
  function sameIndexSet(a,b){
    if(a.length!==b.length) return false;
    var sa=a.slice().sort(); var sb=b.slice().sort();
    return sa.every(function(v,i){return v===sb[i];});
  }
  function regionOf(v){
    if(Number.isInteger(v) && v >= 0) return 'N';
    if(Number.isInteger(v)) return 'Z';
    return 'Q';
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

  /* ---------- question pools ---------- */
  var PAIR_POOL = [[60,72],[24,36],[18,48],[45,60],[36,90],[16,40],[28,42],
                    [50,75],[32,48],[20,30],[12,18],[27,36],[40,60],[54,72],[35,105],
                    [24,60],[30,45],[42,63],[24,40],[36,48],[18,30],[45,75],[21,28],
                    [16,24],[36,60],[48,72],[20,50],[27,45],[32,80],[24,90],[15,40],
                    [56,84],[42,70],[36,54],[63,84],[30,72],[48,60],[18,45],[20,36],[28,70]];
  var lastPairIdx = -1;
  var lastK = -1;
  var lastBase3 = -1;

  QuizLogic.maxPoints = { 1:3, 2:1, 3:2, 4:2, 5:2 };

  /* ---------- generators (one per question, independent of each other) ---------- */
  QuizLogic.gen = {
    q1: function(){
      var idx;
      do { idx = randInt(0, PAIR_POOL.length-1); } while(idx === lastPairIdx);
      lastPairIdx = idx;
      var n1 = PAIR_POOL[idx][0], n2 = PAIR_POOL[idx][1];
      return { n1:n1, n2:n2, f1:factorize(n1), f2:factorize(n2), gcd:gcdOf(n1,n2), lcm:lcmOf(n1,n2) };
    },
    q2: function(){
      var k;
      do { k = randInt(2,20); } while(k === lastK);
      lastK = k;
      return { k:k, xTarget:[k,-k] };
    },
    q3: function(){
      var base;
      do { base = pick([2,3,5,7,10]); } while(base === lastBase3);
      lastBase3 = base;
      var p1a = randInt(2,8), p2a = randInt(2,7);
      var p1b = randInt(7,12), p2b = randInt(2, p1b-2);
      var p1c = randInt(2,5), p2c = randInt(2,4);
      var p1d = randInt(6,12);
      return {
        base: base,
        c3: {
          p1a:p1a, p2a:p2a, ansA: p1a+p2a,
          p1b:p1b, p2b:p2b, ansB: p1b-p2b,
          p1c:p1c, p2c:p2c, ansC: p1c*p2c,
          p1d:p1d, ansD: p1d-1
        }
      };
    },
    q4: function(){
      var a4 = randInt(2,12);
      var sq = pick([1,2,3,4,5,6,7,8]);
      var b4 = sq*sq;
      var c4v = randInt(1,15), d4v = randInt(1,15);
      var result4 = a4*a4 + sq*(c4v-d4v);
      return { c4: { a:a4, b:b4, sqrtB:sq, c:c4v, d:d4v, result: result4 } };
    },
    q5: function(){
      var neg = -randInt(1,25);
      var decInt = randInt(1,12);
      var mixInt; do { mixInt = randInt(1,12); } while(mixInt === decInt);
      var nat1 = randInt(1,30);
      var nat2; do { nat2 = randInt(1,30); } while(nat2 === nat1);
      var nums = [
        { value: neg, label: '−' + Math.abs(neg) },
        { value: decInt + 0.5, label: decInt + ',5' },
        { value: nat1, label: String(nat1) },
        { value: mixInt + 0.5, label: mixInt + ' ½' },
        { value: nat2, label: String(nat2) }
      ];
      return { numbers5: shuffle(nums) };
    }
  };

  /* ---------- renderers (write into #q{n}-body) ---------- */
  QuizLogic.render = {
    q1: function(d){
      document.getElementById('q1-body').innerHTML =
        '<div class="sub">' +
          '<span class="sub-label">a.</span> Phân tích số ' + d.n1 + ' và ' + d.n2 + ' ra thừa số nguyên tố.' +
          '<div class="factor-row" style="margin-top:8px;">' + d.n1 + ' &nbsp;=&nbsp; ' +
            '<input type="text" class="blank" id="c1a-1" placeholder="vd: 2^2 x 3 x 5"></div>' +
          '<div class="factor-row">' + d.n2 + ' &nbsp;=&nbsp; ' +
            '<input type="text" class="blank" id="c1a-2" placeholder="vd: 2^3 x 3^2"></div>' +
          '<span class="hint">Nhập dạng lũy thừa dùng dấu ^ , ví dụ 2^2 x 3 x 5 — thứ tự các thừa số không quan trọng.</span>' +
          '<div class="feedback" id="fb-c1a"></div>' +
        '</div>' +
        '<div class="sub">' +
          '<span class="sub-label">b.</span> Tìm ước chung lớn nhất (ƯCLN) của ' + d.n1 + ' và ' + d.n2 + ': ' +
          '<input type="text" class="blank" id="c1b" style="width:80px;">' +
          '<div class="feedback" id="fb-c1b"></div>' +
        '</div>' +
        '<div class="sub">' +
          '<span class="sub-label">c.</span> Tìm bội chung nhỏ nhất (BCNN) của ' + d.n1 + ' và ' + d.n2 + ': ' +
          '<input type="text" class="blank" id="c1c" style="width:80px;">' +
          '<div class="feedback" id="fb-c1c"></div>' +
        '</div>';
    },
    q2: function(d){
      document.getElementById('q2-body').innerHTML =
        '<p class="q-prompt">Tìm tất cả các giá trị của <i>x</i> thoả mãn <i>x</i>² = ' + (d.k*d.k) + '</p>' +
        '<div class="sub">' +
          '<span class="sub-label">x =</span> ' +
          '<input type="text" class="blank" id="c2" placeholder="vd: 8 ; -8">' +
          '<span class="hint">Nếu có nhiều giá trị, cách nhau bằng dấu phẩy.</span>' +
          '<div class="feedback" id="fb-c2"></div>' +
        '</div>';
    },
    q3: function(d){
      var b = d.base, c3 = d.c3;
      document.getElementById('q3-body').innerHTML =
        '<div class="sub exponent-line"><span class="sub-label">a.</span> ' + b + sup(c3.p1a) + ' × ' + b + sup(c3.p2a) +
          ' &nbsp;=&nbsp; <span class="base3">' + b + '</span>^' +
          '<input type="text" class="blank" id="c3a" style="width:56px;"><span class="feedback" id="fb-c3a"></span></div>' +
        '<div class="sub exponent-line"><span class="sub-label">b.</span> ' + b + sup(c3.p1b) + ' ÷ ' + b + sup(c3.p2b) +
          ' &nbsp;=&nbsp; <span class="base3">' + b + '</span>^' +
          '<input type="text" class="blank" id="c3b" style="width:56px;"><span class="feedback" id="fb-c3b"></span></div>' +
        '<div class="sub exponent-line"><span class="sub-label">c.</span> (' + b + sup(c3.p1c) + ')' + sup(c3.p2c) +
          ' &nbsp;=&nbsp; <span class="base3">' + b + '</span>^' +
          '<input type="text" class="blank" id="c3c" style="width:56px;"><span class="feedback" id="fb-c3c"></span></div>' +
        '<div class="sub exponent-line"><span class="sub-label">d.</span> ' + b + sup(c3.p1d) + ' ÷ ' + b + ' × ' + b + sup(0) +
          ' &nbsp;=&nbsp; <span class="base3">' + b + '</span>^' +
          '<input type="text" class="blank" id="c3d" style="width:56px;"><span class="feedback" id="fb-c3d"></span></div>';
    },
    q4: function(d){
      var c4 = d.c4;
      document.getElementById('q4-body').innerHTML =
        '<p style="text-align:center; font-size:19px; color:var(--ink); margin:0 0 14px;">' +
          c4.a + sup(2) + ' + √' + c4.b + ' × (' + c4.c + ' − ' + c4.d + ')' +
        '</p>' +
        '<div class="sub">' +
          '<span class="sub-label">Kết quả =</span> ' +
          '<input type="text" class="blank" id="c4" style="width:90px;">' +
          '<div class="feedback" id="fb-c4"></div>' +
        '</div>';
    },
    q5: function(d){
      var nums = d.numbers5;
      var stripHtml = nums.map(function(n){ return '<span>' + n.label + '</span>'; }).join('');
      function checkboxGroup(){
        return nums.map(function(n,i){
          return '<label class="chk"><input type="checkbox" data-idx="' + i + '">' + n.label + '</label>';
        }).join('');
      }
      var vennRows = nums.map(function(n,i){
        return '<div class="venn-row">' + n.label +
          ' <select id="v-' + i + '"><option value="">— chọn —</option><option value="N">N</option><option value="Z">Z</option><option value="Q">Q</option></select></div>';
      }).join('');

      document.getElementById('q5-body').innerHTML =
        '<div class="number-strip">' + stripHtml + '</div>' +
        '<div class="sub"><span class="sub-label">a. Các số tự nhiên:</span>' +
          '<div class="checkbox-grid" data-group="c5a">' + checkboxGroup() + '</div>' +
          '<div class="feedback" id="fb-c5a"></div></div>' +
        '<div class="sub"><span class="sub-label">b. Các số nguyên:</span>' +
          '<div class="checkbox-grid" data-group="c5b">' + checkboxGroup() + '</div>' +
          '<div class="feedback" id="fb-c5b"></div></div>' +
        '<div class="sub"><span class="sub-label">c. Các số hữu tỉ:</span>' +
          '<div class="checkbox-grid" data-group="c5c">' + checkboxGroup() + '</div>' +
          '<div class="feedback" id="fb-c5c"></div></div>' +
        '<div class="sub"><span class="sub-label">d. Sắp xếp vào biểu đồ Venn — chọn tập hợp nhỏ nhất mà mỗi số thuộc về:</span>' +
          '<div class="venn-wrap">' +
            '<svg class="venn-svg" width="180" height="200" viewBox="0 0 180 200">' +
              '<circle cx="90" cy="105" r="90" fill="none" stroke="#213A54" stroke-width="2"/>' +
              '<circle cx="90" cy="112" r="60" fill="none" stroke="#213A54" stroke-width="2"/>' +
              '<circle cx="90" cy="122" r="32" fill="none" stroke="#213A54" stroke-width="2"/>' +
              '<text x="90" y="30" text-anchor="middle" font-family="Lora, serif" font-weight="600" font-size="18" fill="#213A54">Q</text>' +
              '<text x="90" y="65" text-anchor="middle" font-family="Lora, serif" font-weight="600" font-size="16" fill="#213A54">Z</text>' +
              '<text x="90" y="98" text-anchor="middle" font-family="Lora, serif" font-weight="600" font-size="15" fill="#213A54">N</text>' +
            '</svg>' +
            '<div class="venn-selects">' + vennRows + '</div>' +
          '</div>' +
          '<div class="feedback" id="fb-c5d"></div>' +
        '</div>';
    }
  };

  /* ---------- graders (return points earned, write feedback into DOM) ---------- */
  QuizLogic.grade = {
    q1: function(d){
      var total = 0;
      var f1in = parseFactorization(document.getElementById('c1a-1').value);
      var f2in = parseFactorization(document.getElementById('c1a-2').value);
      var ok1 = factorizationMatches(f1in, d.f1);
      var ok2 = factorizationMatches(f2in, d.f2);
      var pts1a = (ok1?0.5:0) + (ok2?0.5:0);
      total += pts1a;
      var f1str = Object.keys(d.f1).map(function(p){ return d.f1[p]>1 ? p+'^'+d.f1[p] : p; }).join(' x ');
      var f2str = Object.keys(d.f2).map(function(p){ return d.f2[p]>1 ? p+'^'+d.f2[p] : p; }).join(' x ');
      setFeedback('fb-c1a', pts1a===1, pts1a===1 ? '+1 điểm' : ('Đáp án: '+d.n1+' = '+f1str+' ; '+d.n2+' = '+f2str+'  ('+pts1a+' điểm)'));

      var b1 = num(document.getElementById('c1b').value);
      var okB = Math.abs(b1-d.gcd) < 1e-9;
      total += okB ? 1 : 0;
      setFeedback('fb-c1b', okB, okB ? '+1 điểm' : ('Đáp án đúng: '+d.gcd));

      var c1v = num(document.getElementById('c1c').value);
      var okC = Math.abs(c1v-d.lcm) < 1e-9;
      total += okC ? 1 : 0;
      setFeedback('fb-c1c', okC, okC ? '+1 điểm' : ('Đáp án đúng: '+d.lcm));
      return total;
    },
    q2: function(d){
      var xs = parseNumberSet(document.getElementById('c2').value);
      var target2 = d.xTarget;
      var matchCount = target2.filter(function(t){ return xs.indexOf(t) !== -1; }).length;
      var extra = xs.filter(function(v){ return target2.indexOf(v) === -1; }).length;
      var pts2 = (matchCount===2 && extra===0) ? 1 : (matchCount>=1 && extra===0 ? 0.5 : 0);
      setFeedback('fb-c2', pts2===1, pts2===1 ? '+1 điểm' : ('Đáp án đúng: x = '+target2[0]+' hoặc x = '+target2[1]+'  ('+pts2+' điểm)'));
      return pts2;
    },
    q3: function(d){
      var total = 0;
      var c3 = d.c3;
      [['c3a',c3.ansA],['c3b',c3.ansB],['c3c',c3.ansC],['c3d',c3.ansD]].forEach(function(pair){
        var v = num(document.getElementById(pair[0]).value);
        var ok = Math.abs(v-pair[1]) < 1e-9;
        total += ok ? 0.5 : 0;
        setFeedback('fb-'+pair[0], ok, ok ? '+0.5' : ('Đáp án: '+d.base+'^'+pair[1]));
      });
      return total;
    },
    q4: function(d){
      var v4 = num(document.getElementById('c4').value);
      var c4 = d.c4;
      var ok4 = Math.abs(v4-c4.result) < 1e-9;
      setFeedback('fb-c4', ok4, ok4 ? '+2 điểm' : ('Đáp án đúng: '+c4.result+'  ('+c4.a+'² + √'+c4.b+'×('+c4.c+'−'+c4.d+') = '+(c4.a*c4.a)+' + '+c4.sqrtB+'×('+(c4.c-c4.d)+') = '+c4.result+')'));
      return ok4 ? 2 : 0;
    },
    q5: function(d){
      var total = 0;
      var nums = d.numbers5;
      var idxAll = nums.map(function(n,i){return i;});
      var idxN = idxAll.filter(function(i){ return regionOf(nums[i].value)==='N'; });
      var idxZ = idxAll.filter(function(i){ return regionOf(nums[i].value)==='N' || regionOf(nums[i].value)==='Z'; });
      var idxQ = idxAll;

      var chosen5a = getCheckedIdx('c5a');
      var ok5a = sameIndexSet(chosen5a, idxN);
      total += ok5a ? 0.5 : 0;
      markCheckboxes('c5a', idxN);
      setFeedback('fb-c5a', ok5a, ok5a ? '+0.5' : ('Đáp án đúng: ' + idxN.map(function(i){return nums[i].label;}).join(' ; ')));

      var chosen5b = getCheckedIdx('c5b');
      var ok5b = sameIndexSet(chosen5b, idxZ);
      total += ok5b ? 0.5 : 0;
      markCheckboxes('c5b', idxZ);
      setFeedback('fb-c5b', ok5b, ok5b ? '+0.5' : ('Đáp án đúng: ' + idxZ.map(function(i){return nums[i].label;}).join(' ; ')));

      var chosen5c = getCheckedIdx('c5c');
      var ok5c = sameIndexSet(chosen5c, idxQ);
      total += ok5c ? 0.5 : 0;
      markCheckboxes('c5c', idxQ);
      setFeedback('fb-c5c', ok5c, ok5c ? '+0.5' : 'Đáp án đúng: cả 5 số đều là số hữu tỉ');

      var vennCorrectCount = 0;
      var vennAnsParts = [];
      nums.forEach(function(n,i){
        var sel = document.getElementById('v-'+i);
        var correctRegion = regionOf(n.value);
        vennAnsParts.push(n.label+'→'+correctRegion);
        if(sel.value === correctRegion){
          vennCorrectCount++;
          sel.style.borderColor = 'var(--pen-green)';
        } else {
          sel.style.borderColor = 'var(--pen-red)';
        }
      });
      var pts5d = vennCorrectCount * 0.1;
      total += pts5d;
      setFeedback('fb-c5d', vennCorrectCount===5, 'Đúng '+vennCorrectCount+'/5 ('+pts5d.toFixed(1)+' điểm) · Đáp án: '+vennAnsParts.join(', '));
      return total;
    }
  };

  QuizLogic.clearFeedback = clearFeedback;

  window.QuizLogic = QuizLogic;
})();

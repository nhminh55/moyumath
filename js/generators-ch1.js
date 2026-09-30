/* Pure question-generation logic for Toán 7 — Chương 1
   (Số tự nhiên, số nguyên, số hữu tỉ). No DOM access here — only random data
   generation, shared by logic.js (QuizLogic, bài kiểm tra 15 phút) and
   logic-1tiet.js (Test1Tiet, bài kiểm tra 1 tiết), which render and grade
   the data these generators produce.
   Load this file before logic.js / logic-1tiet.js. */
(function(){
  var Chuong1Generators = {};

  /* ---------- small random/math helpers, reused by renderers too ---------- */
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

  Chuong1Generators.helpers = { randInt:randInt, pick:pick, shuffle:shuffle, sup:sup, gcdOf:gcdOf, lcmOf:lcmOf, factorize:factorize };

  /* ================= Bài kiểm tra 15 phút (QuizLogic) ================= */
  var PAIR_POOL = [[60,72],[24,36],[18,48],[45,60],[36,90],[16,40],[28,42],
                    [50,75],[32,48],[20,30],[12,18],[27,36],[40,60],[54,72],[35,105],
                    [24,60],[30,45],[42,63],[24,40],[36,48],[18,30],[45,75],[21,28],
                    [16,24],[36,60],[48,72],[20,50],[27,45],[32,80],[24,90],[15,40],
                    [56,84],[42,70],[36,54],[63,84],[30,72],[48,60],[18,45],[20,36],[28,70]];
  var lastPairIdx = -1;
  var lastK = -1;
  var lastBase3 = -1;

  Chuong1Generators.basic = {
    maxPoints: { 1:3, 2:1, 3:2, 4:2, 5:2 },
    gen: {
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
    }
  };

  /* ================= Bài kiểm tra 1 tiết (Test1Tiet) ================= */
  var POOL_FACTORIZE = [70,115,300,432,145,204,180,252,315,275,168,225,96,140,240];
  var POOL_PRIME_FACTORS = [28,120,90,84,150,196,225,252,132,168,140,110,105,72,60];
  var POOL_PAIRS = [[96,27],[60,150],[28,40],[50,72],[112,280],[54,36],[36,90],[56,45],[126,90],[77,56],
                     [45,60],[24,90],[63,105],[48,180],[75,100]];
  var POOL_ARITH = [
    {a:-30, op:'÷', b:5, result:-6},
    {a:8, op:'×', b:18, result:144},
    {a:200, op:'÷', b:-10, result:-20},
    {a:-42, op:'÷', b:-3, result:14},
    {a:112, op:'÷', b:-14, result:-8},
    {a:-66, op:'÷', b:-11, result:6},
    {a:-9, op:'×', b:-6, result:54},
    {a:5, op:'×', b:-14, result:-70},
    {a:16, op:'÷', b:-8, result:-2},
    {a:-8, op:'×', b:6, result:-48},
    {a:-9, op:'×', b:5, result:-45},
    {a:-22, op:'÷', b:11, result:-2},
    {a:-20, op:'×', b:5, result:-100},
    {a:-1, op:'×', b:-14, result:14},
    {a:-200, op:'÷', b:20, result:-10}
  ];
  var PERFECT_SQUARES = [4,9,16,25,36,49,64,81,100,121,144];
  var SQRT_CANDIDATES = [0,1,4,9,16,25,36,49,64,81,100,121,144,169,196,225];
  var POWER_BASES = [2,3,4,5,6,7,10];

  var lastIdx1 = -1, lastIdx1b = -1, lastPair = -1;

  var C4_PATTERNS = {
    A: function(){
      var A=randInt(2,6), B=randInt(3,9), C=randInt(2,8);
      var result = A*(-(B+C));
      return { prompt: A + ' × [(−' + B + ') − ' + C + ']', result: result };
    },
    B: function(){
      var B=randInt(2,6), C=randInt(2,6), k=randInt(2,8), sign=pick([1,-1]);
      var result = sign*k;
      var A = -result*(B+C);
      return { prompt: A + ' ÷ [(−' + B + ') + (−' + C + ')]', result: result };
    },
    C: function(){
      var A=randInt(2,15), B=randInt(2,20), C=randInt(2,9);
      var inner = B - A;
      var result = inner * (-C);
      return { prompt: '[(−' + A + ') + ' + B + '] × (−' + C + ')', result: result };
    },
    D: function(){
      var S=pick(PERFECT_SQUARES), sqrtS=Math.sqrt(S), B=randInt(2,9), C=randInt(1,30);
      var result = sqrtS*(-B) + C;
      return { prompt: '√' + S + ' × (−' + B + ') + ' + C, result: result };
    },
    E: function(){
      var A=randInt(2,6), B=randInt(2,6), D=randInt(2,9), q=randInt(1,9);
      var C = D*q;
      var result = A*A*B + q;
      return { prompt: A + sup(2) + ' × ' + B + ' + (−' + C + ') ÷ (−' + D + ')', result: result };
    }
  };

  Chuong1Generators.tiet = {
    maxPoints: { 1:1.5, 2:1.5, 3:1.5, 4:2, 5:1, 6:1.5, 7:1 },
    gen: {
      q1: function(){
        var i1; do { i1 = randInt(0, POOL_FACTORIZE.length-1); } while(i1 === lastIdx1);
        lastIdx1 = i1;
        var n1 = POOL_FACTORIZE[i1];
        var i2, n2;
        do {
          i2 = randInt(0, POOL_PRIME_FACTORS.length-1);
          n2 = POOL_PRIME_FACTORS[i2];
        } while(i2 === lastIdx1b || n2 === n1);
        lastIdx1b = i2;
        return { n1:n1, n2:n2, f1: factorize(n1), primes2: Object.keys(factorize(n2)).map(Number) };
      },
      q2: function(){
        var idx; do { idx = randInt(0, POOL_PAIRS.length-1); } while(idx === lastPair);
        lastPair = idx;
        var n1 = POOL_PAIRS[idx][0], n2 = POOL_PAIRS[idx][1];
        return { n1:n1, n2:n2, gcd: gcdOf(n1,n2), lcm: lcmOf(n1,n2) };
      },
      q3: function(){
        var items = shuffle(POOL_ARITH).slice(0,3);
        return { items: items };
      },
      q4: function(){
        var keys = shuffle(['A','B','C','D','E']).slice(0,2);
        var items = keys.map(function(k){ return C4_PATTERNS[k](); });
        return { items: items };
      },
      q5: function(){
        var n = pick(SQRT_CANDIDATES);
        var sqrtN = Math.sqrt(n);
        var m; do { m = randInt(-6,6); } while(m === 0);
        var k = m*m*m;
        return { n:n, sqrtN:sqrtN, m:m, k:k };
      },
      q6: function(){
        var base1 = pick(POWER_BASES), m1=randInt(2,9), n1=randInt(2,9);
        var base2 = pick(POWER_BASES), m2=randInt(5,12), n2=randInt(2, m2-1);
        var base3 = pick(POWER_BASES), m3=randInt(2,6), n3=randInt(2,5);
        return {
          mul: { base:base1, m:m1, n:n1, ans:m1+n1 },
          div: { base:base2, m:m2, n:n2, ans:m2-n2 },
          pow: { base:base3, m:m3, n:n3, ans:m3*n3 }
        };
      },
      q7: function(){
        var neg = -randInt(1,50);
        var nat1 = randInt(1,50);
        var nat2; do { nat2 = randInt(1,50); } while(nat2 === nat1);
        var decInt = randInt(1,12);
        var fb = pick([3,4,5,7]);
        var fa; do { fa = randInt(1, fb-1); } while(gcdOf(fa,fb) !== 1);
        var nums = [
          { value: neg, label: '−' + Math.abs(neg) },
          { value: decInt + 0.5, label: decInt + ',5' },
          { value: fa/fb, label: fa + '/' + fb },
          { value: nat1, label: String(nat1) },
          { value: nat2, label: String(nat2) }
        ];
        return { numbers7: shuffle(nums) };
      }
    }
  };

  /* ---- helpers shared by explain functions ---- */
  function formatFactorization(f) {
    return Object.keys(f).sort(function(a,b){ return a-b; }).map(function(k){ return k + (f[k]>1 ? sup(f[k]) : ''); }).join(' × ');
  }
  function showDivisionSteps(n) {
    var steps = [], x = n, d = 2;
    while (d * d <= x) {
      while (x % d === 0) { steps.push(x + ' ÷ ' + d + ' = ' + (x/d)); x = x / d; }
      d++;
    }
    if (x > 1) steps.push(x + ' là số nguyên tố');
    return steps;
  }
  function gcdExplanation(f1, f2) {
    var allPrimes = {};
    Object.keys(f1).forEach(function(p){ allPrimes[p] = true; });
    Object.keys(f2).forEach(function(p){ allPrimes[p] = true; });
    var commonParts = [];
    Object.keys(allPrimes).sort(function(a,b){return a-b;}).forEach(function(p){
      if (f1[p] && f2[p]) {
        var minExp = Math.min(f1[p], f2[p]);
        commonParts.push(p + (minExp > 1 ? sup(minExp) : ''));
      }
    });
    return commonParts.length > 0 ? commonParts.join(' × ') : '1';
  }
  function lcmExplanation(f1, f2) {
    var merged = {};
    Object.keys(f1).forEach(function(p){ merged[p] = f1[p]; });
    Object.keys(f2).forEach(function(p){ merged[p] = Math.max(merged[p] || 0, f2[p]); });
    return Object.keys(merged).sort(function(a,b){return a-b;}).map(function(p){
      return p + (merged[p] > 1 ? sup(merged[p]) : '');
    }).join(' × ');
  }
  function signStr(n) { return n < 0 ? '(' + n + ')' : '' + n; }

  Chuong1Generators.basic.explain = {
    q1: function(d) {
      var steps1 = showDivisionSteps(d.n1);
      var steps2 = showDivisionSteps(d.n2);
      return '<p><b>Bước 1 — Phân tích ra thừa số nguyên tố:</b></p>' +
             '<p>• ' + d.n1 + ':<br>' + steps1.map(function(s,i){ return '&nbsp;&nbsp;' + s; }).join('<br>') +
             '<br>&nbsp;&nbsp;⟹ ' + d.n1 + ' = ' + formatFactorization(d.f1) + '</p>' +
             '<p>• ' + d.n2 + ':<br>' + steps2.map(function(s,i){ return '&nbsp;&nbsp;' + s; }).join('<br>') +
             '<br>&nbsp;&nbsp;⟹ ' + d.n2 + ' = ' + formatFactorization(d.f2) + '</p>' +
             '<p><b>Bước 2 — Tìm ƯCLN:</b></p>' +
             '<p>ƯCLN = tích các thừa số nguyên tố <i>chung</i> với số mũ <i>nhỏ nhất</i>.<br>' +
             'ƯCLN(' + d.n1 + ', ' + d.n2 + ') = ' + gcdExplanation(d.f1, d.f2) + ' = <b>' + d.gcd + '</b>.</p>' +
             '<p><b>Bước 3 — Tìm BCNN:</b></p>' +
             '<p>BCNN = tích các thừa số nguyên tố <i>chung và riêng</i> với số mũ <i>lớn nhất</i>.<br>' +
             'BCNN(' + d.n1 + ', ' + d.n2 + ') = ' + lcmExplanation(d.f1, d.f2) + ' = <b>' + d.lcm + '</b>.</p>';
    },
    q2: function(d) {
      var k2 = d.k * d.k;
      return '<p><b>Bài toán:</b> Tìm x biết x² = ' + k2 + '.</p>' +
             '<p><b>Lời giải:</b></p>' +
             '<p>• Ta cần tìm số nào bình phương bằng ' + k2 + '.</p>' +
             '<p>• Thử: ' + d.k + '² = ' + d.k + ' × ' + d.k + ' = ' + k2 + ' ✓</p>' +
             '<p>• Nhưng: (−' + d.k + ')² = (−' + d.k + ') × (−' + d.k + ') = ' + k2 + ' ✓ (âm nhân âm bằng dương)</p>' +
             '<p>⟹ <b>x = ' + d.k + '</b> hoặc <b>x = −' + d.k + '</b>.</p>' +
             '<p><i>Quy tắc: x² = a (a > 0) luôn có hai nghiệm: x = √a và x = −√a.</i></p>';
    },
    q3: function(d) {
      var b = d.base, c = d.c3;
      return '<p><b>Áp dụng các quy tắc lũy thừa cùng cơ số ' + b + ':</b></p>' +
             '<p><b>a)</b> ' + b + sup(c.p1a) + ' × ' + b + sup(c.p2a) + '</p>' +
             '<p>&nbsp;&nbsp;Quy tắc: aᵐ × aⁿ = aᵐ⁺ⁿ (nhân → cộng số mũ)</p>' +
             '<p>&nbsp;&nbsp;= ' + b + '^(' + c.p1a + ' + ' + c.p2a + ') = <b>' + b + sup(c.ansA) + '</b></p>' +
             '<p><b>b)</b> ' + b + sup(c.p1b) + ' ÷ ' + b + sup(c.p2b) + '</p>' +
             '<p>&nbsp;&nbsp;Quy tắc: aᵐ ÷ aⁿ = aᵐ⁻ⁿ (chia → trừ số mũ)</p>' +
             '<p>&nbsp;&nbsp;= ' + b + '^(' + c.p1b + ' − ' + c.p2b + ') = <b>' + b + sup(c.ansB) + '</b></p>' +
             '<p><b>c)</b> (' + b + sup(c.p1c) + ')' + sup(c.p2c) + '</p>' +
             '<p>&nbsp;&nbsp;Quy tắc: (aᵐ)ⁿ = aᵐˣⁿ (lũy thừa của lũy thừa → nhân số mũ)</p>' +
             '<p>&nbsp;&nbsp;= ' + b + '^(' + c.p1c + ' × ' + c.p2c + ') = <b>' + b + sup(c.ansC) + '</b></p>' +
             '<p><b>d)</b> ' + b + sup(c.p1d) + ' ÷ ' + b + ' × ' + b + sup(0) + '</p>' +
             '<p>&nbsp;&nbsp;Nhớ rằng ' + b + ' = ' + b + '¹ và ' + b + '⁰ = 1.</p>' +
             '<p>&nbsp;&nbsp;= ' + b + '^(' + c.p1d + ' − 1) × 1 = <b>' + b + sup(c.ansD) + '</b></p>';
    },
    q4: function(d) {
      var c = d.c4;
      var diff = c.c - c.d;
      var mulResult = c.sqrtB * diff;
      return '<p><b>Biểu thức:</b> ' + c.a + '² + √' + c.b + ' × (' + c.c + ' − ' + c.d + ')</p>' +
             '<p><b>Bước 1 — Tính lũy thừa:</b> ' + c.a + '² = ' + c.a + ' × ' + c.a + ' = ' + (c.a*c.a) + '</p>' +
             '<p><b>Bước 2 — Tính căn bậc hai:</b> √' + c.b + ' = ' + c.sqrtB + ' (vì ' + c.sqrtB + ' × ' + c.sqrtB + ' = ' + c.b + ')</p>' +
             '<p><b>Bước 3 — Tính trong ngoặc:</b> ' + c.c + ' − ' + c.d + ' = ' + diff + '</p>' +
             '<p><b>Bước 4 — Nhân:</b> ' + c.sqrtB + ' × ' + signStr(diff) + ' = ' + mulResult + '</p>' +
             '<p><b>Bước 5 — Cộng:</b> ' + (c.a*c.a) + ' + ' + signStr(mulResult) + ' = <b>' + c.result + '</b></p>';
    },
    q5: function(d) {
      var lines = d.numbers5.map(function(n) {
        var sets = [];
        if (Number.isInteger(n.value) && n.value >= 0) sets.push('N', 'Z', 'Q');
        else if (Number.isInteger(n.value) && n.value < 0) sets.push('Z', 'Q');
        else sets.push('Q');
        return '<li>' + n.label + ' ∈ ' + sets.join(', ') +
               (sets.length === 3 ? ' (số tự nhiên → thuộc cả ba tập)' :
                sets.length === 2 ? ' (số nguyên âm → thuộc Z và Q, không thuộc N)' :
                ' (số thập phân/phân số → chỉ thuộc Q)') + '</li>';
      });
      return '<p><b>Phân loại từng số vào các tập hợp:</b></p>' +
             '<p>• <b>N</b> (Số tự nhiên) = {0, 1, 2, 3, ...}</p>' +
             '<p>• <b>Z</b> (Số nguyên) = {..., −2, −1, 0, 1, 2, ...}</p>' +
             '<p>• <b>Q</b> (Số hữu tỉ) = các số viết được dạng a/b (b ≠ 0)</p>' +
             '<p>Quan hệ: N ⊂ Z ⊂ Q (mọi số tự nhiên cũng là số nguyên, cũng là số hữu tỉ).</p>' +
             '<ul>' + lines.join('') + '</ul>';
    }
  };

  Chuong1Generators.tiet.explain = {
    q1: function(d) {
      var steps1 = showDivisionSteps(d.n1);
      return '<p><b>Bước 1 — Phân tích ' + d.n1 + ' ra thừa số nguyên tố:</b></p>' +
             '<p>' + steps1.map(function(s){ return '&nbsp;&nbsp;' + s; }).join('<br>') +
             '<br>&nbsp;&nbsp;⟹ ' + d.n1 + ' = ' + formatFactorization(d.f1) + '</p>' +
             '<p><b>Bước 2 — Tìm các ước nguyên tố của ' + d.n2 + ':</b></p>' +
             '<p>Ước nguyên tố là các số nguyên tố mà ' + d.n2 + ' chia hết cho chúng.</p>' +
             '<p>Các ước nguyên tố của ' + d.n2 + ' là: <b>' + d.primes2.join(', ') + '</b>.</p>';
    },
    q2: function(d) {
      var f1 = factorize(d.n1), f2 = factorize(d.n2);
      var steps1 = showDivisionSteps(d.n1);
      var steps2 = showDivisionSteps(d.n2);
      return '<p><b>Bước 1 — Phân tích ra thừa số nguyên tố:</b></p>' +
             '<p>• ' + d.n1 + ':<br>' + steps1.map(function(s){ return '&nbsp;&nbsp;' + s; }).join('<br>') +
             '<br>&nbsp;&nbsp;⟹ ' + d.n1 + ' = ' + formatFactorization(f1) + '</p>' +
             '<p>• ' + d.n2 + ':<br>' + steps2.map(function(s){ return '&nbsp;&nbsp;' + s; }).join('<br>') +
             '<br>&nbsp;&nbsp;⟹ ' + d.n2 + ' = ' + formatFactorization(f2) + '</p>' +
             '<p><b>Bước 2 — ƯCLN</b> (thừa số chung, mũ nhỏ nhất):<br>' +
             'ƯCLN(' + d.n1 + ', ' + d.n2 + ') = ' + gcdExplanation(f1, f2) + ' = <b>' + d.gcd + '</b></p>' +
             '<p><b>Bước 3 — BCNN</b> (tất cả thừa số, mũ lớn nhất):<br>' +
             'BCNN(' + d.n1 + ', ' + d.n2 + ') = ' + lcmExplanation(f1, f2) + ' = <b>' + d.lcm + '</b></p>';
    },
    q3: function(d) {
      var lines = d.items.map(function(it) {
        var a = it.a, b = it.b, op = it.op;
        var rule = '';
        if (op === '×') {
          if ((a < 0 && b < 0) || (a > 0 && b > 0)) rule = 'cùng dấu → kết quả dương';
          else rule = 'khác dấu → kết quả âm';
        } else {
          if ((a < 0 && b < 0) || (a > 0 && b > 0)) rule = 'cùng dấu → kết quả dương';
          else rule = 'khác dấu → kết quả âm';
        }
        return '<li>' + a + ' ' + op + ' (' + b + ')<br>' +
               '&nbsp;&nbsp;Quy tắc: ' + rule + '<br>' +
               '&nbsp;&nbsp;|' + a + '| ' + op + ' |' + b + '| = ' + Math.abs(a) + ' ' + op + ' ' + Math.abs(b) + ' = ' + Math.abs(it.result) + '<br>' +
               '&nbsp;&nbsp;⟹ Kết quả: <b>' + it.result + '</b></li>';
      });
      return '<p><b>Quy tắc nhân/chia số nguyên:</b></p>' +
             '<p>• Cùng dấu → kết quả dương. Khác dấu → kết quả âm.</p>' +
             '<ul>' + lines.join('') + '</ul>';
    },
    q4: function(d) {
      var lines = d.items.map(function(it, i) {
        return '<p><b>' + String.fromCharCode(97+i) + ')</b> ' + it.prompt + '</p>' +
               '<p>&nbsp;&nbsp;Thực hiện theo thứ tự: ngoặc → lũy thừa/căn → nhân chia → cộng trừ.</p>' +
               '<p>&nbsp;&nbsp;= <b>' + it.result + '</b></p>';
      });
      return '<p><b>Quy tắc thứ tự thực hiện phép tính:</b> Ngoặc → Lũy thừa/Căn → Nhân/Chia → Cộng/Trừ.</p>' +
             lines.join('');
    },
    q5: function(d) {
      return '<p><b>a) Căn bậc hai số học của ' + d.n + ':</b></p>' +
             '<p>&nbsp;&nbsp;√' + d.n + ' = ? nghĩa là tìm số a ≥ 0 sao cho a² = ' + d.n + '.</p>' +
             '<p>&nbsp;&nbsp;Thử: ' + d.sqrtN + '² = ' + d.sqrtN + ' × ' + d.sqrtN + ' = ' + d.n + ' ✓</p>' +
             '<p>&nbsp;&nbsp;⟹ √' + d.n + ' = <b>' + d.sqrtN + '</b></p>' +
             '<p><b>b) Tìm x biết x³ = ' + d.k + ':</b></p>' +
             '<p>&nbsp;&nbsp;Ta cần tìm số nào lập phương bằng ' + d.k + '.</p>' +
             '<p>&nbsp;&nbsp;Thử: ' + signStr(d.m) + '³ = ' + signStr(d.m) + ' × ' + signStr(d.m) + ' × ' + signStr(d.m) + ' = ' + d.k + ' ✓</p>' +
             '<p>&nbsp;&nbsp;⟹ x = <b>' + d.m + '</b></p>';
    },
    q6: function(d) {
      var m = d.mul, dv = d.div, p = d.pow;
      return '<p><b>Áp dụng các quy tắc lũy thừa:</b></p>' +
             '<p><b>a)</b> ' + m.base + sup(m.m) + ' × ' + m.base + sup(m.n) + '</p>' +
             '<p>&nbsp;&nbsp;Quy tắc: aᵐ × aⁿ = aᵐ⁺ⁿ</p>' +
             '<p>&nbsp;&nbsp;= ' + m.base + '^(' + m.m + ' + ' + m.n + ') = <b>' + m.base + sup(m.ans) + '</b></p>' +
             '<p><b>b)</b> ' + dv.base + sup(dv.m) + ' ÷ ' + dv.base + sup(dv.n) + '</p>' +
             '<p>&nbsp;&nbsp;Quy tắc: aᵐ ÷ aⁿ = aᵐ⁻ⁿ</p>' +
             '<p>&nbsp;&nbsp;= ' + dv.base + '^(' + dv.m + ' − ' + dv.n + ') = <b>' + dv.base + sup(dv.ans) + '</b></p>' +
             '<p><b>c)</b> (' + p.base + sup(p.m) + ')' + sup(p.n) + '</p>' +
             '<p>&nbsp;&nbsp;Quy tắc: (aᵐ)ⁿ = aᵐˣⁿ</p>' +
             '<p>&nbsp;&nbsp;= ' + p.base + '^(' + p.m + ' × ' + p.n + ') = <b>' + p.base + sup(p.ans) + '</b></p>';
    },
    q7: function(d) {
      var lines = d.numbers7.map(function(n) {
        var sets = [];
        if (Number.isInteger(n.value) && n.value >= 0) sets.push('N', 'Z', 'Q');
        else if (Number.isInteger(n.value) && n.value < 0) sets.push('Z', 'Q');
        else sets.push('Q');
        return '<li>' + n.label + ' ∈ ' + sets.join(', ') + '</li>';
      });
      return '<p><b>Phân loại:</b> N ⊂ Z ⊂ Q.</p>' +
             '<ul>' + lines.join('') + '</ul>';
    }
  };

  window.Chuong1Generators = Chuong1Generators;
})();

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

  window.Chuong1Generators = Chuong1Generators;
})();

/* Chuẩn hoá & so sánh input toán học của học sinh — dùng chung cho logic.js
   và logic-1tiet.js khi chấm điểm, để tránh chấm sai khi học sinh gõ đúng
   nhưng khác cú pháp mong đợi (dấu mũ ^, dấu nhân x/×/*, dấu trừ Unicode,
   dấu thập phân , hay ., thứ tự các thừa số...).
   Không đụng DOM — chỉ nhận string và trả về giá trị/kết quả so sánh. */
(function(){
  var MathEvaluator = {};

  var SUP_TO_DIGIT = {'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9'};
  /* U+2212 (dấu trừ toán học), en dash, em dash — bàn phím điện thoại/gõ tiếng Việt
     hay chèn các ký tự này thay vì dấu gạch ngang ASCII "-". */
  var MINUS_VARIANTS = /[−–—]/g;
  /* Các ký hiệu phép nhân học sinh có thể gõ: x, X, ×, *, · (middle dot), ⋅ (dot operator). */
  var MULT_VARIANTS = /[x×X*·⋅]/g;

  function normalizeMinus(str){
    return String(str).replace(MINUS_VARIANTS, '-');
  }

  /* Số thập phân: chấp nhận cả dấu phẩy (kiểu Việt Nam) và dấu chấm. */
  function num(str){
    if(str===null || str===undefined) return NaN;
    str = normalizeMinus(str).trim().replace(',', '.');
    return parseFloat(str);
  }

  /* "2^2 x 3 x 5", "2² × 3² . 5", "2^2*3*5" ... -> { 2:2, 3:1, 5:1 }
     Thứ tự các thừa số không quan trọng vì kết quả là 1 map theo cơ số. */
  function parseFactorization(str){
    if(!str) return {};
    str = normalizeMinus(str).toLowerCase().replace(/\s+/g,'');
    str = str.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, function(m){ return '^' + SUP_TO_DIGIT[m]; });
    var tokens = str.replace(MULT_VARIANTS, ' ').split(' ').filter(Boolean);
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

  /* "8, -8" / "8 ; −8" -> [8, -8] — dùng cho câu hỏi nhiều đáp số cách nhau bằng dấu phẩy. */
  function parseNumberSet(str){
    if(!str) return [];
    str = normalizeMinus(str);
    var matches = str.match(/-?\d+(\.\d+)?/g) || [];
    var out = [];
    matches.forEach(function(m){
      var v = parseFloat(m);
      if(!isNaN(v) && out.indexOf(v) === -1) out.push(v);
    });
    return out;
  }

  function sameNumberSet(a,b,eps){
    eps = eps===undefined ? 1e-9 : eps;
    if(a.length!==b.length) return false;
    var sa=a.slice().sort(function(x,y){return x-y;});
    var sb=b.slice().sort(function(x,y){return x-y;});
    return sa.every(function(v,i){ return Math.abs(v-sb[i]) < eps; });
  }

  function sameIndexSet(a,b){
    if(a.length!==b.length) return false;
    var sa=a.slice().sort(); var sb=b.slice().sort();
    return sa.every(function(v,i){return v===sb[i];});
  }

  /* Phân loại một giá trị số vào tập nhỏ nhất mà nó thuộc về: N, Z hay Q. */
  function regionOf(v){
    if(Number.isInteger(v) && v >= 0) return 'N';
    if(Number.isInteger(v)) return 'Z';
    return 'Q';
  }

  MathEvaluator.num = num;
  MathEvaluator.normalizeMinus = normalizeMinus;
  MathEvaluator.parseFactorization = parseFactorization;
  MathEvaluator.factorizationMatches = factorizationMatches;
  MathEvaluator.parseNumberSet = parseNumberSet;
  MathEvaluator.sameNumberSet = sameNumberSet;
  MathEvaluator.sameIndexSet = sameIndexSet;
  MathEvaluator.regionOf = regionOf;

  window.MathEvaluator = MathEvaluator;
})();

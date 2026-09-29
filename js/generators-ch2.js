(function(){
  var Chuong2Generators = {};

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

  // q1: Tính giá trị biểu thức
  // a) m*a - n*b khi a=A, b=B
  // b) c*x^2 + d*x khi x=X
  var q1_gen = function() {
    var a1 = randInt(2, 7), b1 = randInt(2, 5);
    var A = randInt(2, 5), B = randInt(2, 5);
    var ans1 = a1 * A - b1 * B;
    
    var c = randInt(2, 5), d = randInt(2, 5);
    var X = randInt(2, 5);
    var ans2 = c * X * X + d * X;

    return {
      a1: a1, b1: b1, A: A, B: B, ans1: ans1,
      c: c, d: d, X: X, ans2: ans2
    };
  };

  // q2: Nối phát biểu lời văn (giỏ m quả táo)
  var q2_gen = function() {
    var num1 = randInt(3, 9);
    var num2 = randInt(3, 9);
    var pairs = [
      { text: "Cho thêm " + num1 + " quả táo vào giỏ", expr: "m + " + num1 },
      { text: "Gấp đôi số quả táo trong giỏ", expr: "2m" },
      { text: "Bớt " + num2 + " quả táo trong giỏ", expr: "m - " + num2 },
      { text: "Giảm một nửa số quả táo trong giỏ", expr: "m / 2" }
    ];
    return {
      left: shuffle(pairs.map(function(p, i) { return { id: 'A'+i, text: p.text, originalIndex: i }; })),
      right: shuffle(pairs.map(function(p, i) { return { id: 'B'+i, expr: p.expr, originalIndex: i }; }))
    };
  };

  // q3: Viết biểu thức từ lời văn
  var q3_gen = function() {
    var typesA = [
      function() { var k=randInt(2,5), m=randInt(2,9); return { p: "Chia số đó cho " + k + " rồi cộng " + m + ".", ans: ["x/" + k + "+" + m, "1/" + k + "x+" + m], ansAlt: "x/" + k + " + " + m }; },
      function() { var k=randInt(2,5), m=randInt(2,9); return { p: "Nhân số đó với " + k + " rồi trừ đi " + m + ".", ans: [k + "x-" + m], ansAlt: k + "x - " + m }; },
      function() { var k=randInt(2,9), m=randInt(2,5); return { p: "Cộng số đó với " + k + " rồi chia cho " + m + ".", ans: ["(x+" + k + ")/" + m, "1/" + m + "(x+" + k + ")"], ansAlt: "(x + " + k + ")/" + m }; },
      function() { var k=randInt(2,9), m=randInt(2,5); return { p: "Trừ số đó đi " + k + " rồi nhân với " + m + ".", ans: [m + "(x-" + k + ")", "(x-" + k + ")" + m, "(x-" + k + ")*" + m, "(x-" + k + ")x" + m, m + "*(x-" + k + ")", m + "x(x-" + k + ")"], ansAlt: m + "(x - " + k + ")" }; }
    ];
    var typesB = [
      function() { var p=randInt(10,30), q=randInt(2,7); return { p: "Lấy " + p + " trừ đi " + q + " lần số đó.", ans: [p + "-" + q + "x"], ansAlt: p + " - " + q + "x" }; },
      function() { var p=randInt(2,9), q=randInt(10,30); return { p: "Lấy " + p + " lần số đó trừ đi " + q + ".", ans: [p + "x-" + q], ansAlt: p + "x - " + q }; },
      function() { var p=randInt(2,9), q=randInt(2,9); return { p: "Lấy tổng của số đó và " + p + " nhân với " + q + ".", ans: [q + "(x+" + p + ")", "(x+" + p + ")" + q, "(x+" + p + ")*" + q, "(x+" + p + ")x" + q, q + "*(x+" + p + ")", q + "x(x+" + p + ")"], ansAlt: q + "(x + " + p + ")" }; },
      function() { var p=randInt(2,9); return { p: "Bình phương của tổng số đó và " + p + ".", ans: ["(x+" + p + ")^2", "(x+" + p + ")*(x+" + p + ")"], ansAlt: "(x + " + p + ")²" }; }
    ];
    
    var a = typesA[randInt(0, typesA.length - 1)]();
    var b = typesB[randInt(0, typesB.length - 1)]();
    
    return { a: a, b: b };
  };

  // q4: Phân tích thành nhân tử (đặt nhân tử chung)
  var q4_gen = function() {
    var k1 = randInt(2, 6), a1 = randInt(2, 5), b1 = randInt(3, 7);
    if(a1 === b1) b1++; // prevent same
    var c2 = randInt(2, 5), d2 = randInt(2, 5);
    var k3 = randInt(2, 5), e3 = randInt(2, 4), f3 = randInt(2, 4), g3 = randInt(3, 6);
    return {
      a_factor: k1, a_term1: k1*a1, a_term2: k1*b1, a1: a1, b1: b1,
      b_factor: c2, b_term1: c2, b_term2: c2*d2, d2: d2,
      c_factor: k3, c_term1: k3*e3, c_term2: k3*f3, c_term3: k3*g3, e3: e3, f3: f3, g3: g3
    };
  };

  // q5: Khai triển và thu gọn biểu thức
  var q5_gen = function() {
    var a1 = randInt(2, 5), b1 = randInt(2, 5), c1 = randInt(2, 7);
    var a2 = randInt(2, 4), b2 = randInt(2, 4), c2 = randInt(2, 5);
    var d2 = randInt(2, 4), e2 = randInt(2, 4), f2 = randInt(2, 5);
    
    var a3 = randInt(2, 5), b3 = randInt(2, 4), c3 = randInt(2, 5);
    var d3 = randInt(2, 4), e3 = randInt(2, 4), f3 = randInt(2, 5);

    return {
      a: { a: a1, b: b1, c: c1, ans_x: a1*b1, ans_num: -a1*c1 },
      b: { a: a2, b: b2, c: c2, d: d2, e: e2, f: f2, ans_x: a2*b2 + d2*e2, ans_num: a2*c2 + d2*f2 },
      c: { a: a3, b: b3, c: c3, d: d3, e: e3, f: f3, ans_x: a3*b3 - d3*e3, ans_num: a3*c3 - d3*f3 }
    };
  };

  // q6: Lập công thức biểu diễn chữ x (biến đổi công thức)
  var q6_gen = function() {
    var A = randInt(5, 15);
    var B = randInt(5, 15);
    var pairs = [
      { left: "y = x + " + A, right: "x = y - " + A },
      { left: "y = px", right: "x = y / p" },
      { left: "y = x - " + B, right: "x = y + " + B },
      { left: "y = x / q", right: "x = yq" }
    ];
    return {
      left: shuffle(pairs.map(function(p, i) { return { id: 'L'+i, text: p.left, originalIndex: i }; })),
      right: shuffle(pairs.map(function(p, i) { return { id: 'R'+i, text: p.right, originalIndex: i }; }))
    };
  };

  // q7: Đa thức một biến (thu gọn, tìm bậc) - Practice only
  var q7_gen = function() {
    var a = randInt(2, 5), d = randInt(2, 5);
    var b = randInt(2, 6), e = randInt(2, 6);
    var c = randInt(2, 7), f = randInt(2, 9);
    var ans_x3 = a + d;
    var ans_x2 = b - e;
    return {
      a: a, b: b, c: c, d: d, e: e, f: f,
      ans_x3: ans_x3, ans_x2: ans_x2, ans_x: -c, ans_num: f
    };
  };

  // q8: Phép chia đa thức cho đơn thức - Practice only
  var q8_gen = function() {
    var k = randInt(2, 5);
    var a = randInt(2, 5) * k;
    var b = randInt(2, 6) * k;
    var c = randInt(2, 7) * k;
    return {
      k: k, a: a, b: b, c: c,
      ans_x2: a/k, ans_x: b/k, ans_num: c/k
    };
  };

  // q9: Tìm x - Practice only
  var q9_gen = function() {
    var A = randInt(2, 6);
    var x = randInt(2, 9);
    var B = randInt(2, 10);
    var C = A * x + B;
    return { A: A, B: B, C: C, ans: x };
  };

  Chuong2Generators.basic = {
    maxPoints: { 1: 2, 2: 2, 3: 1, 4: 1.5, 5: 1.5, 6: 2, 7: 1, 8: 1, 9: 1 },
    gen: {
      q1: q1_gen, q2: q2_gen, q3: q3_gen, q4: q4_gen,
      q5: q5_gen, q6: q6_gen, q7: q7_gen, q8: q8_gen, q9: q9_gen
    }
  };

  window.Chuong2Generators = Chuong2Generators;
})();

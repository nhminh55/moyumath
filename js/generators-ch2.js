(function () {
  var Chuong2Generators = {};

  function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function pick(arr) { return arr[randInt(0, arr.length - 1)]; }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = randInt(0, i);
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // q1: Tính giá trị biểu thức
  // a) m*a - n*b khi a=A, b=B
  // b) c*x^2 + d*x khi x=X
  var q1_gen = function () {
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
  var q2_gen = function () {
    var num1 = randInt(3, 9);
    var num2 = randInt(3, 9);
    var pairs = [
      { text: "Cho thêm " + num1 + " quả táo vào giỏ", expr: "m + " + num1 },
      { text: "Gấp đôi số quả táo trong giỏ", expr: "2m" },
      { text: "Bớt " + num2 + " quả táo trong giỏ", expr: "m - " + num2 },
      { text: "Giảm một nửa số quả táo trong giỏ", expr: "m / 2" }
    ];
    return {
      left: shuffle(pairs.map(function (p, i) { return { id: 'A' + i, text: p.text, originalIndex: i }; })),
      right: shuffle(pairs.map(function (p, i) { return { id: 'B' + i, expr: p.expr, originalIndex: i }; }))
    };
  };

  // q3: Viết biểu thức từ lời văn
  var q3_gen = function () {
    var typesA = [
      function () { var k = randInt(2, 5), m = randInt(2, 9); return { p: "Chia số đó cho " + k + " rồi cộng " + m + ".", ans: ["x/" + k + "+" + m, "1/" + k + "x+" + m], ansAlt: "x/" + k + " + " + m }; },
      function () { var k = randInt(2, 5), m = randInt(2, 9); return { p: "Nhân số đó với " + k + " rồi trừ đi " + m + ".", ans: [k + "x-" + m], ansAlt: k + "x - " + m }; },
      function () { var k = randInt(2, 9), m = randInt(2, 5); return { p: "Cộng số đó với " + k + " rồi chia cho " + m + ".", ans: ["(x+" + k + ")/" + m, "1/" + m + "(x+" + k + ")"], ansAlt: "(x + " + k + ")/" + m }; },
      function () { var k = randInt(2, 9), m = randInt(2, 5); return { p: "Trừ số đó đi " + k + " rồi nhân với " + m + ".", ans: [m + "(x-" + k + ")", "(x-" + k + ")" + m, "(x-" + k + ")*" + m, "(x-" + k + ")x" + m, m + "*(x-" + k + ")", m + "x(x-" + k + ")"], ansAlt: m + "(x - " + k + ")" }; }
    ];
    var typesB = [
      function () { var p = randInt(10, 30), q = randInt(2, 7); return { p: "Lấy " + p + " trừ đi " + q + " lần số đó.", ans: [p + "-" + q + "x"], ansAlt: p + " - " + q + "x" }; },
      function () { var p = randInt(2, 9), q = randInt(10, 30); return { p: "Lấy " + p + " lần số đó trừ đi " + q + ".", ans: [p + "x-" + q], ansAlt: p + "x - " + q }; },
      function () { var p = randInt(2, 9), q = randInt(2, 9); return { p: "Lấy tổng của số đó và " + p + " nhân với " + q + ".", ans: [q + "(x+" + p + ")", "(x+" + p + ")" + q, "(x+" + p + ")*" + q, "(x+" + p + ")x" + q, q + "*(x+" + p + ")", q + "x(x+" + p + ")"], ansAlt: q + "(x + " + p + ")" }; },
      function () { var p = randInt(2, 9); return { p: "Bình phương của tổng số đó và " + p + ".", ans: ["(x+" + p + ")^2", "(x+" + p + ")*(x+" + p + ")"], ansAlt: "(x + " + p + ")²" }; }
    ];

    var a = typesA[randInt(0, typesA.length - 1)]();
    var b = typesB[randInt(0, typesB.length - 1)]();

    return { a: a, b: b };
  };

  // q4: Phân tích thành nhân tử (đặt nhân tử chung)
  var q4_gen = function () {
    var k1 = randInt(2, 6), a1 = randInt(2, 5), b1 = randInt(3, 7);
    if (a1 === b1) b1++; // prevent same
    var c2 = randInt(2, 5), d2 = randInt(2, 5);
    var k3 = randInt(2, 5), e3 = randInt(2, 4), f3 = randInt(2, 4), g3 = randInt(3, 6);
    return {
      a_factor: k1, a_term1: k1 * a1, a_term2: k1 * b1, a1: a1, b1: b1,
      b_factor: c2, b_term1: c2, b_term2: c2 * d2, d2: d2,
      c_factor: k3, c_term1: k3 * e3, c_term2: k3 * f3, c_term3: k3 * g3, e3: e3, f3: f3, g3: g3
    };
  };

  // q5: Khai triển và thu gọn biểu thức
  var q5_gen = function () {
    var a1 = randInt(2, 5), b1 = randInt(2, 5), c1 = randInt(2, 7);
    var a2 = randInt(2, 4), b2 = randInt(2, 4), c2 = randInt(2, 5);
    var d2 = randInt(2, 4), e2 = randInt(2, 4), f2 = randInt(2, 5);

    var a3 = randInt(2, 5), b3 = randInt(2, 4), c3 = randInt(2, 5);
    var d3 = randInt(2, 4), e3 = randInt(2, 4), f3 = randInt(2, 5);

    return {
      a: { a: a1, b: b1, c: c1, ans_x: a1 * b1, ans_num: -a1 * c1 },
      b: { a: a2, b: b2, c: c2, d: d2, e: e2, f: f2, ans_x: a2 * b2 + d2 * e2, ans_num: a2 * c2 + d2 * f2 },
      c: { a: a3, b: b3, c: c3, d: d3, e: e3, f: f3, ans_x: a3 * b3 - d3 * e3, ans_num: a3 * c3 - d3 * f3 }
    };
  };

  // q6: Lập công thức biểu diễn chữ x (biến đổi công thức)
  var q6_gen = function () {
    var A = randInt(5, 15);
    var B = randInt(5, 15);
    var pairs = [
      { left: "y = x + " + A, right: "x = y - " + A },
      { left: "y = px", right: "x = y / p" },
      { left: "y = x - " + B, right: "x = y + " + B },
      { left: "y = x / q", right: "x = yq" }
    ];
    return {
      left: shuffle(pairs.map(function (p, i) { return { id: 'L' + i, text: p.left, originalIndex: i }; })),
      right: shuffle(pairs.map(function (p, i) { return { id: 'R' + i, text: p.right, originalIndex: i }; }))
    };
  };

  // q7: Đa thức một biến (thu gọn, tìm bậc) - Practice only
  var q7_gen = function () {
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
  var q8_gen = function () {
    var k = randInt(2, 5);
    var a = randInt(2, 5) * k;
    var b = randInt(2, 6) * k;
    var c = randInt(2, 7) * k;
    return {
      k: k, a: a, b: b, c: c,
      ans_x2: a / k, ans_x: b / k, ans_num: c / k
    };
  };

  // q9: Tìm x - Practice only
  var q9_gen = function () {
    var A = randInt(2, 6);
    var x = randInt(2, 9);
    var B = randInt(2, 10);
    var C = A * x + B;
    return { A: A, B: B, C: C, ans: x };
  };

  Chuong2Generators.basic = {
    maxPoints: { 1: 2, 2: 2, 3: 1, 4: 1.5, 5: 1.5, 6: 2, 7: 1.5, 8: 1, 9: 1 },
    gen: {
      q1: q1_gen, q2: q2_gen, q3: q3_gen, q4: q4_gen,
      q5: q5_gen, q6: q6_gen, q7: q7_gen, q8: q8_gen, q9: q9_gen
    }
  };

  Chuong2Generators.basic.explain = {
    q1: function (d) {
      return '<p><b>a) Tính ' + d.a1 + 'a − ' + d.b1 + 'b khi a = ' + d.A + ', b = ' + d.B + ':</b></p>' +
        '<p>&nbsp;&nbsp;Bước 1 — Thay số: ' + d.a1 + '·' + d.A + ' − ' + d.b1 + '·' + d.B + '</p>' +
        '<p>&nbsp;&nbsp;Bước 2 — Nhân: ' + (d.a1 * d.A) + ' − ' + (d.b1 * d.B) + '</p>' +
        '<p>&nbsp;&nbsp;Bước 3 — Trừ: = <b>' + d.ans1 + '</b></p>' +
        '<p><b>b) Tính ' + d.c + 'x² + ' + d.d + 'x khi x = ' + d.X + ':</b></p>' +
        '<p>&nbsp;&nbsp;Bước 1 — Thay số: ' + d.c + '·' + d.X + '² + ' + d.d + '·' + d.X + '</p>' +
        '<p>&nbsp;&nbsp;Bước 2 — Tính lũy thừa: ' + d.X + '² = ' + (d.X * d.X) + '</p>' +
        '<p>&nbsp;&nbsp;Bước 3 — Nhân: ' + d.c + '·' + (d.X * d.X) + ' + ' + d.d + '·' + d.X + ' = ' + (d.c * d.X * d.X) + ' + ' + (d.d * d.X) + '</p>' +
        '<p>&nbsp;&nbsp;Bước 4 — Cộng: = <b>' + d.ans2 + '</b></p>';
    },
    q2: function (d) {
      function byIdx(a) { return a.slice().sort(function (x, y) { return x.originalIndex - y.originalIndex; }); }
      var L = byIdx(d.left), R = byIdx(d.right);
      var why = [
        'từ khoá \"thêm\" → số lượng tăng → phép <b>cộng</b>',
        'từ khoá \"gấp đôi\" → lặp lại 2 lần → phép <b>nhân</b> với 2',
        'từ khoá \"bớt\" → số lượng giảm → phép <b>trừ</b>',
        'từ khoá \"một nửa\" → chia thành 2 phần bằng nhau → phép <b>chia</b> cho 2'
      ];
      var html = '<p><b>Gọi số quả táo ban đầu trong giỏ là m.</b> Nối từng phát biểu với biểu thức:</p>';
      for (var i = 0; i < L.length; i++) {
        html += '<p>' + (i + 1) + ') \"' + L[i].text + '\"</p>' +
          '<p>&nbsp;&nbsp;' + why[L[i].originalIndex] + '</p>' +
          '<p>&nbsp;&nbsp;⟹ nối với <b>' + R[i].expr + '</b></p>';
      }
      return html + '<p><i>Mẹo: đọc kỹ từ khoá (\"thêm\", \"bớt\", \"gấp\", \"nửa\") để chọn đúng phép tính.</i></p>';
    },
    q3: function (d) {
      return '<p><b>Viết biểu thức đại số từ lời văn (gọi "số đó" là x):</b></p>' +
        '<p><b>a)</b> "' + d.a.p + '"</p>' +
        '<p>&nbsp;&nbsp;Chuyển từng hành động thành phép tính theo đúng thứ tự:</p>' +
        '<p>&nbsp;&nbsp;⟹ Biểu thức: <b>' + d.a.ansAlt + '</b></p>' +
        '<p><b>b)</b> "' + d.b.p + '"</p>' +
        '<p>&nbsp;&nbsp;Chuyển từng hành động thành phép tính:</p>' +
        '<p>&nbsp;&nbsp;⟹ Biểu thức: <b>' + d.b.ansAlt + '</b></p>' +
        '<p><i>Lưu ý: "rồi" nghĩa là thực hiện theo thứ tự → có thể cần dấu ngoặc.</i></p>';
    },
    q4: function (d) {
      return '<p><b>Phân tích thành nhân tử bằng cách đặt nhân tử chung:</b></p>' +
        '<p><b>a)</b> ' + d.a_term1 + 'x + ' + d.a_term2 + 'y</p>' +
        '<p>&nbsp;&nbsp;Bước 1 — Tìm nhân tử chung: ƯCLN(' + d.a_term1 + ', ' + d.a_term2 + ') = ' + d.a_factor + '</p>' +
        '<p>&nbsp;&nbsp;Bước 2 — Chia từng hạng tử: ' + d.a_term1 + 'x ÷ ' + d.a_factor + ' = ' + d.a1 + 'x ; ' + d.a_term2 + 'y ÷ ' + d.a_factor + ' = ' + d.b1 + 'y</p>' +
        '<p>&nbsp;&nbsp;⟹ = <b>' + d.a_factor + '(' + d.a1 + 'x + ' + d.b1 + 'y)</b></p>' +
        '<p><b>b)</b> ' + d.b_term1 + 'x − ' + d.b_term2 + 'y</p>' +
        '<p>&nbsp;&nbsp;Nhân tử chung: ' + d.b_factor + '</p>' +
        '<p>&nbsp;&nbsp;⟹ = <b>' + d.b_factor + '(x − ' + d.d2 + 'y)</b></p>' +
        '<p><b>c)</b> ' + d.c_term1 + 'x + ' + d.c_term2 + 'y − ' + d.c_term3 + '</p>' +
        '<p>&nbsp;&nbsp;Nhân tử chung: ' + d.c_factor + '</p>' +
        '<p>&nbsp;&nbsp;⟹ = <b>' + d.c_factor + '(' + d.e3 + 'x + ' + d.f3 + 'y − ' + d.g3 + ')</b></p>';
    },
    q5: function (d) {
      return '<p><b>Khai triển bằng quy tắc nhân phân phối a(b + c) = ab + ac:</b></p>' +
        '<p><b>a)</b> ' + d.a.a + '(' + d.a.b + 'x − ' + d.a.c + ')</p>' +
        '<p>&nbsp;&nbsp;= ' + d.a.a + '·' + d.a.b + 'x + ' + d.a.a + '·(−' + d.a.c + ')</p>' +
        '<p>&nbsp;&nbsp;= ' + d.a.ans_x + 'x − ' + Math.abs(d.a.ans_num) + '</p>' +
        '<p><b>b)</b> ' + d.b.a + '(' + d.b.b + 'x + ' + d.b.c + ') + ' + d.b.d + '(' + d.b.e + 'x + ' + d.b.f + ')</p>' +
        '<p>&nbsp;&nbsp;Khai triển vế 1: ' + (d.b.a * d.b.b) + 'x + ' + (d.b.a * d.b.c) + '</p>' +
        '<p>&nbsp;&nbsp;Khai triển vế 2: ' + (d.b.d * d.b.e) + 'x + ' + (d.b.d * d.b.f) + '</p>' +
        '<p>&nbsp;&nbsp;Thu gọn: (' + (d.b.a * d.b.b) + ' + ' + (d.b.d * d.b.e) + ')x + (' + (d.b.a * d.b.c) + ' + ' + (d.b.d * d.b.f) + ')</p>' +
        '<p>&nbsp;&nbsp;= <b>' + d.b.ans_x + 'x + ' + d.b.ans_num + '</b></p>' +
        '<p><b>c)</b> ' + d.c.a + '(' + d.c.b + 'x + ' + d.c.c + ') − ' + d.c.d + '(' + d.c.e + 'x + ' + d.c.f + ')</p>' +
        '<p>&nbsp;&nbsp;Khai triển vế 1: ' + (d.c.a * d.c.b) + 'x + ' + (d.c.a * d.c.c) + '</p>' +
        '<p>&nbsp;&nbsp;Khai triển vế 2: −(' + (d.c.d * d.c.e) + 'x + ' + (d.c.d * d.c.f) + ') = −' + (d.c.d * d.c.e) + 'x − ' + (d.c.d * d.c.f) + '</p>' +
        '<p>&nbsp;&nbsp;Thu gọn: (' + (d.c.a * d.c.b) + ' − ' + (d.c.d * d.c.e) + ')x + (' + (d.c.a * d.c.c) + ' − ' + (d.c.d * d.c.f) + ')</p>' +
        '<p>&nbsp;&nbsp;= <b>' + d.c.ans_x + 'x + ' + d.c.ans_num + '</b></p>';
    },
    q6: function (d) {
      function byIdx(a) { return a.slice().sort(function (x, y) { return x.originalIndex - y.originalIndex; }); }
      var L = byIdx(d.left), R = byIdx(d.right);
      var why = [
        'x đang được cộng thêm → chuyển vế, phép cộng đổi thành phép <b>trừ</b>',
        'x đang được nhân với p → chia cả hai vế cho p',
        'x đang bị trừ đi → chuyển vế, phép trừ đổi thành phép <b>cộng</b>',
        'x đang bị chia cho q → nhân cả hai vế với q'
      ];
      var html = '<p><b>Lập công thức — biểu diễn x theo y:</b></p>';
      for (var i = 0; i < L.length; i++) {
        html += '<p>' + (i + 1) + ') <b>' + L[i].text + '</b></p>' +
          '<p>&nbsp;&nbsp;' + why[L[i].originalIndex] + '</p>' +
          '<p>&nbsp;&nbsp;⟹ nối với <b>' + R[i].text + '</b></p>';
      }
      return html + '<p><i>Quy tắc chung: khi chuyển vế, phép cộng đổi thành phép trừ (và ngược lại), phép nhân đổi thành phép chia (và ngược lại).</i></p>';
    },
    q7: function (d) {
      return '<p><b>Thu gọn đa thức bằng cách gộp các hạng tử đồng dạng:</b></p>' +
        '<p>Đa thức: ' + d.a + 'x³ + ' + d.b + 'x² − ' + d.c + 'x + ' + d.f + ' + ' + d.d + 'x³ − ' + d.e + 'x²</p>' +
        '<p><b>Bước 1 — Nhóm hạng tử đồng dạng:</b></p>' +
        '<p>&nbsp;&nbsp;x³: ' + d.a + 'x³ + ' + d.d + 'x³ = (' + d.a + ' + ' + d.d + ')x³ = <b>' + d.ans_x3 + 'x³</b></p>' +
        '<p>&nbsp;&nbsp;x²: ' + d.b + 'x² − ' + d.e + 'x² = (' + d.b + ' − ' + d.e + ')x² = <b>' + d.ans_x2 + 'x²</b></p>' +
        '<p>&nbsp;&nbsp;x: −' + d.c + 'x (không có hạng tử đồng dạng)</p>' +
        '<p>&nbsp;&nbsp;Hệ số tự do: ' + d.f + '</p>' +
        '<p><b>Bước 2 — Viết đa thức thu gọn:</b> ' + d.ans_x3 + 'x³ + ' + d.ans_x2 + 'x² − ' + d.c + 'x + ' + d.f + '</p>' +
        '<p><b>Bậc</b> của đa thức = 3 (bậc cao nhất có hệ số ≠ 0).</p>';
    },
    q8: function (d) {
      return '<p><b>Chia đa thức cho đơn thức — chia từng hạng tử:</b></p>' +
        '<p>(' + d.a + 'x³ − ' + d.b + 'x² + ' + d.c + 'x) ÷ ' + d.k + 'x</p>' +
        '<p><b>Bước 1:</b> ' + d.a + 'x³ ÷ ' + d.k + 'x = ' + d.ans_x2 + 'x² &nbsp;(hệ số: ' + d.a + '÷' + d.k + '=' + d.ans_x2 + ', bậc: x³÷x=x²)</p>' +
        '<p><b>Bước 2:</b> −' + d.b + 'x² ÷ ' + d.k + 'x = −' + Math.abs(d.ans_x) + 'x &nbsp;(hệ số: ' + d.b + '÷' + d.k + '=' + Math.abs(d.ans_x) + ', bậc: x²÷x=x)</p>' +
        '<p><b>Bước 3:</b> ' + d.c + 'x ÷ ' + d.k + 'x = ' + d.ans_num + ' &nbsp;(hệ số: ' + d.c + '÷' + d.k + '=' + d.ans_num + ', bậc: x÷x=1)</p>' +
        '<p>⟹ Kết quả: <b>' + d.ans_x2 + 'x² − ' + Math.abs(d.ans_x) + 'x + ' + d.ans_num + '</b></p>';
    },
    q9: function (d) {
      return '<p><b>Giải phương trình bậc nhất ' + d.A + 'x + ' + d.B + ' = ' + d.C + ':</b></p>' +
        '<p><b>Bước 1 — Chuyển vế hằng số</b> (đổi dấu khi sang vế kia):</p>' +
        '<p>&nbsp;&nbsp;' + d.A + 'x = ' + d.C + ' − ' + d.B + '</p>' +
        '<p>&nbsp;&nbsp;' + d.A + 'x = ' + (d.C - d.B) + '</p>' +
        '<p><b>Bước 2 — Chia hai vế cho hệ số của x:</b></p>' +
        '<p>&nbsp;&nbsp;x = ' + (d.C - d.B) + ' ÷ ' + d.A + '</p>' +
        '<p>&nbsp;&nbsp;x = <b>' + d.ans + '</b></p>' +
        '<p><b>Thử lại:</b> ' + d.A + '·' + d.ans + ' + ' + d.B + ' = ' + (d.A * d.ans) + ' + ' + d.B + ' = ' + d.C + ' ✓</p>';
    }
  };

  window.Chuong2Generators = Chuong2Generators;
})();
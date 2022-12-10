function getPerspectiveProjection(fov, aspect, near, far) {
  var fovy = (Math.PI * fov) / 180 / 2;
  var s = Math.sin(fovy);
  var rd = 1 / (far - near);
  var ct = Math.cos(fovy) / s;

  return new Float32Array([
    ct / aspect,
    0,
    0,
    0,
    0,
    ct,
    0,
    0,
    0,
    0,
    -(far + near) * rd,
    -1,
    0,
    0,
    -2 * near * far * rd,
    0,
  ]);
}

/**
 *  以下代码为lookAt的实现
 * */

/**
 * 由平移向量获取平移矩阵
 * */
function getTranslationMatrix(x, y, z) {
  return new Float32Array([
    1.0,
    0.0,
    0.0,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    0.0,
    0.0,
    1.0,
    0.0,
    x,
    y,
    z,
    1.0,
  ]);
}

/**
 * 由旋转弧度和旋转轴获取旋转矩阵
 * */
function getRotationMatrix(rad, x, y, z) {
  if (x > 0) {
    // 绕x轴的旋转矩阵
    return new Float32Array([
      1.0,
      0.0,
      0.0,
      0.0,
      0.0,
      Math.cos(rad),
      -Math.sin(rad),
      0.0,
      0.0,
      Math.sin(rad),
      Math.cos(rad),
      0.0,
      0.0,
      0.0,
      0.0,
      1.0,
    ]);
  } else if (y > 0) {
    // 绕y轴的旋转矩阵
    return new Float32Array([
      Math.cos(rad),
      0.0,
      -Math.sin(rad),
      0.0,
      0.0,
      1.0,
      0.0,
      0.0,
      Math.sin(rad),
      0.0,
      Math.cos(rad),
      0.0,
      0.0,
      0.0,
      0.0,
      1.0,
    ]);
  } else if (z > 0) {
    // 绕z轴的旋转矩阵
    return new Float32Array([
      Math.cos(rad),
      Math.sin(rad),
      0.0,
      0.0,
      -Math.sin(rad),
      Math.cos(rad),
      0.0,
      0.0,
      0.0,
      0.0,
      1.0,
      0.0,
      0.0,
      0.0,
      0.0,
      1.0,
    ]);
  } else {
    // 没有指定旋转轴，报个错，返回一个单位矩阵
    console.error("error: no axis");
    return new Float32Array([
      1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0,
      1.0,
    ]);
  }
}

/**
 * 视图矩阵
 * */
function lookAt(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ) {
  var zAxis = subVector([centerX, centerY, centerZ], [eyeX, eyeY, eyeZ]);
  var N = normalizeVector(zAxis);

  var xAxis = crossMultiVector(N, [upX, upY, upZ]);
  var U = normalizeVector(xAxis);

  var V = crossMultiVector(U, N);

  // 旋转的逆矩阵
  var r = new Float32Array([
    U[0],
    V[0],
    -N[0],
    0,
    U[1],
    V[1],
    -N[1],
    0,
    U[2],
    V[2],
    -N[2],
    0,
    0,
    0,
    0,
    1,
  ]);
  // 平移的逆矩阵
  var t = getTranslationMatrix(-eyeX, -eyeY, -eyeZ);

  return multiMatrix44(r, t);
}
/**
 * 由缩放因子获取缩放矩阵
 * */
function getScaleMatrix(xScale, yScale, zScale) {
  return new Float32Array([
    xScale,
    0.0,
    0.0,
    0.0,
    0.0,
    yScale,
    0.0,
    0.0,
    0.0,
    0.0,
    zScale,
    0.0,
    0.0,
    0.0,
    0.0,
    1.0,
  ]);
}

/**
 * 向量点乘
 * */
function dotMultiVector(v1, v2) {
  var res = 0;
  for (var i = 0; i < v1.length; i++) {
    res += v1[i] * v2[i];
  }
  return res;
}

/**
 * 向量叉乘
 * */
function crossMultiVector(v1, v2) {
  return [
    v1[1] * v2[2] - v1[2] * v2[1],
    v1[2] * v2[0] - v1[0] * v2[2],
    v1[0] * v2[1] - v1[1] * v2[0],
  ];
}

/**
 * 向量减法
 * */
function subVector(v1, v2) {
  return [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]];
}

/**
 * 向量加法
 * */
function addVector(v1, v2) {
  return [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]];
}

/**
 * 向量归一化
 * */
function normalizeVector(v) {
  var len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  return len > 0.00001 ? [v[0] / len, v[1] / len, v[2] / len] : [0, 0, 0];
}

/**
 * 4 x 4 矩阵的转置
 * */
function transposeMatrix(mat) {
  var res = new Float32Array(16);
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      res[i * 4 + j] = mat[j * 4 + i];
    }
  }
  return res;
}

/**
 * 4 x 4 矩阵乘法
 * */
function multiMatrix44(m1, m2) {
  var mat1 = transposeMatrix(m1);
  var mat2 = transposeMatrix(m2);

  var res = new Float32Array(16);
  for (var i = 0; i < 4; i++) {
    var row = [mat1[i * 4], mat1[i * 4 + 1], mat1[i * 4 + 2], mat1[i * 4 + 3]];
    for (var j = 0; j < 4; j++) {
      var col = [mat2[j], mat2[j + 4], mat2[j + 8], mat2[j + 12]];
      res[i * 4 + j] = dotMultiVector(row, col);
    }
  }
  return transposeMatrix(res);
}

function PointMultiplyMatrix(matrix, point) {
  // 给矩阵的每一部分一个简单的变量名，列数（c）与行数（r）
  var c0r0 = matrix[0],
    c1r0 = matrix[1],
    c2r0 = matrix[2],
    c3r0 = matrix[3];
  var c0r1 = matrix[4],
    c1r1 = matrix[5],
    c2r1 = matrix[6],
    c3r1 = matrix[7];
  var c0r2 = matrix[8],
    c1r2 = matrix[9],
    c2r2 = matrix[10],
    c3r2 = matrix[11];
  var c0r3 = matrix[12],
    c1r3 = matrix[13],
    c2r3 = matrix[14],
    c3r3 = matrix[15];

  // 定义点坐标
  var x = point[0];
  var y = point[1];
  var z = point[2];
  var w = point[3];

  // 点坐标和第一列对应相乘，再求和
  var resultX = x * c0r0 + y * c0r1 + z * c0r2 + w * c0r3;

  // 点坐标和第二列对应相乘，再求和
  var resultY = x * c1r0 + y * c1r1 + z * c1r2 + w * c1r3;

  // 点坐标和第三列对应相乘，再求和
  var resultZ = x * c2r0 + y * c2r1 + z * c2r2 + w * c2r3;

  // 点坐标和第四列对应相乘，再求和
  var resultW = x * c3r0 + y * c3r1 + z * c3r2 + w * c3r3;

  return [resultX, resultY, resultZ, resultW];
}

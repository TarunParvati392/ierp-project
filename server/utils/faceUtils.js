exports.calculateEuclideanDistance = (v1, v2) => {
  if (!v1 || !v2 || v1.length !== v2.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < v1.length; i++) {
    sum += (v1[i] - v2[i]) ** 2;
  }
  return Math.sqrt(sum);
};

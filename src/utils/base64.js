import Utf8 from './utf8'

const e = {}
const f = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '/', '=']
for (let i = 0; i < f.length; i++) {
  e[f[i].charCodeAt(0)] = i
}
const d = function (t) {
  let s = ''
  let g
  let h
  let j = ''
  let k
  let m
  let n
  let o = ''
  let p = 0
  const q = t.length
  const r = q - q % 3
  while (p < r) {
    g = t[p++]
    h = t[p++]
    j = t[p++]
    k = g >> 2
    m = ((g & 3) << 4) | (h >> 4)
    n = ((h & 15) << 2) | (j >> 6)
    o = j & 63
    s += f[k] + f[m] + f[n] + f[o]
  }
  if (q - r === 2) {
    g = t[p++]
    h = t[p++]
    s += f[g >> 2] + f[((g & 3) << 4) | (h >> 4)] + f[((h & 15) << 2)] + '='
  } else {
    if (q - r === 1) {
      g = t[p++]
      s += f[g >> 2] + f[((g & 3) << 4)] + '=='
    }
  }
  return s
}
const c = function (t) {
  t = t.replace(/\s/g, '')
  if (!t) {
    return []
  }
  const s = []
  let g
  let h
  let j = ''
  let k
  let m
  let n
  let o = ''
  let p = 0
  const q = t.length
  let r = q
  if (t.slice(-1) === '=') {
    r = q - 4
  }
  while (p < r) {
    k = e[t.charCodeAt(p++)]
    m = e[t.charCodeAt(p++)]
    n = e[t.charCodeAt(p++)]
    o = e[t.charCodeAt(p++)]
    g = (k << 2) | (m >> 4)
    h = ((m & 15) << 4) | (n >> 2)
    j = ((n & 3) << 6) | o
    s.push(g, h, j)
  }
  if (q !== r) {
    k = e[t.charCodeAt(p++)]
    m = e[t.charCodeAt(p++)]
    if (t.slice(-2) === '==') {
      s.push((k << 2) | (m >> 4))
    } else {
      if (t.slice(-1) === '=') {
        n = e[t.charCodeAt(p++)]
        s.push((k << 2) | (m >> 4), ((m & 15) << 4) | (n >> 2))
      }
    }
  }
  return s
}
const Base64 = {
  e: d,
  d: c
}
Base64.encode = function (g) {
  if (typeof g === 'string') {
    g = Utf8.getByteArray(g)
  }
  return d(g)
}
Base64.decode = function (g) {
  return Utf8.getString(c(g))
}
export default Base64

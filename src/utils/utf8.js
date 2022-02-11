const utf8 = (function () {
  const utoutf8 = function (u) {
    let a, b, c, d
    if (u <= 0x7f) {
      return u
    } else if (u <= 0x07FF) {
      a = 0xc0 | (u >> 6)
      b = 0x80 | (u & 0x3f)
      return (a << 8) | b
    } else if (u <= 0xFFFF) {
      a = 0xe0 | (u >> 12)
      b = 0x80 | ((u >> 6) & 0x3f)
      c = 0x80 | (u & 0x3f)
      return (a << 16) | (b << 8) | c
    } else if (u <= 0x10FFFF) {
      a = 0xf0 | (u >> 18)
      b = 0x80 | ((u >> 12) & 0x3f)
      c = 0x80 | ((u >> 6) & 0x3f)
      d = 0x80 | (u & 0x3f)
      let ret = (a << 24) | (b << 16) | (c << 8) | d
      if (ret < 0) ret += 0x100000000
      return ret
    } else {
      return 0
    }
  }
  const utf8tou = function (u) {
    let a, b, c, d
    if (u <= 0x7f) {
      return u
    } else if (u <= 0xdfbf) {
      a = (u >> 8) & 0x1f
      b = u & 0x3f
      return (a << 6) | b
    } else if (u <= 0xefbfbf) {
      a = (u >> 16) & 0xf
      b = (u >> 8) & 0x3f
      c = u & 0x3f
      return (a << 12) | (b << 6) | c
    } else if (u <= 0xf48fbfbf) {
      a = (u >>> 24) & 0x7
      b = (u >> 16) & 0x3f
      c = (u >> 8) & 0x3f
      d = u & 0x3f
      return (a << 18) | (b << 12) | (c << 6) | d
    } else {
      return 0
    }
  }
  const bytestoword = function (u, i) {
    const c = u[i]
    const ret = [1, c]
    if (c <= 0x7f) {
      ret[1] = c
    } else if (c <= 0xDF) {
      ret[1] = (c << 8) | u[i + 1]
      ret[0] = 2
    } else if (c <= 0xEF) {
      ret[1] = (c << 16) | (u[i + 1] << 8) | u[i + 2]
      ret[0] = 3
    } else if (c <= 0xF7) {
      ret[1] = (c << 24) | (u[i + 1] << 16) | (u[i + 2] << 8) | u[i + 3]
      ret[0] = 4
    }
    return ret
  }
  const $utf8 = {}
  $utf8.getWordArray = function (u) {
    if (u.length <= 0) return []
    let i = 0
    let c
    const ret = []
    while (i < u.length) {
      c = u.charCodeAt(i)
      if (c < 0x7f) ret.push(c)
      else {
        ret.push(utoutf8(c))
      }
      i++
    }
    return ret
  }
  $utf8.bytesToWords = function (u) {
    if (u.length <= 0) return []
    let i = 0
    const ret = []
    while (i < u.length) {
      const word = bytestoword(u, i)
      ret.push(word[1])
      i += word[0]
    }
    return ret
  }
  $utf8.getByteArray = function (u) {
    const _len = u.length
    if (_len <= 0) return []
    let i = 0
    let c
    const ret = []
    while (i < _len) {
      c = u.charCodeAt(i)
      if (c < 0x7f) ret.push(c)
      else {
        const word = utoutf8(c)
        if (word > 0xffffff) {
          ret.push(u >>> 24, (u >> 16) & 0xff, (u >> 8) & 0xff, u & 0xff)
        } else if (word > 0xffff) {
          ret.push(word >> 16, (word >> 8) & 0xff, word & 0xff)
        } else if (word > 0xff) {
          ret.push(word >> 8, word & 0xff)
        }
      }
      i++
    }
    return ret
  }
  $utf8.getBinary = function (u) {
    return String.fromCharCode.apply(null, $utf8.getByteArray(u))
  }
  $utf8.toString = function (u) {
    const _len = u.length
    if (_len <= 0) return ''
    let i = 0
    let ret = ''
    while (i < _len) {
      ret += String.fromCharCode(utf8tou(u[i]))
      i++
    }
    return ret
  }
  $utf8.getString = function (u) {
    const _len = u.length
    if (_len <= 0) return ''
    let i = 0
    let ret = ''
    while (i < _len) {
      const word = bytestoword(u, i)
      ret += String.fromCharCode(utf8tou(word[1]))
      i += word[0]
    }
    return ret
  }
  return $utf8
})()

export default utf8


import { hasOwnProperty } from './utils'

export default (function() {
	function c(g) {
		if (!g || typeof g !== "string") {
			return ""
		}
		return encodeURIComponent(g).replace(/\+/g, "%2B")
	}

	function d(g) {
		if (!g) {
			throw new Error("unknown type")
		}
		return g.replace(/\[object (.+?)\]/, "$1").toLowerCase()
	}

	function f(h, n, k) {
		if (n === null || n === undefined) {
			return ""
		}
		var l = toString.call(n);
		var m = d(l);
		switch (m) {
			case "number":
			case "boolean":
				k.push(h + "=" + c(n.toString()));
				return;
			case "array":
				for (var g = 0; g < n.length; g++) {
					f(h + "[" + g + "]", n[g], k)
				}
				return;
			case "object":
				for (var j in n) {
					if (!n.hasOwnProperty(j)) {
						continue
					}
					f(h + "[" + j + "]", n[j], k)
				}
				return;
			case "string":
				k.push(h + "=" + c(n))
		}
	}

	function b(i) {
		var h = [];
		for (var g in i) {
			if (!hasOwnProperty(i, g)) {
				continue
			}
			f(g, i[g], h)
		}
		return h.join("&")
	}

	function a(k, j) {
		var h = k.indexOf("=");
		if (h === -1) {
			return false
		}
		var i = k.substr(0, h);
		if (!i) {
			return false
		}
		var l = k.substr(h);
		if (l.length === 1) {
			j[i] = "";
			return true
		}
		l = l.substr(1);
		try {
			j[i] = decodeURIComponent(l)
		} catch (g) {
			j[i] = l
		}
		return true
	}

	function e(j) {
		var i = {};
		var g = j.indexOf("&");
		var h;
		while (g >= 0) {
			h = a(j.substr(0, g), i);
			if (!h) {
				continue
			}
			j = j.substr(g + 1);
			g = j.indexOf("&")
		}
		if (g === -1) {
			a(j, i)
		}
		return i
	}
	return {
		parse: e,
		stringify: b
	}
})();
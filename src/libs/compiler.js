import {hasOwnProperty,compile_path,wrapper_call, trim} from './utils'

function parse_attrs(src) {
    var regexp = /<(template|script|style)\b(.*?)(\/)?>/ig; var attrRegexp = /(\w+)="(.+?)"/ig
    var match = regexp.exec(src)
    if (!match) return {}
    var attrs = {}
    var attrString = match[2]

    while ((match = attrRegexp.exec(attrString)) !== null) {
      attrs[match[1]] = match[2]
    }
    return attrs
}
function parse_template(src) {
    var regexp = /<(template|script|style)\b(?:.*?)(\/)?>|<\/(template|script|style)>/ig
    var match
    var stacks = []
    var level = 0
    while ((match = regexp.exec(src)) !== null) {
      var name = match[1]; var isEnd = false; var isSelfClose = false
      if (name === undefined) {
        name = match[3]
        isEnd = true
      } else if (match[2]) {
        isSelfClose = true
      }
      if (isEnd) {
        level--
        if (level < 0) throw new Error('template error: tag[' + name + '] not match')
        var last = stacks[stacks.length - 1]
        if (last.name !== name) throw new Error('template error: tag[' + name + '] not match')
        if (level > 0) stacks.pop()
        else {
          last['contentEnd'] = match.index
        }
      } else {
        var attrs = parse_attrs(match[0])
        if (isSelfClose) {
          stacks.push({ name: name, attrs: attrs, level: level + 1, start: match.index, close: true })
        } else {
          level++
          stacks.push({ name: name, attrs: attrs, level: level, start: match.index, close: false, contentStart: match.index + match[0].length })
        }
      }
    }
    var result = {}
    for (var i = 0; i < stacks.length; i++) {
      var stack = stacks[i]
      var tagName = stack.name
      if (stack.level !== 1 || (!stack.close && !hasOwnProperty(stack, 'contentEnd'))) throw new Error('template error: tag[' + tagName + '] not match')
      if (stack.close) continue
      if (!hasOwnProperty(result, tagName)) result[tagName] = { content: '', attrs: stack.attrs }
      var contentLength = stack.contentEnd - stack.contentStart
      if (contentLength === 0) continue
      if (tagName === 'script') {
        result[tagName].content += src.substr(stack.contentStart, contentLength) + '\r\n'
      } else {
        result[tagName].content = src.substr(stack.contentStart, contentLength)
      }
    }
    return result
}

function appendStyles(styles) {
  var head = document.head || document.getElementsByTagName('head')[0]
  var ele = document.createElement('style')
  var appended = false
  ele.type = 'text/css'
  if (!ele.styleSheet) {
    ele.appendChild(document.createTextNode(styles))
    appended = true
  }
  head.appendChild(ele)
  if (ele.styleSheet && !appended) ele.styleSheet.cssText = styles
}
function parse_component(app, src, file) {
  var parts = parse_template(src)
  var scriptComponent = hasOwnProperty(parts, 'script') ? parts['script'] : null
  var templateComponent = hasOwnProperty(parts, 'template') ? parts['template'] : null
  var styleComponent = hasOwnProperty(parts, 'style') ? parts['style'] : null

  var script = trim(scriptComponent ? scriptComponent.content : '')
  var template = trim(templateComponent ? templateComponent.content : '')
  var style = trim(styleComponent ? styleComponent.content : '')
  if (!script && !template) {
    return {
      render: function(h) {
        return h('')
      }
    }
  }
  if (style) {
    if (styleComponent && styleComponent.attrs && hasOwnProperty(styleComponent.attrs, 'lang')) {
      var type = styleComponent.attrs['lang']
      if (type === 'less') {
        if (window.less) {
          less.render(style, {compress: true}, function (e, result) {
            if (e) throw e
            appendStyles(result.css)
          })
        }
      }
    } else {
      appendStyles(style)
    }
  }

  var options = null
  var render = null
  try {
    if (template) {
      render = Vue.compile(template)
    }
    if (!script) {
      return {
        render: render.render,
        staticRenderFns: render.staticRenderFns
      }
    }
  }catch (e) {
    throw e;
  }
  if (!script.startsWith('export default')) {
    throw new Error('must export template options from ')
  }
  // 进行简单二次编译
  script = script.replace(/^export default/, 'module.exports = ')
  script = script.replace(/\bimport(?:\()(.+?)(?:\))/ig, 'Component($1)')
  script = script.replace(/^(?:\s*)import(?:\s+)(\w+)(?:\s+)from(?:\s+)(.+?)/ig, 'var $1 = Component($2)')
  var module = { exports: {}}
  var idx = file.lastIndexOf('/'); var dir = ''
  if (idx >= 0) {
    dir = file.substr(0, idx + 1)
  }
  try {
    wrapper_call({
      'module': module,
      'exports': module.exports,
      'App': app,
      'Component': function (file_) {
        file_ = compile_path(dir, file_)
        return app.component(file_, true)
      }
    }, script)
  }catch (e) {
    console.log(e, script)
    throw e;
  }

  options = module.exports
  if (render) {
    options.render = render.render
    options.staticRenderFns = render.staticRenderFns
  }
  return options
}
export default parse_component;
import { hasOwnProperty, compile_path, wrapper_call, trim } from './utils'
import Vue from 'vue/dist/vue.common.prod'

function parse_attrs(src) {
  const regexp = /<(template|script|style)\b(.*?)(\/)?>/ig
  const attrRegexp = /(\w+)="(.+?)"/ig
  let match = regexp.exec(src)
  if (!match) return {}
  const attrs = {}
  const attrString = match[2]

  while ((match = attrRegexp.exec(attrString)) !== null) {
    attrs[match[1]] = match[2]
  }
  return attrs
}
export function parse_template(src) {
  const regexp = /<(template|script|style)\b(?:.*?)(\/)?>|<\/(template|script|style)>/ig
  let match
  const stacks = []
  let level = 0
  while ((match = regexp.exec(src)) !== null) {
    let name = match[1]
    let isEnd = false
    let isSelfClose = false
    if (name === undefined) {
      name = match[3]
      isEnd = true
    } else if (match[2]) {
      isSelfClose = true
    }
    if (isEnd) {
      level--
      if (level < 0) throw new Error('template error: tag[' + name + '] not match')
      const last = stacks[stacks.length - 1]
      if (last.name !== name) throw new Error('template error: tag[' + name + '] not match')
      if (level > 0) stacks.pop()
      else {
        last['contentEnd'] = match.index
      }
    } else {
      const attrs = parse_attrs(match[0])
      if (isSelfClose) {
        stacks.push({ name: name, attrs: attrs, level: level + 1, start: match.index, close: true })
      } else {
        level++
        stacks.push({ name: name, attrs: attrs, level: level, start: match.index, close: false, contentStart: match.index + match[0].length })
      }
    }
  }
  const result = {}
  for (let i = 0; i < stacks.length; i++) {
    const stack = stacks[i]
    const tagName = stack.name
    if (stack.level !== 1 || (!stack.close && !hasOwnProperty(stack, 'contentEnd'))) throw new Error('template error: tag[' + tagName + '] not match')
    if (stack.close) continue
    if (!hasOwnProperty(result, tagName)) result[tagName] = { content: '', attrs: stack.attrs }
    const contentLength = stack.contentEnd - stack.contentStart
    if (contentLength === 0) continue
    if (tagName === 'script') {
      result[tagName].content += src.substr(stack.contentStart, contentLength) + '\r\n'
    } else {
      result[tagName].content = src.substr(stack.contentStart, contentLength)
    }
  }
  return result
}

export function appendStyles(styles) {
  const head = document.head || document.getElementsByTagName('head')[0]
  const ele = document.createElement('style')
  let appended = false
  ele.type = 'text/css'
  if (!ele.styleSheet) {
    ele.appendChild(document.createTextNode(styles))
    appended = true
  }
  head.appendChild(ele)
  if (ele.styleSheet && !appended) ele.styleSheet.cssText = styles
}
function parse_component(app, src, file) {
  const parts = parse_template(src)
  const scriptComponent = hasOwnProperty(parts, 'script') ? parts['script'] : null
  const templateComponent = hasOwnProperty(parts, 'template') ? parts['template'] : null
  const styleComponent = hasOwnProperty(parts, 'style') ? parts['style'] : null

  let script = trim(scriptComponent ? scriptComponent.content : '')
  const template = trim(templateComponent ? templateComponent.content : '')
  const style = trim(styleComponent ? styleComponent.content : '')
  if (!script && !template) {
    throw new Error('no script or template')
  }
  if (style) {
    if (styleComponent && styleComponent.attrs && hasOwnProperty(styleComponent.attrs, 'lang')) {
      const type = styleComponent.attrs['lang']
      if (type === 'less') {
        if (window.less) {
          window.less.render(style, { compress: true }, function(e, result) {
            if (e) throw e
            appendStyles(result.css)
          })
        }
      }
    } else {
      appendStyles(style)
    }
  }

  let options = null
  const render = template ? Vue.compile(template) : null

  if (!script && render) {
    return render
  }
  if (!script.startsWith('export default')) {
    throw new Error('must export template options from ')
  }
  // 进行简单二次编译
  script = script.replace(/^export default/, 'module.exports = ')
  script = script.replace(/\bimport(?:\()(.+?)(?:\))/ig, 'Component($1)')
  script = script.replace(/^(?:\s*)import(?:\s+)(\w+)(?:\s+)from(?:\s+)(.+?)/ig, 'var $1 = Component($2)')
  const module = { exports: {}}
  const idx = file.lastIndexOf('/')
  let dir = ''
  if (idx >= 0) {
    dir = file.substr(0, idx + 1)
  }
  try {
    wrapper_call({
      'module': module,
      'exports': module.exports,
      '$app': app,
      '$component': function(file_) {
        file_ = compile_path(dir, file_)
        return app.component(file_, true)
      }
    }, script)
  } catch (e) {
    console.log(e, script)
    throw e
  }

  options = module.exports
  if (render) {
    options.render = render.render
    options.staticRenderFns = render.staticRenderFns
  }
  return options
}
export default parse_component

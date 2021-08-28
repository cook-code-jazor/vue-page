import { hasOwnProperty, compile_path, wrapper_call, trim } from './utils'
import Vue from '../vue/vue.min'

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

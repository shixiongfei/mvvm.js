/*
 *  MVVM Demo
 *
 *  Copyright (c) 2022 Xiongfei Shi
 *
 *  Author: Xiongfei Shi <xiongfei.shi(a)icloud.com>
 *  License: Apache-2.0
 *
 *  https://github.com/shixiongfei/mvvm.js
 */

function observe(data, listeners) {
  if (!data || typeof data !== 'object') {
    return
  }

  Object.keys(data).forEach(function (key) {
    defReactive(data, key, data[key], listeners)
  })
}

function defReactive(obj, key, value, listeners) {
  observe(value, listeners)

  Object.defineProperty(obj, key, {
    get: function reactiveGetter() {
      return value
    },
    set: function reactiveSetter(newVal) {
      if (value === newVal) {
        return
      } else {
        value = newVal

        for (var i = 0; i < listeners.length; i++) {
          listeners[i](key, newVal)
        }
      }
    }
  })
}

var listeners = []
var foo = {
  name: 'mvvm',
  version: '1.0'
}

observe(foo, listeners)
listeners.push(function (k, v) {
  const div = document.querySelector('#root')
  div.innerHTML = k + ', ' + v
})
foo.version = '2.0'

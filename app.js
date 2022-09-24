/*
 *  MVVM Demo Server
 *
 *  Copyright (c) 2022 Xiongfei Shi
 *
 *  Author: Xiongfei Shi <xiongfei.shi(a)icloud.com>
 *  License: Apache-2.0
 *
 *  https://github.com/shixiongfei/mvvm.js
 */

'use strict'

const express = require('express')
const app = express()
const port = 3000

app.use(express.static('public'))

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})

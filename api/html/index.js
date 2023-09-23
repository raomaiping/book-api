const fs = require('fs')
const path = require('path')
const cheerio = require('cheerio')
// 获取当前文件夹路径
const currentFolder = __dirname

// 要读取的HTML文件名称
const htmlFileName = 'paihangbang.html'

// 构建HTML文件的完整路径
const filePath = path.join(currentFolder, htmlFileName)
function getHtml() {
  try {
    // 同步读取HTML文件
    const data = fs.readFileSync(filePath, 'utf8')
    const $ = cheerio.load(data)
    return $
  } catch (err) {
    console.error(`读取文件 ${htmlFileName} 时出错:`, err)
  }
}

module.exports = getHtml

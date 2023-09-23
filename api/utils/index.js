const axios = require('axios')
const cheerio = require('cheerio')
// 解析html
async function getHtml(url, method = 'get', data = {}) {
  try {
    const axiosConfig = {
      time: 30000,
      method,
      url,
      data: method === 'post' ? data : undefined,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
    const response = await axios(axiosConfig)

    if (response.status === 200) {
      const html = response.data
      const $ = cheerio.load(html)
      return $
    } else {
      throw new Error('请求失败，状态码：' + response.status)
    }
  } catch (error) {
    console.error('发生错误：', error)
    throw error
  }
}

module.exports = {
  getHtml,
}

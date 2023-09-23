const BASE_URL = 'https://wap.yingsx.com'
const PC_BASE_URL = 'https://www.yingsx.com'
const { getHtml } = require('../utils')
const { typeList } = require('../constant')
// 获取书籍图片
function getImgUrl(id) {
  const newId = id.split('_')[1]
  const newId2 = newId.slice(0, -3)
  return `${BASE_URL}/files/article/image/${Number(
    newId2
  )}/${newId}/${newId}s.jpg`
}

// 获取书籍名称和id
function getBookInfo(node) {
  const strs = node.attr('href').split('/')
  const id = strs[strs.length - 2]
  const title = node.text()
  const imgurl = getImgUrl(id)
  return { id, title, imgurl }
}

// 定义一个函数，接受父元素选择器和分组大小作为参数
function groupListItems($, parentSelector, groupSize) {
  // 选择所有子元素 <li>
  const $listItems = []
  $(`${parentSelector} li`).each(function() {
    $listItems.push($(this))
  })

  // 定义一个空数组来存储分组后的结果
  const groupedArrays = []

  // 使用循环来分组子元素
  for (let i = 0; i < $listItems.length; i += groupSize) {
    const group = $listItems.slice(i, i + groupSize) // 使用slice方法分组
    groupedArrays.push(Array.from(group)) // 将分组转换为普通数组并添加到结果数组中
  }

  return groupedArrays // 返回分组后的数组
}

/**处理数据 */
function handlerData($, nodeName) {
  const data = []
  const typeName = $(`${nodeName} div`).text()
  $(`${nodeName} ul`).each(function() {
    const bookInfo = $(this).find('.tjxs .xsm a')
    const info = $(this)
      .find('.tjxs span')
      .eq(1)
      .find('a')
    const desc = $(this)
      .find('.tjxs span')
      .eq(2)
      .text()
    const remark = $(this)
      .find('.tjxs .tjrs')
      .text()
    const { id, title, imgurl } = getBookInfo(bookInfo)
    const author = info.text()
    data.push({
      id,
      typeName,
      title,
      remark,
      imgurl,
      author,
      desc,
    })
  })
  return data
}

// 获取章节名和章节id
function getChapterInfo(node) {
  const chapterId = node
    .attr('href')
    .split('/')[2]
    .split('.')[0]
  const chapterName = node.text()
  return { chapterId, chapterName }
}

/**
 * 获取首页列表
 */
async function getIndexList() {
  const $ = await getHtml(BASE_URL)
  const rmtjData = handlerData($, '#rmtj')
  const tjData = []
  $('#tj ul li').each(function() {
    const bookInfo = $(this)
      .find('a')
      .eq(1)
    const { id, title, imgurl } = getBookInfo(bookInfo)
    tjData.push({ id, title, imgurl })
  })
  const groupedItems = groupListItems($, '#zjgx ul', 3)
  const zjgxData = groupedItems.map(groupeditem => {
    const bookInfo = groupeditem[0].find('a').eq(0)
    const { title, id, imgurl } = getBookInfo(bookInfo)
    const author = groupeditem[0].find('.xszz').text()
    const updateTime = groupeditem[0].find('.xszk').text()
    const desc = groupeditem[1].text().trim()
    return { title, id, imgurl, author, updateTime, desc }
  })
  return {
    tj: {
      typeName: '推荐',
      list: tjData,
    },
    rm: {
      typeName: '热门',
      list: rmtjData,
    },
    zjgx: {
      typeName: '最近更新',
      list: zjgxData,
    },
  }
}
/** 获取章节内容*/
async function getChapterContent({ id, chapterId }) {
  const url = `${PC_BASE_URL}/${id}/${chapterId}.html`
  const $ = await getHtml(url)
  const chapterName = $('.bookname h1').text()
  const content = $('#content')
    .html()
    .split('<br>')
    .map(text => text.replace(/&nbsp;|\s|\n/g, ''))
    .filter(text => text !== '')
  return {
    id,
    chapterId,
    chapterName,
    content,
  }
}
/**
 * 获取书籍详情
 * @param {string} id 
 */
async function getDetail(id) {
  const url = `${PC_BASE_URL}/${id}/`
  const $ = await getHtml(url)
  const typeName = $('.con_top a:last').text()
  const title = $('#info h1').text()
  const author = $('#info p')
    .eq(0)
    .text()
    .split('：')[1]
  const time = $('#info p')
    .eq(2)
    .text()
    .replace('最后更新：', '')
  const desc = $('#intro p')
    .html()
    .split('<br>')
    .map(text => text.replace(/&nbsp;|\s|\n/g, ''))
    .filter(text => text !== '')
  const chapters = []
  $('dl dt:eq(1)')
    .nextAll('dd')
    .each(function() {
      const chapterInfo = getChapterInfo($(this).find('a'))
      chapters.push(chapterInfo)
    })
  const imgurl = getImgUrl(id)
  const { chapterId } = chapters[0]
  const chapterInfo = await getChapterContent({ id, chapterId })
  return {
    id,
    typeName,
    imgurl,
    title,
    author,
    time,
    desc,
    chapters,
    chapterInfo,
  }
}

/**
 * 获取分类列表
 * @param {number} typeId 
 * @param {number} page 
 * @returns 
 */
async function getSortList({ typeId = 1, page = 1 }) {
  let url
  if (Number(typeId) === 7) {
    url = `${BASE_URL}/full/${page}/`
  } else if (Number(typeId) === 8) {
    url = `${BASE_URL}/top/allvisit_${page}/`
  } else {
    url = `${BASE_URL}/sort/${typeId}_${page}/`
  }
  const $ = await getHtml(url)
  const data = handlerData($, '.list')

  const pages = parseInt(
    $('.page2')
      .text()
      .split('/')[1]
  )
  return {
    pages,
    page,
    list: data,
  }
}

/**
 * 获取排行列表
 * @param {number} type 
 * @param {number} page 
 * @returns 
 */
async function getTopList({ type = 'allvote' }) {
  const url = `${PC_BASE_URL}/paihangbang/${type}.html`
  const $ = await getHtml(url)
  const types = ['玄幻', '修真', '都市', '历史', '网游', '科幻', '全本', '全部']
  const data = []
  $('#main .box').each(function(index) {
    const list = []
    $(this)
      .find('ul:first > li:not([class])')
      .each(function() {
        const bookInfo = getBookInfo($(this).find('a'))
        list.push(bookInfo)
      })
    data.push({
      typeName: types[index],
      list,
    })
  })
  return data
}

/**
 * 获取搜索列表
 * @param {string} type  类型
 * @param {string} keyWord  关键字
 */
async function getSearchList({ type, keyWord }) {
  const url = `${BASE_URL}/s.php`
  const postData = {
    submit: '',
    type,
    s: keyWord,
  }
  const $ = await getHtml(url, 'post', postData)
  const data = []
  $('.slist ul li').each(function() {
    const typeInfo = $(this)
      .find('a')
      .eq(0)
    const bookInfo = $(this)
      .find('a')
      .eq(1)
    const author = $(this)
      .find('a')
      .eq(2)
      .text()
    const typeName = typeInfo.text().slice(1, -1)
    const { id, title, imgurl } = getBookInfo(bookInfo)
    data.push({
      id,
      title,
      author,
      typeName,
      imgurl,
    })
  })
  return data
}

/**
 * 获取分类类别列表
 */

function getTypeList() {
  return typeList
}
module.exports = {
  getSortList,
  getSearchList,
  getIndexList,
  getTopList,
  getDetail,
  getChapterContent,
  getTypeList,
}

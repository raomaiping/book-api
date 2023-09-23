const {
  getSortList,
  getSearchList,
  getIndexList,
  getFullList,
  getTopList,
  getDetail,
  getChapterContent,
  getTypeList,
} = require('./data/yingsx')

module.exports = [
  /** 首页接口 */
  {
    url: '/api/yingsx',
    method: 'get',
    async response() {
      const data = await getIndexList()
      return {
        errno: 0,
        data,
      }
    },
  },
  /** 详情接口 */
  {
    url: '/api/yingsx/detail/:id',
    method: 'get',
    async response(ctx) {
      const { params } = ctx
      const data = await getDetail(params.id)
      return {
        errno: 0,
        data,
      }
    },
  },
  /**根据书籍 id 和章节chapterId 获取章节文本内容 */
  {
    url: '/api/yingsx/:id/:chapterId',
    method: 'get',
    async response(ctx) {
      const { params } = ctx
      const data = await getChapterContent(params)
      return {
        errno: 0,
        data,
      }
    },
  },
  /**获取分类类别列表 */
  {
    url: '/api/yingsx/typelist',
    method: 'get',
    response() {
      const data = getTypeList()
      return {
        errno: 0,
        data,
      }
    },
  },
  /** 分类接口 */
  {
    url: '/api/yingsx/sort',
    method: 'get',
    async response(ctx) {
      const { query = {} } = ctx
      const data = await getSortList(query)
      return {
        errno: 0,
        data,
      }
    },
  },
  /** 排行接口 */
  {
    url: '/api/yingsx/top',
    method: 'get',
    async response(ctx) {
      const { query = {} } = ctx
      const data = await getTopList(query)
      return {
        errno: 0,
        data,
      }
    },
  },
  /** 搜索接口 */
  {
    url: '/api/yingsx/search',
    method: 'get',
    async response(ctx) {
      const { query = {} } = ctx
      const data = await getSearchList(query)
      return {
        errno: 0,
        data,
      }
    },
  },
  /** 推荐搜索关键字 */
  {
    url: '/api/yingsx/hot',
    method: 'get',
    async response() {
      const data = await getTopList({ type: 'allvote' })
      const hotData = data[data.length - 1].list.slice(0, 15).map(i => i.title)
      return {
        errno: 0,
        data: hotData,
      }
    },
  },
]

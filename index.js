const Koa = require('koa')
const cors = require('koa-cors')
const Router = require('koa-router')
const apiList = require('./api/index')

const app = new Koa()
const router = new Router()
// 使用koa-cors中间件允许所有跨域请求
app.use(cors())
async function getRes(fn, ctx) {
  return new Promise(resolve => {
    setTimeout(() => {
      const res = fn(ctx)
      resolve(res)
    }, 500)
  })
}
router.get('/', async ctx => {
  ctx.body = 'Book Api'
})
apiList.forEach(item => {
  const { url, method, response } = item
  router[method](url, async ctx => {
    const res = await getRes(response, ctx)
    ctx.body = res
  })
})
app.use(router.routes())
app.listen(3008)

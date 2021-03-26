
const fastify = require('fastify')({
    logger: true,
})
const path = require('path')
const middie = require('middie')
const fs = require('fs')
const root = process.cwd()
const isProd = process.env.NODE_ENV === 'production'
const isTest = process.env.NODE_ENV === 'test' || !!process.env.VITE_TEST_BUILD

const server = (async () => {
    let vite
    if (!isProd) {
        vite = await require('vite').createServer({
            root,
            logLevel: isTest ? 'error' : 'info',
            server: {
                middlewareMode: true
            }
        })
        // use vite's connect instance as middleware
        await fastify.register(middie)
        fastify.use(vite.middlewares)
    } else {
        app.use(require('compression')())
        fastify.register(require('fastify-static'), {
            root: path.join(__dirname, 'dist/client')
        })
    }


    // const app = ReactDOMServer.renderToString(<App/>);

    // reply.type('text/html')
    // reply.send(renderHTMLTemplate(req, { element: '<h1>vtest</h1>' }))
    fastify.get('/*', async (req, reply) => {
        try {
            const url = req.url
            let template, render
            if (!isProd) {
                // always read fresh template in dev
                template = fs.readFileSync(path.resolve('index.html'), 'utf-8')
                template = await vite.transformIndexHtml('/', template)
                render = (await vite.ssrLoadModule('/src/entry-server.jsx')).render
            } else {
                template = indexProd
                render = require('./dist/server/entry-server.js').render
            }

            const context = {}
            const appHtml = render(url, context)

            if (context.url) {
                // Somewhere a `<Redirect>` was rendered
                return reply.redirect(301, context.url)
            }

            const html = template.replace(`<!--app-html-->`, appHtml)
            reply.code(200)
            reply.type('text/html')
            reply.send(html)
        } catch (e) {
            !isProd && vite.ssrFixStacktrace(e)
            console.log(e.stack)
            reply.status(500)
            reply.send(e.stack)
        }
    })


    fastify.listen(process.env.PORT || 3000, '0.0.0.0')
})()
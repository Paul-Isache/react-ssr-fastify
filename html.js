const React = require('react')
const renderToString = require('react-dom/server').renderToString
const HeadProvider = require('react-head').HeadProvider


const headTags = []; // mutated during render so you can include in server-rendered template later
const renderApp = (element) => renderToString(
  <HeadProvider headTags={headTags}>
    {element}
  </HeadProvider>
);

exports.renderHTMLTemplate = (req, { headTags = headTags, element }) => {
  return (`
    <!doctype html>
      <head>
        ${renderToString(headTags)}
      </head>
      <body>
        <div id="root">${renderApp(element)}</div>
      </body>
    </html>
  `)
}
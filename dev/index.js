module.hot.accept(function() {
  Array.from(document.body.children).map((x) => x.remove())
  require("../output/Main/index.js").main()
})

require("../output/Main/index.js").main()

import $ from 'jquery';

// 定义组件级别元素的selector
// 定义检索需要添加id的元素的配置
// 监听变动（两级）：body级别整体监听，组件级别元素监听
// 组件级别变动后的需要添加id的元素的检索，输入配置
function AutoIdMaker(config) {
  this.initConfig(config)
  this.idCache = {}
}
AutoIdMaker.prototype.initConfig = function(config) {
  this.config = config
  if(!this.config) {
    this.config = {
      componentElemSelector: '.a-component',
      targetElemsConfig: {
        'button': {
          typeName: 'btn'
        }
      }
    }
  }
  if(!this.config.targetElemsConfig) {
    this.config.targetElemsConfig = {}
  }
}

// 遍历需要添加的元素配置，调用添加ID的方法
AutoIdMaker.prototype.addIdAction = function (el) {
  const config = this.config.targetElemsConfig
  for (const selector in config) {
    if (Object.hasOwnProperty.call(config, selector)) {
      const cfg = config[selector];
      this.addIdForEl(el, selector, cfg.typeName, cfg.retriever)
    }
  }
}

AutoIdMaker.prototype.addIdForEl = function(parentElem, selector, typeName = '', retriever, keyParentsNodeSelector = '.a-component') {
  let keywordRetriever = retriever
  if(!keywordRetriever) {
    keywordRetriever = (el) => {
      return el.textContent.replace(/\s+/g, '')
    }
  }
  let elems = Array.from($(parentElem).find(selector))
  const idCache = this.idCache
  elems.forEach(el => {
    // 处理无id的元素
    if(!el.getAttribute('id')) {
      const componentParents = $(el).parents(keyParentsNodeSelector)
      if(componentParents.length > 0) {
        const componentEles = Array.from(componentParents).reverse()
        const concatId = componentEles.map(e => {
          const regResult = e.className.match(/a\-component\-([a-zA-Z0-9\-]{1,})/)
          if(regResult) {
            return regResult[1]
          }
          return ''
        }).join('-')
        if(concatId) {
          let targetId = concatId + '-' + typeName + '-' + keywordRetriever(el)
          if(idCache[targetId] !== undefined) {
            idCache[targetId].push(el)
            targetId += idCache[targetId].length
          } else {
            idCache[targetId] = [el]
          }
          el.setAttribute('id', targetId)
        }
      }
    }
  })
}
AutoIdMaker.prototype.genComponentElObserverCb = function(el) {
  return function (mutationList, observer) {
    this.addIdAction(el)
  }.bind(this)
}
// body 变动的回调
AutoIdMaker.prototype.bodyObserveCallback = function (mutationList, observer) {
  const currentComponentElems = Array.from($(this.config.componentElemSelector))
  // 不回收observer
  const observed = this.observer.observedComponentToObserver
  currentComponentElems.forEach(el => {
    if(!observed.has(el)) {
      const observer = new MutationObserver(this.genComponentElObserverCb(el))
      observer.observe(el, {
        childList: true,
        subtree: true
      })
      observed.set(el, observer)
    }
  })
}
AutoIdMaker.prototype.observeDOM = function() {
  // 观察dom body结构，一级观察
  this.observer = {
    bodyObserver: new MutationObserver(this.bodyObserveCallback.bind(this)),
    // observedElement: mutationObserver
    observedComponentToObserver: new WeakMap()
  }
  return this.observer
}
AutoIdMaker.prototype.start = function() {
  this.observeDOM()
  this.observer.bodyObserver.observe(document.body, {
    subtree: true,
    childList: true
  })
}

export default AutoIdMaker

import AutoIdMaker from './index'

const maker = new AutoIdMaker({
  componentElemSelector: '.a-component',
  targetElemsConfig: {
    'button': {
      typeName: 'btn',
      typeName: 'humanFriendlyName',
      retriever: (el) => {
        // a function to get keyword from target element
        return el.textContent.replace(/\s+/g, '')
      },
      // optional|define key parent node selector of this target element
      // 可选，定义该目标控件元素的关键祖元素，以从祖元素链上获取到关键字拼接
      // 为定义时使用config.componentElemSelector
      keyParentsNodeSelector: '.a-component'
    }
  }
})
maker.start()
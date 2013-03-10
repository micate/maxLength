# 文本框长度计算和超出截取插件

又一个长度限制插件。。。

由于中文输入法的问题，放弃了采用 onpropertychange / oninput 的方式计数或阻止继续输入。


## 使用

```
$('[data-maxlength]').maxLength({
    limit: 0,                           // 长度限制
    prevent: true,                      // 阻止继续输入
    count: $.fn.maxLength.COUNT_LENGTH, // 计数显示方式
    display: null,                      // 显示提示信息回调或元素
    update: null,                       // 输入框内容改变回调
    mode: $.fn.maxLength.MODE_CHINESE   // 长度计算方式
});
```

## 参数

### limit 长度限制

可以为数值、DOM 属性名称

### prevent 超出后是否阻止继续输入

Boolean 值，默认为 true

### count 计数方式

1. $.fn.maxLength.COUNT_LEFT

	显示剩余可输入长度

2. $.fn.maxLength.COUNT_LENGTH 默认值

	显示已输入长度

### display 计数显示元素或回调

支持 function 回调、CSS 选择器字符串、DOM 元素、jQuery 元素，如不提供则自动在文本框后追加一个 span 用以显示计数

### update 输入框内容改变回调

当输入框内容改变时触发该回调，满足一些需要根据内容动态调整输入框或提示元素的需求

### mode 长度计算方式

实现了 3 种长度计算方式：

1. $.fn.maxLength.MODE_NORMAL

	JavaScript 默认长度计算方式，无论中英文，均计算为一个长度。

2. $.fn.maxLength.MODE_MAXIMUM

	一个英文计算一个长度，一个中文计算两个长度。

3. $.fn.maxLength.MODE_CHINESE 默认值

	所谓中式计算方式，两个英文计算一个长度，一个中文计算一个长度。
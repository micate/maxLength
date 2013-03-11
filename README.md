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

## 样式

### 关于没有默认样式的问题

为什么不提供一个默认的样式呢？

呃，因为懒到死。。。

根据各种各样项目的需求，发现根本没有一劳永逸的样式展示方式，总是有奇奇怪怪的展示需求，顶部的、右侧的，下方的，等等。
而且，受限于不同的布局模式，静态的、fixed 的，绝对定位的，默认提供的样式也会遇到显示不正常的情况。

因此，插件提供了 display 参数，用于满足不同情况下的显示需要。

### 默认的提示信息样式

插件只生成了一个 `<span class="maxlength"></span>` 这样的元素用以显示数值（假如你没有提供正确的 `display` 值的时候才会自动生成），这需要插件使用者自行在 CSS 中定义该元素的显示样式。
同时需要注意的是，当数值超出限制值后，插件会为该元素添加 `maxlength-error` 的样式，插件使用者可以为该类定义错误显示样式。


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
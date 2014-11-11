---
layout: post
title: "使用 CSLayout 来布局 iOS 视图"
published: false
---

CSLayout 是一个用来快速实现 iOS 视图动态布局的库。和 Auto Layout 一样，它使用基于约束的模型来实现布局。它不是 Auto Layout 的替代品，因为它不处理约束之间相互依赖的情况，除此之外，它可以轻松地处理几乎所有布局。相对于 Auto Layout，CSLayout 具有更高的效率，以及更友好的接口。

CSLayout 使用名为 SLL (Simple Layout Language) 的语言来描述视图之间的约束。SLL 非常简单和直观，它由赋值语句和基本算术运算组成。下面是一个常见的例子：

{% highlight objective-c %}
UIView *contentView = [[UIView alloc] init];

CSLayout *contentLayout = [CSLayout layoutOfView:contentView];

[contentLayout addRule:@"tt = 20, ll = rr = bb = 10"];
//                                  ^--------- SLL (Simple Layout Language)

[self.view addSubview:contentView];
{% endhighlight %}

以上代码首先为视图 `contentView` 创建了一个 `CSLayout` 对象 `contentLayout`，然后为这个对象添加了一个规则。规则通过 SLL 语言来描述。在这个例子中，规则指定视图 `contentView` 顶部到父视图顶部 (`tt`, 即 top to top) 的距离为 `20`；左侧至父视图左侧的距离 (`ll`)、右侧至父视图右侧的距离 (`rr`)、以及底部至父视图底部的距离 (`bb`) 为 `10`。

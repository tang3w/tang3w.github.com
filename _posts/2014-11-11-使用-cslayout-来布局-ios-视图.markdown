---
layout: post
title: "使用 CSLayout 来布局 iOS 视图"
published: false
---

### 介绍

CSLayout 是一个用来快速实现 iOS 视图动态布局的库。和 Auto Layout 一样，它使用基于约束的模型来构建布局。它不是 Auto Layout 的替代品，因为它不处理约束之间相互依赖的情况，除此之外，它可以轻松地处理几乎所有布局。相对于 Auto Layout，CSLayout 具有更高的效率，以及更友好的接口。

CSLayout 是对视图自身布局的抽象，布局是由一系列约束组成的，而约束则通过 SLL (Simple Layout Language) 语言来描述。SLL 非常简单和直观，它由赋值语句和基本算术运算组成。下面是一个简单的例子：

{% highlight objective-c %}
UIView *contentView = [[UIView alloc] init];

CSLayout *contentLayout = [CSLayout layoutOfView:contentView];

[contentLayout addRule:@"tt = 20, ll =  bb = rr = 10"];
//                                  ^--------- SLL (Simple Layout Language)

[self.view addSubview:contentView];
{% endhighlight %}

以上代码首先为视图 `contentView` 创建了一个 `CSLayout` 对象 `contentLayout`，接着为这个对象添加了一个规则，该规则包含 4 个约束，它们分别是：

1. `tt`，顶部到父视图顶部的距离为 `20`；
2. `ll`，左侧至父视图左侧的距离为 `10`；
3. `bb`，右侧至父视图右侧的距离为 `10`；
4. `rr`，底部至父视图底部的距离为 `10`。

就像我们所看到的，SLL 语言就是由逗号分隔的赋值语句。每个赋值语句表示一个或多个约束。赋值语句中，左值是约束的名字，右值是该约束具体的值。如果多个约束具有相等的值，可以把它们合并成一个赋值语句。在上面这个例子中，约束 `ll`，`bb` 和 `rr` 具有相等的值，所以可以用一个赋值语句来同时指定。

这个例子为视图 `contentView` 的布局创建了 4 个约束。当父视图需要重新布局时（例如添加了子视图，或者尺寸发生了变化），`contentView` 也会根据自身布局的约束动态地改变尺寸。

### SLL 语言

CSLayout 使用 SLL 语言来描述约束。SLL 的部分语法已经在介绍部分描述了，它就是逗号分隔的赋值语句。这一节主要介绍 CSLayout 支持的约束，以及约束之间的算术运算。

在 SLL 的赋值语句中，左值表示约束名，CSLayout 支持以下 14 个约束：

1.  tt，顶部至父视图顶部的距离；
2.  tb，顶部至父视图底部的距离；
3.  ll，左侧至父视图左侧的距离；
4.  lr，左侧至父视图右侧的距离；
5.  bb，底部至父视图底部的距离；
6.  bt，底部至父视图顶部的距离；
7.  rr，右侧至父视图右侧的距离；
8.  rl，右侧至父视图左侧的距离；
9.  ct，中点到父视图顶部的距离；
10. cl，中点到父视图左侧的距离；
11. minw，视图的最小宽度；
12. maxw，视图的最大宽度；
13. minh，视图的最小高度；
14. maxh，视图的最大高度。

右值表示约束值，约束值可以是以下 4 种形式的操作数，也可以是由这些操作数构成的更复杂的算术表达式：

1. 浮点数，例如 20
2. 百分数，例如 80%
3. 格式化字符串，例如 %tt
4. 自身约束，例如 tt

约束值的会根据不同的约束名有不同的含义。

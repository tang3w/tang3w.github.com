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

### 约束

CSLayout 的约束使用 SLL 语言来描述。SLL 的部分语法已经在介绍部分描述了。在 SLL 的赋值语句中，左值表示约束名，CSLayout 支持以下 14 种约束：

<table>
<thead>
<tr>
<th width="50%">约束名</th>
<th>说明</th>
</tr>
</thead>
<tbody>

<tr><td><code>tt</td>
<td>视图顶部至父视图顶部</td></tr>
<tr><td><code>tb</code></td>
<td>视图顶部至父视图底部</td></tr>
<tr><td><code>ll</code></td>
<td>视图左侧至父视图左侧</td></tr>
<tr><td><code>lr</code></td>
<td>视图左侧至父视图右侧</td></tr>
<tr><td><code>bb</code></td>
<td>视图底部至父视图底部</td></tr>
<tr><td><code>bt</code></td>
<td>视图底部至父视图顶部</td></tr>
<tr><td><code>rr</code></td>
<td>视图右侧至父视图右侧</td></tr>
<tr><td><code>rl</code></td>
<td>视图右侧至父视图左侧</td></tr>
<tr><td><code>ct</code></td>
<td>视图中点到父视图顶部</td></tr>
<tr><td><code>cl</code></td>
<td>视图中点到父视图左侧</td></tr>
<tr><td><code>minw</code></td>
<td>视图的最小宽度</td> </tr>
<tr><td><code>maxw</code></td>
<td>视图的最大宽度</td> </tr>
<tr><td><code>minh</code></td>
<td>视图的最小高度</td></tr>
<tr><td><code>maxh</code></td>
<td>视图的最大高度</td></tr>

</tbody>
</table>

右值表示约束值，约束值可以是下面列出的 4 种形式，也可以是算术表达式：

<table>
<thead>
<tr>
<th width="50%">约束值</th>
<th>例子</th>
</tr>
</thead>
<tbody>

<tr><td>浮点数</td>
<td><code>5</code> <code>-10</code> <code>20.0f</code></td></tr>
<tr><td>百分数</td>
<td><code>5%</code> <code>-10%</code> <code>20.0%</code></td></tr>
<tr><td>约束名</td>
<td><code>tt</code> <code>minw</code></td></tr>
<tr><td>格式化字符串</td>
<td><code>%tt</code> <code>%w</code></td></tr>

</tbody>
<table>

格式化字符串用来指定其他视图的坐标值，下表列出了 CSLayout 支持的 12 种格式化字符串：

<table>
<thead>
<tr>
<th width="50%">格式化字符串</th>
<th>说明</th>
</tr>
</thead>
<tbody>

<tr><td><code>%tt</td>
<td>视图顶部至父视图顶部</td></tr>
<tr><td><code>%tb</code></td>
<td>视图顶部至父视图底部</td></tr>
<tr><td><code>%ll</code></td>
<td>视图左侧至父视图左侧</td></tr>
<tr><td><code>%lr</code></td>
<td>视图左侧至父视图右侧</td></tr>
<tr><td><code>%bb</code></td>
<td>视图底部至父视图底部</td></tr>
<tr><td><code>%bt</code></td>
<td>视图底部至父视图顶部</td></tr>
<tr><td><code>%rr</code></td>
<td>视图右侧至父视图右侧</td></tr>
<tr><td><code>%rl</code></td>
<td>视图右侧至父视图左侧</td></tr>
<tr><td><code>%ct</code></td>
<td>视图中点到父视图顶部</td></tr>
<tr><td><code>%cl</code></td>
<td>视图中点到父视图左侧</td></tr>
<tr><td><code>%w</code></td>
<td>视图的宽度</td> </tr>
<tr><td><code>%h</code></td>
<td>视图的高度</td></tr>

</tbody>
</table>

CSLayout 支持下面 5 种算术运算符：

<table>
<thead>
<tr>
<th width="50%">运算符</th>
<th>例子</th>
</tr>
</thead>
<tbody>

<tr><td><code>&plus;</code></td>
<td><code>10 &plus; 20</code> <code>50% &plus; 10</code> <code>%w &plus; 5</code></td></tr>
<tr><td><code>-</code></td>
<td><code>10 - 20</code> <code>50% - 10</code> <code>%w - 5</code></td></tr>
<tr><td><code>&ast;</code></td>
<td><code>50 &ast; 2</code> <code>100% &ast; 0.5</code> <code>%h &ast; 2</code></td></tr>
<tr><td><code>/</code></td>
<td><code>100 / 2</code> <code>100% / 2</code> <code>%h / 2</code></td></tr>

</tbody>
<table>


约束值的会根据不同的约束名有不同的含义。

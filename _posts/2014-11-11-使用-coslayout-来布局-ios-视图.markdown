---
layout: post
title: "使用 COSLayout 来布局 iOS 视图"
published: true
categories:
- Objective-C
---

## 介绍

[COSLayout][1] 是一个用来快速实现 iOS 视图**动态布局**的库。和 Auto Layout 一样，它使用基于约束的模型来构建布局。相对于 Auto Layout，COSLayout 具有更高的效率，以及更友好的接口。

COSLayout 是对视图自身布局的抽象，布局由一系列规则组成，规则通过 SLL (Simple Layout Language) 语言来描述。下面是一个简单的例子：

{% highlight objective-c %}
UIView *contentView = [[UIView alloc] init];

COSLayout *contentLayout = [COSLayout layoutOfView:contentView];

[contentLayout addRule:@"tt = 20, ll =  bb = rr = 10"];
//                                  ^--------- SLL (Simple Layout Language)
[self.view addSubview:contentView];
{% endhighlight %}

以上代码首先为视图 `contentView` 创建了一个 `COSLayout` 对象 `contentLayout`，接着使用 `addRule:` 方法为这个对象添加了一条规则，该规则包含 4 个约束，它们分别是：

1. `tt`，顶部到父视图顶部的距离为 `20`；
2. `ll`，左侧至父视图左侧的距离为 `10`；
3. `bb`，底部至父视图底部的距离为 `10`；
4. `rr`，右侧至父视图右侧的距离为 `10`。

这个例子为视图 `contentView` 的布局创建了 4 个约束。当父视图需要更新布局时，`contentView` 也会根据自身布局的约束动态地改变尺寸。

通常不需要手动要求父视图更新布局，因为系统会很好的处理。比如当有子视图添加，自身或子视图的尺寸发生改变时，系统就会更新子视图的布局。也可以手动调用 `layoutSubviews` 方法要求父视图及时更新布局。

## SLL 语言

就像我们所看到的，SLL 的语法很简单，仅由逗号分隔的赋值语句构成。

### 赋值语句

每个赋值语句指定一个或多个约束。赋值语句中，左值是约束的名称，右值是该约束的值。和 C 语言一样，赋值运算符是右结合的，赋值表达式也是有值的，其值就是它的右值。

### 算术运算

SLL 支持基本算术运算。SSL 一共有 5 个算术运算符：

<table>
<thead>
<tr>
<th>算术运算符</th>
<th>优先级</th>
<th>结合性</th>
<th>例子</th>
</tr>
</thead>
<tbody>

<tr>
<td><code>=</code></td>
<td>1</td><td>右</td>
<td><code>tt = 20</code> <code>ct = 50%</code></td>
</tr>

<tr>
<td><code>&plus;</code></td>
<td>2</td><td>左</td>
<td><code>10 &plus; 20</code> <code>50% &plus; 10</code> <code>%w &plus; 5</code></td>
</tr>

<tr>
<td><code>-</code></td>
<td>2</td><td>左</td>
<td><code>10 - 20</code> <code>50% - 10</code> <code>%w - 5</code></td>
</tr>

<tr>
<td><code>&ast;</code></td>
<td>3</td><td>左</td>
<td><code>50 &ast; 2</code> <code>80% &ast; 0.5</code> <code>%h &ast; 2</code></td>
</tr>

<tr>
<td><code>/</code></td>
<td>3</td><td>左</td>
<td><code>100 / 2</code> <code>100% / 2</code> <code>%h / 2</code></td>
</tr>

</tbody>
</table>

另外，还可以通过 `()` 来创建子表达式，例如 `(2 + 3) × 4`，来改变表达式的求值顺序。

以上就是 SLL 语言的全部语法，非常简单。

## 规则和约束

COSLayout 的规则使用 SLL 语言来描述，每个规则都包含若干个约束。在 SLL 的赋值语句中，左值表示约束名。COSLayout 支持以下 14 种约束：

<table>
<thead>
<tr>
<th width="20%">约束名</th>
<th width="25%">方向</th>
<th>说明</th>
</tr>
</thead>
<tbody>

<tr>
<td><code>tt</td>
<td>垂直</td>
<td>视图顶部至父视图顶部的约束</td>
</tr>

<tr>
<td><code>tb</code></td>
<td>垂直</td>
<td>视图顶部至父视图底部的约束</td>
</tr>

<tr>
<td><code>ll</code></td>
<td>水平</td>
<td>视图左侧至父视图左侧的约束</td>
</tr>

<tr>
<td><code>lr</code></td>
<td>水平</td>
<td>视图左侧至父视图右侧的约束</td>
</tr>

<tr>
<td><code>bb</code></td>
<td>垂直</td>
<td>视图底部至父视图底部的约束</td>
</tr>

<tr>
<td><code>bt</code></td>
<td>垂直</td>
<td>视图底部至父视图顶部的约束</td>
</tr>

<tr>
<td><code>rr</code></td>
<td>水平</td>
<td>视图右侧至父视图右侧的约束</td>
</tr>

<tr>
<td><code>rl</code></td>
<td>水平</td>
<td>视图右侧至父视图左侧的约束</td>
</tr>

<tr>
<td><code>ct</code></td>
<td>垂直</td>
<td>视图中点到父视图顶部的约束</td>
</tr>

<tr>
<td><code>cl</code></td>
<td>水平</td>
<td>视图中点到父视图左侧的约束</td>
</tr>

<tr>
<td><code>minw</code></td>
<td>水平</td>
<td>视图的最小宽度的约束</td>
</tr>

<tr>
<td><code>maxw</code></td>
<td>水平</td>
<td>视图的最大宽度的约束</td>
</tr>

<tr>
<td><code>minh</code></td>
<td>垂直</td>
<td>视图的最小高度的约束</td>
</tr>

<tr>
<td><code>maxh</code></td>
<td>垂直</td>
<td>视图的最大高度的约束</td>
</tr>

</tbody>
</table>

所有约束可以从方向上分为两类：**水平约束**和**垂直约束**。这样分类是有意义的，因为某些约束值会根据所属约束方向的不同有不同的解释，比如后面马上要介绍的百分数就是这样。判断某个约束是哪个方向非常简单，仅从字面上就可以判断。例如 `ll` 表示左侧至父视图左侧的约束，当然是水平约束；再如 `minh`，它表示最小高度，当然是一个垂直约束。

赋值语句的右值就是约束值，COSLayout 支持 4 种类型的约束值：

<table>
<thead>
<tr>
<th width="20%">约束值</th>
<th width="25%">示例</th>
<th>说明</th>
</tr>
</thead>
<tbody>

<tr>
<td>浮点数</td>
<td><code>5</code> <code>-10</code> <code>20.0f</code></td>
<td>表示固定大小的点 (point)</td>
</tr>

<tr>
<td>百分数</td>
<td><code>5%</code> <code>-10%</code> <code>20.0%</code></td>
<td>如果所属约束是水平约束，表示父视图宽度的百分比；<br/>如果所属约束是垂直约束，表示父视图高度的百分比</td>
</tr>

<tr>
<td>约束名</td>
<td><code>tt</code> <code>minw</code></td>
<td>表示视图自身布局的某个约束的约束值</td>
</tr>

<tr>
<td>格式说明符</td>
<td><code>%tt</code> <code>%w</code> <code>%f</code></td>
<td>表示外部传入的对象，例如 <code>%tt</code> 表示某个视图的顶部到其父视图顶部的距离</td>
</tr>

</tbody>
</table>

格式说明符用来指定外部传入的对象。下表列出了 COSLayout 支持的 13 种格式化字符串：

<table>
<thead>
<tr>
<th width="20%">格式说明符</th>
<th width="25%">类型</th>
<th>说明</th>
</tr>
</thead>
<tbody>

<tr>
<td><code>%tt</td>
<td><code>UIView *</code></td>
<td>视图顶部至父视图顶部的距离</td>
</tr>

<tr>
<td><code>%tb</code></td>
<td><code>UIView *</code></td>
<td>视图顶部至父视图底部的距离</td>
</tr>

<tr>
<td><code>%ll</code></td>
<td><code>UIView *</code></td>
<td>视图左侧至父视图左侧的距离</td>
</tr>

<tr>
<td><code>%lr</code></td>
<td><code>UIView *</code></td>
<td>视图左侧至父视图右侧的距离</td>
</tr>

<tr>
<td><code>%bb</code></td>
<td><code>UIView *</code></td>
<td>视图底部至父视图底部的距离</td>
</tr>

<tr>
<td><code>%bt</code></td>
<td><code>UIView *</code></td>
<td>视图底部至父视图顶部的距离</td>
</tr>

<tr>
<td><code>%rr</code></td>
<td><code>UIView *</code></td>
<td>视图右侧至父视图右侧的距离</td>
</tr>

<tr>
<td><code>%rl</code></td>
<td><code>UIView *</code></td>
<td>视图右侧至父视图左侧的距离</td>
</tr>

<tr>
<td><code>%ct</code></td>
<td><code>UIView *</code></td>
<td>视图中点到父视图顶部的距离</td>
</tr>

<tr>
<td><code>%cl</code></td>
<td><code>UIView *</code></td>
<td>视图中点到父视图左侧的距离</td>
</tr>

<tr>
<td><code>%w</code></td>
<td><code>UIView *</code></td>
<td>视图的宽度</td>
</tr>

<tr>
<td><code>%h</code></td>
<td><code>UIView *</code></td>
<td>视图的高度</td>
</tr>

<tr>
<td><code>%f</code></td>
<td><code>float</code></td>
<td>浮点数，固定点数</td>
</tr>

</tbody>
</table>

前 12 个格式说明符指定其他视图某个方向上的尺寸，它们将在约束被求解时动态计算大小。最后一个格式说明符指定一个浮点数。

### 依赖关系

COSLayout 在设置约束时，也会同时建立视图之间的依赖关系。依赖关系决定了视图布局的求解顺序。如果视图 `A` 依赖于视图 `B`，那么 `B` 的布局比 `A` 的布局先计算。

在 COSLayout 内部，依赖关系是通过有向无环图（DAG）表示的。所以，**COSLayout 不支持视图之间的相互依赖**。所以下面的例子将会引发异常：

{% highlight objective-c linenos=table %}
UIView *view1 = [[UIView alloc] init];
UIView *view2 = [[UIView alloc] init];

COSLayout *layout1 = [COSLayout layoutOfView:view1];
COSLayout *layout2 = [COSLayout layoutOfView:view2];

[layout1 addRule:@"rl = %ll", view2];
[layout2 addRule:@"ll = %rl", view1]; // Error

[layout1 addRule:@"rl = %ll + 50", view1]; // Error

[self.view addSubview:contentView];
{% endhighlight %}

以上代码有两处地方会引发循环依赖异常。在第 7 行，`view1` 的布局规则中引用了 `view2`，因此，`view1` 依赖于 `view2`。而在第 8 行，`view2` 的布局规则中反过来引用了 `view1`，这样，`view2` 依赖于 `view1`。就出现了依赖循环。在第 10 行，`view1` 的布局规则中引用了 `view1` 自身，也会导致依赖循环。

通过依赖关系来决定布局计算顺序的决定是基于实现的复杂度和性能考虑的。正是由于这种轻量的实现，它的效率会比 Auto Layout 高，因为它不会对多个约束进行多项式求解，仅仅是拓扑排序的复杂度。

尽管存在这种限制，COSLayout 足以应付绝大多数布局问题。下一节将介绍 COSLayout 的综合运用。

## 综合运用

在现实情况中，通常会遇到子视图右侧距离父视图右侧固定距离的情况，以下代码指定视图 `view` 右侧距离其父视图右侧的距离为 10。

{% highlight objective-c %}
UIView *view = [[UIView alloc] init];

COSLayout *layout = [COSLayout layoutOfView:view];

[layout addRule:@"rr = 10"];
{% endhighlight %}

再比如，经常会遇到一个视图的顶部距离前一个视图的顶部固定距离，这时可以这样：

{% highlight objective-c %}
UIView *view1 = [[UIView alloc] init];
UIView *view2 = [[UIView alloc] init];

COSLayout *layout = [COSLayout layoutOfView:view1];

[layout addRule:@"tt = %bt + 10", view2];
{% endhighlight %}

最后举一个稍微复杂的例子，这个例子将 `view1` 左侧、底部、和右侧的距离设置为 10，顶部距离 `view2` 的底部距离为 10。

{% highlight objective-c %}
UIView *view1 = [[UIView alloc] init];
UIView *view2 = [[UIView alloc] init];

COSLayout *layout = [COSLayout layoutOfView:view1];

[layout addRule:@"ll = bb = rr = %f, tt = %bt + 10", 10.0f, view2];
{% endhighlight %}

## 总结

COSLayout 是一个针对 iOS 视图布局的轻量实现。它不是 Auto Layout 的替代品，因为它不处理约束之间相互依赖的情况，除此之外，它可以轻松地处理几乎所有布局。

[1]: https://github.com/tang3w/CocoaSugar

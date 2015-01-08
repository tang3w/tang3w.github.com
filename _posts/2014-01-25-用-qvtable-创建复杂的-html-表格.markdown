---
layout: post
title: "用 QVTable 创建复杂的 HTML 表格"
published: true
categories:
- JavaScript
---

<link rel="stylesheet" type="text/css" href="/css/qvtable.css">
<script src="//cdn.staticfile.org/jquery/1.9.1/jquery.js"></script>
<script src="/js/QVTable.js"></script>

HTML 提供了 `table` 标签来创建表格。通常使用表格来表示一些结构化的数据。简单的结构化数据，例如报表或账单等，对应的表格也比较简单。但是有些复杂的数据用表格来表示就没那么容易了，比如下面这张表格：

<table class="qv-disable"><tr><td rowspan="2" colspan="4">A</td><td>B</td><td rowspan="3">C</td></tr><tr><td>D</td></tr><tr><td rowspan="3">E</td><td class="">F</td><td class="">G</td><td>H</td><td rowspan="3">I</td></tr><tr><td class="">J</td><td class="" rowspan="1">K</td><td class="" rowspan="2" colspan="1">L</td><td rowspan="2">M</td></tr><tr><td colspan="1">N</td><td rowspan="1" colspan="1" class="">N</td></tr><tr><td rowspan="1" colspan="1" class="">N</td><td rowspan="1" colspan="2" class="">N</td><td rowspan="1" colspan="3">N</td></tr></table>

要创建上面这个复杂的表格，你首先需要清楚 `table` 标签的 `rowspan` 和 `colspan` 属性是如何工作的。然后你得计算每个单元格的横向和纵向跨度，然后再用 HTML 写出来。但是，整个过程非常不直观。

为了解决上述问题，我实现了 [QVTable.js][1] 库，用来创建复杂的表格。下面是个示例，你可以先选中想要操作的单元格，然后点击表格上方的按钮来测试：

<div id="toolbar">
    <button id="remove">Remove</button>
    <button id="merge">Merge</button>
    <button id="sliceH">Slice In Horizontal</button>
    <button id="sliceV">Slice In Vertical</button><br/>
    <button id="newRowA">New Row After</button>
    <button id="newRowB">New Row Before</button>
    <button id="newColA">New Col After</button>
    <button id="newColB">New Col Before</button>
</div>

<table id="qv"><tr><td rowspan="2" colspan="4">A</td><td>B</td><td rowspan="3">C</td></tr><tr><td>D</td></tr><tr><td rowspan="3">E</td><td class="">F</td><td class="">G</td><td>H</td><td rowspan="3">I</td></tr><tr><td class="">J</td><td class="" rowspan="1">K</td><td class="" rowspan="2" colspan="1">L</td><td rowspan="2">M</td></tr><tr><td colspan="1">N</td><td rowspan="1" colspan="1" class="">N</td></tr><tr><td rowspan="1" colspan="1" class="">N</td><td rowspan="1" colspan="2" class="">N</td><td rowspan="1" colspan="3">N</td></tr></table>

QVTable 会试图以比较自然的方式来操作表格。例如，当你删除一个单元格时，QVTable 会依次以左，右，上，下的顺序来寻找周围的单元格，扩展它们来填充被删除的空间。当你添加一个新的行或列时，QVTable 不会破坏该行或列上已合并的单元格，相反，QVTable 会将它们延长一个单位，从而省去了二次合并的繁琐操作。

值得一提的是，当你删除或合并单元格之后，QVTable 会试图压缩整张表格。压缩的过程是逐一扫描列和行，如果某一列或行上的单元格有公共的冗余，那么冗余将被清除。具体来说，如果在上表中，将 B 和 D 合并成 B，那么 A, C 和合并之后的 B 就有一个单位的冗余，所以它们的高度都会减去 1 个单位。这种机制可以避免表格只能扩大而不能减小的问题。

QVTable 只是个实验项目，还有一些值得优化和改进的地方。我计划把其中的某些特性移植到 iOS 上面，以支持 [QuickViz][2] 的表格编辑操作。该项目已放在 Github 上以 MIT 协议开源了，欢迎提出好的建议。

[1]: https://github.com/tang3w/QVTable
[2]: http://tang3w.com/quickviz.html

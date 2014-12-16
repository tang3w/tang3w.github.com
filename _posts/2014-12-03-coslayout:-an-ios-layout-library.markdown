---
layout: post
title: "COSLayout: An iOS Layout Library"
published: true
---

### Introduction

[COSLayout][1] is yet another layout library. It's neither a wrapper nor a replacement for Auto Layout. It dose not handle circular references of constraints and constraint priority. Besides that, `COSLayout` can solve all layout cases. What's more, `COSLayout` provides some additional benefits: smaller memory footprint, better performance and more intuitive expression.

`COSLayout` is an abstraction of layout of view. With `COSLayout`, you can specify view's layout relative to it's superview, sibling views and non-sibling views. Following example specifies a 10-points constraint from view's bottom to superview's bottom:

```objc
UIView *view = [[UIView alloc] init];

COSLayout *layout = [COSLayout layoutOfView:view];

[layout addRule:@"bb = 10"];
```

In the example above, a rule has been added into layout by method `addRule:`. A rule is expressed in Sample Layout Language or "SLL", which can specify constraints intuitively. The syntax of SLL is very simple, just comma-separated assignment expressions. Each assignment expression specifies a constraint, l-value is constraint name, r-value is constraint value.

`COSLayout` supports 14 constraints:

Constraint | Direction  | Description
-----------|------------|------------
`tt`       | Vertical   | Space from view's top to superview's top
`tb`       | Vertical   | Space from view's top to superview's bottom
`ll`       | Horizontal | Space from view's left to superview's left
`lr`       | Horizontal | Space from view's left to superview's right
`bb`       | Vertical   | Space from view's bottom to superview's bottom
`bt`       | Vertical   | Space from view's bottom to superview's top
`rr`       | Horizontal | Space from view's right to superview's right
`rl`       | Horizontal | Space from view's right to superview's left
`ct`       | Vertical   | Space from view's center to superview's top
`cl`       | Horizontal | Space from view's center to superview's left
`minw`     | Horizontal | Minimal width of view
`maxw`     | Horizontal | Maximal width of view
`minh`     | Vertical   | Minimal height of view
`maxh`     | Vertical   | Maximal height of view

`COSLayout` supports 4 constraint value types:

Constraint Value Type | Example             | Description
----------------------|---------------------|------------
Float                 | `5` `-10` `20.0f`   | Fixed length on screen
Percentage            | `5%` `-10%` `20.0%` | Percentage of superview's width or height
Format specifier      | `%tt` `%w` `%f`     | Constraint value given by additional argument
Constraint            | `tt` `maxw`         | Constraint value of current layout

Note that the percentage has different means for different constraint directions. If current constraint direction is horizontal, the percentage represents the percentage of superview's width, otherwise, the percentage of superview's height.

Format specifier represents a constraint value given by additional argument. For example, `%tt` is the space from other view's top to superview's top. Here, the other view is given by additional argument, and the superview is the superview of layout's view. It means that `COSLayout` can specify constraints between non-sibling views.

`COSLayout` support 14 format specifiers:

Format specifier | Type       | Description
-----------------|------------|------------
`%tt`            | `UIView *` | Space from view's top to superview's top
`%tb`            | `UIView *` | Space from view's top to superview's bottom
`%ll`            | `UIView *` | Space from view's left to superview's left
`%lr`            | `UIView *` | Space from view's left to superview's right
`%bb`            | `UIView *` | Space from view's bottom to superview's bottom
`%bt`            | `UIView *` | Space from view's bottom to superview's top
`%rr`            | `UIView *` | Space from view's right to superview's right
`%rl`            | `UIView *` | Space from view's right to superview's left
`%ct`            | `UIView *` | Space from view's center to superview's top
`%cl`            | `UIView *` | Space from view's center to superview's left
`%w`             | `UIView *` | Width of view
`%h`             | `UIView *` | Height of view
`%f`             | `float`    | Fixed length on screen
`%p`             | `float`    | Percentage of superview's width or superview's height

It is worth mentioning that, format specifier also create a dependency between two views: the layout view and the other view given by additional argument. In `COSLayout`, the dependencies is presented by DAG. So `COSLayout` do not support the circular dependencies. When superview needs layout, all layouts of subviews will solve it's constraints according to the dependencies.

### Constraint value expression

You can apply arithmetic operator between constraint values. Like other languages, SLL supports 5 basic arithmetic operators:

Operator name | Priority | Associativity | Code examples
--------------|----------|---------------|--------------
`=`           | 1        | right         | `tt = 20` `ct = 50%`
`+`           | 2        | left          | `10 + 20` `50% + 10` `%w + 5`
`-`           | 2        | left          | `20 - 10` `50% - 10` `%h - 5`
`*`           | 3        | left          | `50 * 2` `80% * 0.5` `%h * 2`
`/`           | 3        | left          | `100 / 2` `100% / 2` `%h / 2`

You can also use `()` to group sub-expression to change the evaluation order of expression.

### Examples

In the following example, `COSLayout` aligns view's top-right corner to superview's top-right corner with 5-points space.

```objc
UIView *view = [[UIView alloc] init];

COSLayout *layout = [COSLayout layoutOfView:view];

[layout addRule:@"tt = rr = 5"];
```

In the following example, `COSLayout` aligns view's left/bottom/right to superview's left/bottom/right with 10-points space, and make the view's top aligned to superview's center.

```objc
UIView *view = [[UIView alloc] init];

COSLayout *layout = [COSLayout layoutOfView:view];

[layout addRule:@"ll = bb = rr = 10, tt = 50%"];
```

[1]: https://github.com/tang3w/CocoaSugar

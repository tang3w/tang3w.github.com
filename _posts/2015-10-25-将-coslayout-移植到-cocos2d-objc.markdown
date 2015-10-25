---
layout: post
title: "将 COSLayout 移植到 Cocos2D-ObjC"
published: true
---

前段时间接触了 [Cocos2D-ObjC](http://cocos2d-objc.org/) 这个游戏框架，发现在布局元素（即 Cocoa2D-ObjC 中的 `CCNode`）时，使用了跟 Cocoa Touch 不同的坐标系。Cocos2D-ObjC 遵循[笛卡尔坐标系](https://en.wikipedia.org/wiki/Cartesian_coordinate_system)，而在 Cocoa Touch 以及其他许多 UI 系统中，Y 轴是反向的。

Cocos2D-ObjC 构建于 OpenGL ES 之上，OpenGL ES 使用的是笛卡尔坐标系。Cocos2D-ObjC 很自然地继承了这一点，并将元素的左下角定义为坐标系原点。这样，我们就能利用这个坐标系来安排元素的位置了。在这之上，Cocos2D-ObjC 为开发者提供了一层简单的封装，例如允许使用百分数以及不同单位来指定元素的大小和位置。

不过遗憾的是，`CCNode` 并没有继承 `UIView`，这也许是基于性能的考虑。因此无法利用 Auto Layout 这个强大的工具来轻松地构建复杂的、自适应的布局。

我思索着如何更快地在这个系统中构建复杂的布局，如何更快地将一个元素安排到场景中的某个位置。自然地想到了之前为 `UIView` 实现的一个辅助布局的库 — [COSLayout](https://github.com/tang3w/COSLayout)，在《[使用 COSLayout 来布局 iOS 视图](http://tang3w.com/objective-c/2014/11/11/%E4%BD%BF%E7%94%A8-coslayout-%E6%9D%A5%E5%B8%83%E5%B1%80-ios-%E8%A7%86%E5%9B%BE.html)》这篇文章中有详细的描述。我想，有没有可能在 Cocos2D-ObjC 中实现这样的布局系统呢？

探索一番后，发现理论上是可行的，因为 Cocos2D-ObjC 为 `CCNode` 提供了跟 `UIView` 相似的回调接口。COSLayout 的实现依赖于这些回调接口，而我只需要把它们换成 `CCNode` 中对应的回调接口，就可以几乎原封不动地把 COSLayout 搬到 Cocos2D-ObjC 中了。

经过几处接口替换，COSLayout 已经可以完美地运行在 Cocos2D-ObjC 中了。用法跟 `UIView` 中的完全一样，唯一的差别是坐标系统稍有不同，例如，约束 `tt = 0` 在 Cocoa Touch 中表示跟父视图（super view）的顶部对齐；而在 Cocos2D-ObjC 中，表示跟父节点（parent node）的底部对齐。

最后，为防止命名冲突，将类名改成了 `CCSLayout`。源代码在 [github.com/tang3w/ccslayout](https://github.com/tang3w/ccslayout)。

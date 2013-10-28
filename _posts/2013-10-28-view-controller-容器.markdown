---
layout: post
title: "View Controller 容器"
published: false
categories:
- translate
- objc.io
---

<p id="state">注：这篇翻译已经过 objc.io 授权，原文链接是：<a href="http://www.objc.io/issue-1/testing-view-controllers.html" title="Testing View Controllers">Testing View Controllers</a></p>

在 iOS 5 之前，view controller 容器只是 Apple 公司的一个福利。实际上，在 view controller 编程指南中还有一段申明，你不应该使用它们。Apple 对 view controllers 的总的建议是“一个 view controller 管理一个全屏幕的内容”。这个建议后来被改为“一个 view controller 管理一个自包含的内容单元”。为什么 Apple 不想让我们构建自己的 tab bar controllers 和 navigation controllers？或者更确切地说，这段代码有什么问题：

{% highlight objective-c %}

[viewControllerA.view addSubView:viewControllerB.view]

{% endhighlight %}

![Inconsistent view hierarchy][1]

UIWindow 作为作为一个应用程序的根视图（root view），是旋转和初始布局消息等事件产生的来源。在上图中，child view controller 的 view 插入到 root view controller 的视图层级中，被排除在这些事件之外了。View 事件方法诸如 `viewWillAppear:` 将不会被调用。

在 iOS 5 之前构建自定义的 view controller 容器时，要保存一个 child view controller 的引用，还要手动在 parent view controller 中转发所有 view 事件方法的调用，要做好非常困难。

### 一个例子

当你还是个孩子，在沙滩上玩时，你父母是否告诉过你，如果不停地用铲子挖，最后会到达中国？我父母就说过，我就做了个叫做 *Tunnel* 的 demo 程序来验证这个说法。你可以 clone 这个 [Github 代码库][2]并运行这个程序，它有助于让你更容易理解示例代码。*（剧透：从丹麦西部开始，挖穿地球，你会到达南太平洋的某个地方。）*

![Tunnel screenshot][3]



<p class="date"><a href="https://twitter.com/rickigregersen">Ricki Gregersen</a>, 2013 年 6 月</p>

[1]: http://www.objc.io/images/issue-1/view-insertion@2x.png
[2]: https://github.com/RickiG/view-controller-containment
[3]: http://www.objc.io/images/issue-1/tunnel-screenshot@2x.png

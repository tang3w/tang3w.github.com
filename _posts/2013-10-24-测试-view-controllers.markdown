---
layout: post
title: "测试 View Controllers"
published: false
categories:
- translate
- objc.io
---

<p id="state">注：这篇翻译已经过 objc.io 授权，原文链接是：<a href="http://www.objc.io/issue-1/testing-view-controllers.html" title="Testing View Controllers">Testing View Controllers</a></p>

我们不是迷信测试，但它应该能帮助我们加快开发进度，并且让事情变得更有趣。

### 让事情保持简单

测试简单的事情很简单，同样，测试复杂的事会很复杂。就像我们在其他文章中指出的那样，让事情保持简单小巧总是好的。除此之外，它还有利于我们测试。这是件双赢的事。让我们来看看[测试驱动开发][1]（简称 TDD），有些人喜欢它，有些人则不喜欢。我们在这里不深入讨论，只是如果用 TDD，你得在写代码之前先写好测试。如果有什么疑问，可以去看看 Wikipedia 上的文章。同时，我们也认为重构和测试可以很好地结合在一起。

测试 UI 部分通常很麻烦，因为它们包含太多活动部件。通常，view controller 需要和大量的 model 和 view 类交互。为了使 view controller 便于测试，我们要让任务尽量分离。

幸好，我们在[更轻量的 view controller][2] 这篇文章中的阐述的技术可以让测试更加简单。通常，如果你发现有些地方很难做测试，这就说明你的设计出问题了，你应该重构它。你可以重新参考[更轻量的 view controller][2] 来获得一些帮助。总的目标就是有清晰的关注点分离。每个类只做一件事，并且做好。这样就可以让你测试一件事。

记住：测试越多，回报的增长趋势越慢。首先你应该做简单的测试。当你觉得满意时，再加入更多复杂的测试。

### Mocking

当你把一个整体拆分成小零件（即更小的类）时，我们可以在每个类中进行测试。但由于我们测试的类会和其他类交互，这里我们用一个所谓的 `mock` 或 `stub` 来绕开它。把 `mock` 对象看成是一个占位符，我们测试的类会跟这个占位符交互，而不是真正的那个对象。这样，我们就可以针对性地测试，并且保证不依赖于应用程序的其他部分。

在示例程序中，我们有个包含数组的 data source 需要测试。这个 data source 会在某个时候从 table view 中取出（dequeue）一个 cell。在测试过程中，还没有 table view，但是我们传递一个 `mock` table view，这样即使没有 table view，也可以测试 data source，就像下面你即将看到的。起初可能有点难以理解，多看几次后，你就能体会到它的强大和简单。

Objective-C 中有个用来 mocking 的强大工具叫做 [OCMock][3]。它是一个非常成熟的项目，充分利用了 Objective-C 运行时强大的能力和灵活性。它使用了一些很酷的技巧，让通过 mock 对象来测试变得更加有趣。

本文后面有 data source 测试的例子，它更加详细地展示了这些技术如何工作在一起。

### SenTestKit

我们将要使用的另一个工具是一个测试框架，开发者工具的一部分：[Sente][4] 的 SenTestingKit。这个上古神器从 1997 年起就伴随在 Objective-C 开发者左右，比第一款 iPhone 发布还早 10 年。现在，它已经集成到 Xcode 中了。SenTestingKit 会运行你的测试。通过 SenTestingKit，你将测试组织在类中。你需要给每一个你想测试的类创建一个测试类，类名以 `Testing` 结尾，它反应了这个类是干什么的。

这些测试类的方法会做具体的测试工作。方法名必须以 `test` 开头，作为触发一个测试的条件。还有特殊的 `-setUp` 和 `-tearDown` 方法，你可以重载它们来设置每一个测试。记住，你的测试类就是个类：只要对你有帮助，随便加 properties 和辅助方法。

在做测试时，一个不错的模式是为测试创建一个基础类。

<p class="date"><a href="https://twitter.com/danielboedewadt">Daniel Eggert</a>, 2013 年 6 月</p>

[1]: https://en.wikipedia.org/wiki/Test-driven_development
[2]: http://tang3w.com/true/objc.io/2013/10/22/%E6%9B%B4%E8%BD%BB%E9%87%8F%E7%9A%84-view-controllers.html
[3]: http://ocmock.org/
[4]: http://www.sente.ch/

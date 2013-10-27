---
layout: post
title: "整理 Table View 的代码"
published: true
categories:
- translate
- objc.io
---

<p id="state">注：这篇翻译已经过 objc.io 授权，原文链接是：<a href="http://www.objc.io/issue-1/table-views.html" title="Clean table view code">Clean table view code</a></p>

Table view 是 iOS 应用程序中非常通用的组件。所以许多代码和 table view 都有直接或间接的关系，包括提供数据、更新 table view，控制它的行为以及响应选择事件，仅举这几个例子。在这篇文章中，我们将会展示保持代码整洁和组织良好的技术。

### UITableViewController vs. UIViewController

Apple 提供了 `UITableViewController` 作为 table views 专属的 view controller 类。Table view controllers 实现了一些非常有用的特性来帮你避免一遍又一遍地写那些死板的代码！但是话又说回来，table view controller 只限于管理一个全屏展示的 table view。大多数情况下，这就是你想要的，但如果不是，还有其他方法来解决这个问题，就像下面我们展示的那样。

#### Table View Controllers 的特性

Table view controllers 会在第一次显示 table view 的时候帮你加载其数据。特别地，他还会帮你切换 table view 的编辑模式、响应键盘通知、以及一些小任务，比如闪现 scroll indicator 和消除选择。为了让这些特性生效，当你在子类中覆写事件方法时，需要调用 super。

Table view controllers 相对于标准 view controllers 的唯一卖点就是它支持 Apple 实现的“下拉刷新”。目前，整个文档只有在 table view controller 中使用过 `UIRefreshControl`，虽然在其他几种上下文中也能工作（[见此处][1]），但很可能在下一次 iOS 更新的时候无法工作。

这些元素提供了 Apple 为 table view 定义的大多数交互行为，如果你的应用恰好符合这些特性，那么坚持使用 table view controllers 来避免写那些死板的代码是个很好的方法。

#### Table View Controllers 的限制

Table view controllers 的 view 属性永远都是一个 table view。如果你稍后决定在 table view 旁边显示一些东西（比如一个地图），如果不依赖于那些奇怪的 hacks，你就不会那么走运了。

如果你用代码或 .xib 文件定义了界面，那么迁移到一个标准 view controller 将会非常简单。如果你使用了 storyboards，那么这个过程要多包含几个步骤。你不能在 storyboards 中将 table view controller 改成一个标准的 view controller，除非你重新创建它。这意味着你必须将所有内容拷贝到新的 view controller，然后再重新连接一遍。

最后，你需要把迁移后丢失的 table view controller 的特性给补回来。大多数都是 `viewWillAppear` 或 `viewDidAppear` 中简单的一条语句。切换编辑模式需要实现一个 action 方法，用来切换 table view 的 `editing` 属性。大多数工作来自对键盘的支持。

在选择条路之前，你还有一个更轻松的选择，它有**分离关注点 ( separating concerns ) **的额外好处：

#### Child View Controllers

和完全抛弃 table view controller 不同，你还可以将它作为 child view controller 添加到其他 view controller 中（看[关于此问题的文章][2]）。然后 table view controller 继续管理它的 table view，如果需要，parent view controller 可以关心其他的界面元素。

{% highlight objective-c %}

- (void)addPhotoDetailsTableView
{
    DetailsViewController *details = [[DetailsViewController alloc] init];
    details.photo = self.photo;
    details.delegate = self;
    [self addChildViewController:details];
    CGRect frame = self.view.bounds;
    frame.origin.y = 110;
    details.view.frame = frame;
    [self.view addSubview:details.view];
    [details didMoveToParentViewController:self];
}

{% endhighlight %}

如果你使用这个解决方案，你就必须在 child view controller 和 parent view controller 之间建立消息传递的渠道。比如，如果用户选择了一个 table view 中的 cell，parent view controller 需要知道这个事件来推入其他 view controller。根据使用习惯，通常最清晰的方式是为这个 table view controller 定义一个 delegate protocol，然后到 parent view controller 中去实现。

{% highlight objective-c %}

@protocol DetailsViewControllerDelegate
- (void)didSelectPhotoAttributeWithKey:(NSString *)key;
@end

@interface PhotoViewController () <DetailsViewControllerDelegate>
@end

@implementation PhotoViewController
// ...
- (void)didSelectPhotoAttributeWithKey:(NSString *)key
{
    DetailViewController *controller = [[DetailViewController alloc] init];
    controller.key = key;
    [self.navigationController pushViewController:controller animated:YES];
}
@end

{% endhighlight %}

就像你看到的那样，这种结构为 view controller 之间的消息传递带来了额外的开销，但是作为回报，获得了清晰的关注点分离和更好的可复用性。根据实际情况来看，这既没有让事情变得更简单，也没有更复杂，请读者自行斟酌。

### 分离关注点（Separating Concerns）

当处理 table views 的时候，有许多各种各样的任务，这些任务穿梭于 models，controllers 和 views 之间。为了避免让 view controllers 做所有的事，我们将尽可能地把这些任务划分到合适的地方，这样有利于阅读、维护和测试。

这里描述的技术是文章[更轻量的 View Controllers][3] 中的概念的延伸，请参考这篇文章来理解如何重构 data source 和 model 的逻辑。结合 table views，我们来具体看看如何在 view controllers 和 views 之间分离关注点。

#### 搭建 Model 对象和 Cells 之间的桥梁

有时我们需要处理在 view layer 中显示的数据。由于我们同时也希望让 model 和 view 之间明确分离，所以通常把这个任务转移到 table view 的 data source 中去做。

{% highlight objective-c %}

- (UITableViewCell *)tableView:(UITableView *)tableView
         cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    PhotoCell *cell = [tableView dequeueReusableCellWithIdentifier:@"PhotoCell"];
    Photo *photo = [self itemAtIndexPath:indexPath];
    cell.photoTitleLabel.text = photo.name;
    NSString* date = [self.dateFormatter stringFromDate:photo.creationDate];
    cell.photoDateLabel.text = date;
}

{% endhighlight %}

但是这样的代码会让 data source 变得混乱，因为它向 data source 暴露了 cell 的设计。最好分解出来，放到 cell 类的一个 category 中。

{% highlight objective-c %}

@implementation PhotoCell (ConfigureForPhoto)

- (void)configureForPhoto:(Photo *)photo
{
    self.photoTitleLabel.text = photo.name;
    NSString* date = [self.dateFormatter stringFromDate:photo.creationDate];
    self.photoDateLabel.text = date;
}

@end

{% endhighlight %}

有了上述代码后，我们的 data source 方法就变得简单了。

{% highlight objective-c %}

- (UITableViewCell *)tableView:(UITableView *)tableView
         cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    PhotoCell *cell = [tableView dequeueReusableCellWithIdentifier:PhotoCellIdentifier];
    [cell configureForPhoto:[self itemAtIndexPath:indexPath]];
    return cell;
}

{% endhighlight %}

在我们的示例代码中，table view 的 data source 已经[分解到单独的类中了][4]，它用一个设置 cell 的 block 来初始化。这时，这个 block 就变得这样简单了：

{% highlight objective-c %}

TableViewCellConfigureBlock block = ^(PhotoCell *cell, Photo *photo) {
    [cell configureForPhoto:photo];
};

{% endhighlight %}

#### 让 Cells 可复用

有时多种 model 对象需要用同一类型的 cell 来表示，这种情况下，我们可以进一步让 cell 可以复用。首先，我们给 cell 定义一个 protocol，需要用这个 cell 显示的对象必须遵循这个 protocol。然后简单修改 category 中的设置方法，让它可以接受遵循这个 protocol 的任何对象。这些简单的步骤让 cell 和任何特殊的 model 对象之间得以解耦，让它可适应不同的数据类型。

#### 在 Cell 内部控制 Cell 的状态

如果你想自定义 table views 默认的高亮或选择行为，你可以实现两个 delegate 方法，把点击的 cell 修改成我们想要的样子。例如：

{% highlight objective-c %}

- (void)tableView:(UITableView *)tableView
        didHighlightRowAtIndexPath:(NSIndexPath *)indexPath
{
    PhotoCell *cell = [tableView cellForRowAtIndexPath:indexPath];
    cell.photoTitleLabel.shadowColor = [UIColor darkGrayColor];
    cell.photoTitleLabel.shadowOffset = CGSizeMake(3, 3);
}

- (void)tableView:(UITableView *)tableView
        didUnhighlightRowAtIndexPath:(NSIndexPath *)indexPath
{
    PhotoCell *cell = [tableView cellForRowAtIndexPath:indexPath];
    cell.photoTitleLabel.shadowColor = nil;
}

{% endhighlight %}

然而，这两个 delegate 方法的实现又暴露了 cell 如何实现的具体细节。如果我们想替换或重新设计 cell，我们必须改写 delegate 代码。View 的实现细节和 delegate 的实现交织在一起了。相反，我们应该把这些细节移到 cell 自身中去。

{% highlight objective-c %}

@implementation PhotoCell
// ...
- (void)setHighlighted:(BOOL)highlighted animated:(BOOL)animated
{
    [super setHighlighted:highlighted animated:animated];
    if (highlighted) {
        self.photoTitleLabel.shadowColor = [UIColor darkGrayColor];
        self.photoTitleLabel.shadowOffset = CGSizeMake(3, 3);
    } else {
        self.photoTitleLabel.shadowColor = nil;
    }
}
@end

{% endhighlight %}

总的来说，我们在努力把 view layer 和 controller layer 的实现细节分离开。delegate 肯定得清楚一个 view 该显示什么状态，但是它不应该了解如何修改 view tree 或者给 subviews 设置哪些属性以获得正确的状态。所有这些逻辑都应该封装到 view 内部，然后给外部提供一个简单地 API。

#### 控制多个 Cell 类型

如果一个 table view 里面有多种类型的 cell，data source 方法很快就难以控制了。在我们示例程序中，photo details table 有两种不同类型的 cell：一个用于显示几个星，另一个用来显示一个键值对。为了划分处理不同 cell 类型的代码，data source 方法简单地通过判断 cell 的类型，把任务派发给其他指定的方法。

{% highlight objective-c %}

- (UITableViewCell *)tableView:(UITableView *)tableView
         cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    NSString *key = self.keys[(NSUInteger) indexPath.row];
    id value = [self.photo valueForKey:key];
    UITableViewCell *cell;
    if ([key isEqual:PhotoRatingKey]) {
        cell = [self cellForRating:value indexPath:indexPath];
    } else {
        cell = [self detailCellForKey:key value:value];
    }
    return cell;
}

- (RatingCell *)cellForRating:(NSNumber *)rating
                    indexPath:(NSIndexPath *)indexPath
{
    // ...
}

- (UITableViewCell *)detailCellForKey:(NSString *)key
                                value:(id)value
{
    // ...
}

{% endhighlight %}

#### 编辑 Table View

Table view 提供了易于使用的编辑特性，允许你对 cell 进行删除或重新排序。这些事件，都可以让 table view 的 data source 通过 [delegate 方法][5]得到通知。因此，通常我们能在这些 delegate 方法中看到对数据的进行修改的操作。

修改数据很明显是属于 model layer 的任务。Model 应该为诸如删除或重新排序等操作暴露一个 API，然后我们可以在 data source 方法中调用它。这样，controller 就可以扮演 view 和 model 之间的**协调者 ( coordinator ) **，而不需要知道 model 层的实现细节。并且还有额外的好处，model 的逻辑也变得更容易测试，因为它不再和 view controllers 的任务混杂在一起了。

### 总结

Table view controllers（以及其他的 controller 对象！）应该在 model 和 view 对象之间扮演[协调者和调解者的角色][2]。它不应该关心明显属于 view layer 或 model layer 的任务。你应该始终记住这点，这样 delegate 和 data source 方法会变得更小巧，最多包含一些简单地样板代码。

这不仅减少了 table view controllers 那样的大小和复杂性，而且还把业务逻辑和 view 的逻辑放到了更合适的地方。Controller layer 的里里外外的实现细节都被封装成了简单地 API，最终，它变得更加容易理解，也更利于团队协作。

### 扩展阅读

- [Blog: Skinnier Controllers using View Categories][6]
- [Table View Programming Guide][7]
- [Cocoa Core Competencies: Controller Object][8]

<p class="date"><a href="http://twitter.com/floriankugler">Florian Kugler</a>, 2013 年 6 月</p>

------

该主题下的更多文章：

- [介绍 objc.io][9]
- [更轻量的 View Controllers][10]
- [测试 View Controllers][11]
- [View Controller 容器][12]

[1]: http://stackoverflow.com/questions/12805003/uirefreshcontrol-issues
[2]: http://www.objc.io/issue-1/containment-view-controller.html
[3]: http://tang3w.com/translate/objc.io/2013/10/22/%E6%9B%B4%E8%BD%BB%E9%87%8F%E7%9A%84-view-controllers.html
[4]: http://tang3w.com/translate/objc.io/2013/10/22/%E6%9B%B4%E8%BD%BB%E9%87%8F%E7%9A%84-view-controllers.html#controllers
[5]: http://developer.apple.com/library/ios/#documentation/uikit/reference/UITableViewDataSource_Protocol/Reference/Reference.html#//apple_ref/occ/intfm/UITableViewDataSource/tableView:commitEditingStyle:forRowAtIndexPath:
[6]: http://www.sebastianrehnby.com/blog/2013/01/01/skinnier-controllers-using-view-categories/
[7]: http://developer.apple.com/library/ios/#documentation/userexperience/conceptual/tableview_iphone/AboutTableViewsiPhone/AboutTableViewsiPhone.html
[8]: http://developer.apple.com/library/mac/#documentation/General/Conceptual/DevPedia-CocoaCore/ControllerObject.html
[9]: http://tang3w.com/translate/objc.io/2013/10/21/%E4%BB%8B%E7%BB%8D-objc.io.html
[10]: http://tang3w.com/true/objc.io/2013/10/22/%E6%9B%B4%E8%BD%BB%E9%87%8F%E7%9A%84-view-controllers.html
[11]: http://localhost:4000/translate/objc.io/2013/10/24/%E6%B5%8B%E8%AF%95-view-controllers.html
[12]: http://www.objc.io/issue-1/containment-view-controller.html



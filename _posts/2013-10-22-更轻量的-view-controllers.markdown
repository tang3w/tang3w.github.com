---
layout: post
title: "更轻量的 View Controllers"
published: false
categories:
- translate
- objc.io
---

<p id="state">注：这篇翻译已经过 objc.io 授权，原文链接是：<a href="http://www.objc.io/issue-1/lighter-view-controllers.html" title="Lighter View Controllers">Lighter View Controllers</a></p>

View controllers 通常是 iOS 项目中最大的文件，因为它们包含了许多不必要的代码。所以 View controllers 几乎总是复用率最低的那部分代码。我们将会看到给 view controllers 瘦身的技术，让代码可以复用，以及把代码移动到更合适的地方。

你可以在Github上获取关于这个问题的[示例项目][1]。

### 把 Data Source 和其他 Protocols 分离出来

把 `UITableViewDataSource` 的代码提取出来放到一个单独的类中，是为 view controller 瘦身的强大技术之一。当你多做几次，你就会发现这种模式，并且创建出可复用的类。

举个例，在示例项目中，有个 `PhotosViewController` 类，它有以下几个方法：

{% highlight objective-c %}

# pragma mark Pragma 

- (Photo*)photoAtIndexPath:(NSIndexPath*)indexPath {
    return photos[(NSUInteger)indexPath.row];
}

- (NSInteger)tableView:(UITableView*)tableView 
 numberOfRowsInSection:(NSInteger)section {
    return photos.count;
}

- (UITableViewCell*)tableView:(UITableView*)tableView 
        cellForRowAtIndexPath:(NSIndexPath*)indexPath {
    PhotoCell* cell = [tableView dequeueReusableCellWithIdentifier:PhotoCellIdentifier 
                                                      forIndexPath:indexPath];
    Photo* photo = [self photoAtIndexPath:indexPath];
    cell.label.text = photo.name;
    return cell;
}

{% endhighlight %}

许多代码都围绕数组做一些事情，有些是专门针对 view controller 所管理的 photos 的。所以我们可以尝试把数组相关的代码移到单独的类中。我们使用一个 block 来设置 cell，也可以用 delegate 来做这件事，取决于你的习惯。

{% highlight objective-c %}

@implementation ArrayDataSource

- (id)itemAtIndexPath:(NSIndexPath*)indexPath {
    return items[(NSUInteger)indexPath.row];
}

- (NSInteger)tableView:(UITableView*)tableView 
 numberOfRowsInSection:(NSInteger)section {
    return items.count;
}

- (UITableViewCell*)tableView:(UITableView*)tableView 
        cellForRowAtIndexPath:(NSIndexPath*)indexPath {
    id cell = [tableView dequeueReusableCellWithIdentifier:cellIdentifier
                                              forIndexPath:indexPath];
    id item = [self itemAtIndexPath:indexPath];
    configureCellBlock(cell,item);
    return cell;
}

@end

{% endhighlight %}

现在，你可以把 view controller 中的这 3 个方法去掉了，取而代之，你可以创建一个 `ArrayDataSource` 类的实例作为 table view 的 data source。

{% highlight objective-c %}

void (^configureCell)(PhotoCell*, Photo*) = ^(PhotoCell* cell, Photo* photo) {
   cell.label.text = photo.name;
};
photosArrayDataSource = [[ArrayDataSource alloc] initWithItems:photos
                                                cellIdentifier:PhotoCellIdentifier
                                            configureCellBlock:configureCell];
self.tableView.dataSource = photosArrayDataSource;

{% endhighlight %}

现在你不用担心把一个 index path 映射到数组中的位置了，每次你想把这个数组显示到一个 table view 中时，你都可以复用这些代码。你也可以实现一些额外的方法，比如 `tableView:commitEditingStyle:forRowAtIndexPath:`，在 table view controllers 之间共享。

这样的好处在于，你可以单独[测试这个类][2]，再也不用写第二遍。该原则同样适用于数组之外的其他对象。

在今年我们做的一个应用里面，我们大量使用了 Core Data。我们创建了相似的类，但和之前使用的数组不一样，它用一个 fetched results controller 来获取数据。它实现了所有动画更新、处理 section headers、删除操作等逻辑。你可以创建这个类的实例，然后赋予一个 fetch request 和用来设置 cell 的 block，剩下的它都会处理，不用你操心了。

此外，这种方法也可以扩展到其他 protocols 上面。最明显的一个就是 `UICollectionViewDataSource`。这给了你极大的灵活性；如果，在开发的某个时候，你想用 `UICollectionView` 代替 `UITableView`，你几乎不需要对 view controller 作任何修改。你甚至可以让你的 data source 同时支持这两个协议。

### 将业务逻辑移到 Model 中

下面是 view controller（来自其他项目）中的示例代码，用来查找一个用户的目前的优先事项列表：

{% highlight objective-c %}

- (void)loadPriorities {
    NSDate* now = [NSDate date];
    NSString* formatString = @"startDate <= %@ AND endDate >= %@";
    NSPredicate* predicate = [NSPredicate predicateWithFormat:formatString, now, now];
    NSSet* priorities = [self.user.priorities filteredSetUsingPredicate:predicate];
    self.priorities = [priorities allObjects];
}

{% endhighlight %}

但是，把这些代码移动到 `User` 类的 category 中将会更加清晰。这样，在 `View Controller.m` 中看起来是这样：

{% highlight objective-c %}

- (void)loadPriorities {
    self.priorities = [user currentPriorities];
}

{% endhighlight %}

在 `User+Extensions.m` 中：

{% highlight objective-c %}

- (NSArray*)currentPriorities {
    NSDate* now = [NSDate date];
    NSString* formatString = @"startDate <= %@ AND endDate >= %@";
    NSPredicate* predicate = [NSPredicate predicateWithFormat:formatString, now, now];
    return [[self.priorities filteredSetUsingPredicate:predicate] allObjects];
}

{% endhighlight %}

有些代码不能被轻松地移动到 model 对象中，但明显和 model 代码紧密联系，对于这种情况，我们可以使用一个 `Store`：

### 创建 Store 类

在我们示例应用程序的第一个版本中，有些代码去加载文件并解析它。下面就是 view controller 中得代码：

{% highlight objective-c %}

- (void)readArchive {
    NSBundle* bundle = [NSBundle bundleForClass:[self class]];
    NSURL *archiveURL = [bundle URLForResource:@"photodata"
                                 withExtension:@"bin"];
    NSAssert(archiveURL != nil, @"Unable to find archive in bundle.");
    NSData *data = [NSData dataWithContentsOfURL:archiveURL
                                         options:0
                                           error:NULL];
    NSKeyedUnarchiver *unarchiver = [[NSKeyedUnarchiver alloc] initForReadingWithData:data];
    _users = [unarchiver decodeObjectOfClass:[NSArray class] forKey:@"users"];
    _photos = [unarchiver decodeObjectOfClass:[NSArray class] forKey:@"photos"];
    [unarchiver finishDecoding];
}

{% endhighlight %}



<p class="date"><a href="http://twitter.com/chriseidhof">Chris Eidhof</a>, 2013 年 6 月</p>

------


[1]: https://github.com/objcio/issue-1-lighter-view-controllers
[2]: http://www.objc.io/issue-1/testing-view-controllers.html#testing-datasource

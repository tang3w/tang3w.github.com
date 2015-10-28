---
layout: post
title: "让 libcurl 在 Darwin 上支持 SSL Pinning"
published: true
---

前两天为 LeanCloud SDK 添加 public key pinning（以下简称 pinning）时，遇到一个问题，做一下记录。

从 libcurl 的 [changelog](http://curl.haxx.se/changes.html) 来看，从 7.39.0 开始就支持 pinning 了。但测试后发现，在 iOS 并不支持 pinning。我首先怀疑是自己没有设置哪个选项导致了失败。按照官方给出的[代码样例](http://curl.haxx.se/libcurl/c/CURLOPT_PINNEDPUBLICKEY.html)以及证书生成步骤进一步测试，仍然无法 pin 住任何证书。不知道问题出在什么地方。

束手无策之际，我把问题的原因转移到了 libcurl 身上。查看源码后发现 darwinssl.c 这个文件根本没有处理 SSL pinning。换句话说，在 iOS、OS X 上面，如果使用 libcurl 作为网络库，就没办法进行 SSL pinning。不过在其他 SSL backends 里面是支持的，比如 OpenSSL 和 GnuTLS 的。不知道为什么 libcurl 官方不在 Darwin 中实现，或许是许多操作证书相关的算法在 darwin 下没有现成的吧。

明确了问题所在就好办了。既然没有实现，那就打个补丁吧。思路还是挺简单的，因为有其他 backends 的实现作为参照，只是转换证书的方法需要查一下文档。不过，这个补丁只支持 public key pinning，不支持 [hashing](https://www.owasp.org/index.php/Certificate_and_Public_Key_Pinning#Hashing)，没有时间做进一步支持，已经满足需求了。

如果大家有兴趣，可以一起将功能补充完整。补丁的地址是 [leancloud-curl](https://github.com/leancloud/curl)。

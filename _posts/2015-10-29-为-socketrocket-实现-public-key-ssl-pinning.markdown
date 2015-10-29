---
layout: post
title: "为 SocketRocket 实现 Public Key SSL Pinning"
published: true
---

LeanCloud SDK 中使用 [SocketRocket](https://github.com/square/SocketRocket) 来实现长连接。非常感谢这个库，它是一个 iOS 和 OS X 平台上的 WebSocket 实现。它实现了对证书的 pinning。

不过 pin 证书是比较粗暴的做法，因为服务器的证书随时会过期，一旦过期，客户端就不可用了。更好的做法是 pin 证书的公钥（public key），这个公钥是 Certificate Signing Request (CSR) 中的公钥，CA 最终颁发的证书会包含这个公钥。而这个公钥是可以保证长期不变的。当服务器端证书过期时，只需要用之前的 CSR 去 request 或者 renew 就行了。

实现 public key pinning 很简单，[AFNetworking](https://github.com/AFNetworking/AFNetworking) 已经实现了，只需要把这部分逻辑挪过去即可。完成后，我向 SocketRocket 提交了一个 [pull request](https://github.com/square/SocketRocket/pull/304)。

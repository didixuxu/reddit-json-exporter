# 介绍与分享文案

以下文案适用于 GitHub 源码分享，不意味着插件已经在 Chrome 网上应用店上架。

## 一句话介绍

迪迪碎碎念做的 Reddit 导出插件：支持七种采集方式，把讨论保存成 CSV / JSON，保留来源，方便交给 Codex 做用户原声分析。

## 小红书

标题：出海必备！Reddit + Codex，挖出用户真实需求

正文：

用户在纠结什么，去 Reddit 看看他们怎么说。

我做了一个小插件，可以选最新、热门、高分排行，也能按关键词搜索，再把返回的讨论导出成 CSV / JSON。

把文件交给 Codex，就能继续整理使用场景、痛点、购买顾虑和用户已经尝试的办法。分析时记得要求保留原话和来源，区分证据与推测。

插件源码、安装步骤和分析提示词已经放在 GitHub：
https://github.com/didixuxu/reddit-json-exporter

当前通过开发者模式安装。社区导出主要是帖子，完整评论需要进一步采集；样本计数不代表整个市场的需求比例。

#出海 #Reddit #Codex #用户需求 #VOC #AI工具

## B站

标题：Reddit + Codex 用户需求调研：从讨论导出到 VOC 看板

简介：

演示如何从 Reddit 社区选择讨论，通过插件导出 CSV/JSON，再交给 Codex 做可回溯原话的 VOC 分析。

源码、插件包和提示词：
https://github.com/didixuxu/reddit-json-exporter

下载 Releases 中的插件 ZIP，解压后在 Chrome 扩展管理页加载。插件只负责导出，不自动调用 AI、不补全全部评论，也不保证每个账号都能访问 Reddit JSON。

## 社群 / 朋友圈

我把这次用到的 Reddit 导出插件放到 GitHub 了。

打开社区，选时间、排序或关键词，导出 CSV/JSON；再交给 Codex 分析痛点、需求和使用场景。每条结论记得保留用户原话和来源链接。

下载与安装： https://github.com/didixuxu/reddit-json-exporter

当前用 Chrome 开发者模式安装，访问情况取决于 Reddit 的规则和你的浏览器会话。遇到问题可以到仓库提 Issue。

## 回答“怎么下载”

进入 GitHub 仓库 → Releases → 下载 `reddit-json-exporter-v0.2.2.zip` → 解压 → Chrome 打开 `chrome://extensions` → 开启开发者模式 → 加载已解压的扩展程序 → 选择包含 manifest.json 的文件夹。

## 回答“这是自动分析工具吗”

插件负责导出 Reddit 实际返回的数据。分析需要你自行把文件交给 Codex 或其他 AI；提示词已放在仓库里。

## 回答“是开源的吗”

源码已公开，可以查看实现和反馈问题。目前仓库没有指定开源许可证，不等于已经授予商业使用或再分发许可；品牌名称与人物素材也没有开放品牌授权。

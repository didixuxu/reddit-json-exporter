# Reddit 一键导出 · 迪迪碎碎念

把 Reddit 讨论导出为 CSV / JSON，保留原帖链接，方便用户原声（VOC）研究与后续 AI 分析。

**获取版本：** [下载插件 v0.2.2](https://github.com/didixuxu/reddit-json-exporter/releases/download/v0.2.2/reddit-json-exporter-v0.2.2.zip) · [所有版本](https://github.com/didixuxu/reddit-json-exporter/releases) · [隐私政策](https://didixuxu.github.io/reddit-json-exporter/privacy.html) · [反馈问题](https://github.com/didixuxu/reddit-json-exporter/issues)

![七种采集方式与导出界面](docs/images/export.jpg)

## 它能做什么

| 模式 | 用途 |
| --- | --- |
| 当前页 | 保留支持页面的原有排序、搜索与翻页参数 |
| 最新 | 按发布时间看当前社区的新讨论 |
| 热门 | 查看当前社区热门帖子 |
| 上升 | 查看当前社区正在上升的讨论 |
| 高分排行 | 按得分与时间范围筛选 |
| 争议讨论 | 查看 Reddit 争议排序的讨论 |
| 关键词搜索 | 在当前社区搜索；全站搜索页可搜索全站 |

- 数量上限：25、50、100。返回数量可能小于上限。
- 高分排行、争议讨论、搜索支持近一小时、一天、一周、一月、一年、全部时间。
- 搜索支持相关度、最新、得分、评论数量、热度排序。
- CSV 保留精简字段；JSON 保留 Reddit 实际返回的响应。
- 可以检查生成的网址，或在新标签页查看 JSON。

插件只负责导出。它不会自动调用 Codex 或其他 AI，也不会自动生成 VOC 看板。

## 安装到 Chrome

这是从源码安装的版本，不代表已通过 Chrome 网上应用店审核。

1. 从 [Releases 下载插件 ZIP](https://github.com/didixuxu/reddit-json-exporter/releases/latest)，将 ZIP 解压到一个固定文件夹。
2. 在 Chrome 地址栏打开 `chrome://extensions`。
3. 开启“开发者模式”，点击“加载已解压的扩展程序”。
4. 选择解压后**包含 manifest.json 的文件夹**。
5. 将“Reddit 一键导出 · 迪迪碎碎念”固定到工具栏。

安装后不要移动或删除该文件夹。更新时解压新版本，在扩展管理页重新加载；需要时重新选择源码目录。

如果下载的是 GitHub 的 **Source code ZIP**，请加载其中的 `extension/` 文件夹，而不是仓库根目录。

## 从 Reddit 到 VOC 分析

1. 打开 HTTPS Reddit 社区、排序、搜索或帖子详情页。
2. 点击扩展，选择模式和筛选条件。
3. 下载 CSV；需要保留完整响应或评论层级时下载 JSON。
4. 把文件上传给你选择的、支持附件分析的 AI。
5. 请 AI 保留原话与来源链接，区分用户明确表达与分析推测，再整理成报告或看板。

可直接复制的提示词见 [VOC 分析提示词](docs/voc-prompt.md)。

![社区关键词搜索](docs/images/search.jpg)

## 导出字段

CSV 列：`type`、`id`、`post_id`、`subreddit`、`title`、`text`、`created_utc`、`score`、`num_comments`、`source_url`。

- `num_comments` 是 Reddit 帖子元数据中的评论数量，**不代表已经导出了这么多条评论**。
- 社区或搜索页主要返回帖子列表，不含每帖的完整评论。
- 帖子详情仅导出本次响应内的帖子和已返回评论，不会自动展开 `more` 或补全整条讨论。
- CSV 平铺评论，不保留完整回复树；JSON 则保留本次原始响应的结构。
- 为避免电子表格将用户文字当作公式，CSV 会对以 `= + @ -` 等字符开头的文本加前置单引号。若需要未经这种处理的原始内容，请使用 JSON。

## 数据访问与隐私

打开弹窗时识别当前 URL，点击下载才请求 Reddit。数据在本机处理，不上传给开发者服务器；没有广告、遥测或后台扫描。用户自行上传给 AI 的文件适用其选择的服务的隐私政策。

需要 `activeTab` 和三个受支持 Reddit 域名的网站权限。详见 [隐私政策](https://didixuxu.github.io/reddit-json-exporter/privacy.html)。

**访问条件：** 本版依赖 Reddit 网页 JSON 与当前浏览器会话，没有接入 Reddit OAuth。Reddit 的访问规则、授权要求或网络限制可能导致 403、429、登录页、空结果或超时。失败时停止并显示原因，不绕过验证。源码公开不意味着已获得 Reddit 官方访问批准。

[Reddit Data API 官方说明](https://support.reddithelp.com/hc/en-us/articles/16160319875092-Reddit-Data-API-Wiki)指出 API 客户端的 OAuth 与访问要求。当前网页请求方式不能作为普遍可用的保证；分发和使用时需自行确认平台要求。项目不与 Reddit、Google 或 OpenAI 官方关联。

已有实测范围：2026-10-03，在当前用户 Chrome/Reddit 会话中，社区 JSON/CSV 导出 100 帖；近一月高分 CSV 导出 100 帖；关键词 sofa 的 JSON 导出 66 帖。这不代表所有账号或页面都可访问，也不代表已读评论。

## 开发与打包

运行代码不需要构建工具、依赖安装或 API Key。将 `extension/` 直接加载到 Chrome 即可。

```sh
# 自动检查 URL 转换、提取与 CSV 处理；需要 Node.js 18 或更新版本
node --test tests/core.test.mjs

# 构建可加载 / 商店上传 ZIP；需要 Python 3
python3 scripts/package.py
```

输出在 `dist/`。ZIP 根目录包含 manifest.json。打包过程不联网，不包含研究样本或个人导出文件。

```text
extension/      Chrome MV3 插件源码、图标、品牌头像、内置隐私说明
docs/           公开项目页、隐私政策、VOC 提示词与介绍文案
tests/          使用合成数据的核心功能测试
scripts/        可复现的 ZIP 打包脚本
```

## 分享与反馈

[介绍与分享文案](docs/sharing-copy.md)包含短介绍、小红书/B站说明和安装提醒。遇到问题请提交 [Issue](https://github.com/didixuxu/reddit-json-exporter/issues)，说明页面类型、模式、Chrome 版本与错误提示；不要上传账号密码、cookie 或含个人信息的完整导出文件。

代码可公开查看；本项目暂未指定开源许可证，不能据此推断任意再分发或商业授权。迪迪碎碎念的头像、名称和品牌素材不提供代言或品牌使用授权。

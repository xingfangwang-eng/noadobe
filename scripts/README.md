# Google Indexing API 提交脚本

自动将 sitemap 中的所有 URL 提交给 Google 索引，强制 Google 立即爬取新页面。

## 前置条件

### 1. 创建 Google Cloud 项目并启用 Indexing API

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 **Indexing API**: https://console.cloud.google.com/apis/library/indexing.googleapis.com
4. 创建服务账号：
   - 导航到 "IAM 和管理" > "服务账号"
   - 点击 "创建服务账号"
   - 填写名称（如：`noadobe-indexing`）
   - 角色选择：**Owner** 或 **Indexing API User**
   - 创建密钥（JSON 格式）
   - 下载密钥文件

### 2. 配置 Google Search Console

1. 访问 [Google Search Console](https://search.google.com/search-console)
2. 添加并验证您的网站（`https://noadobe.vercel.app`）
3. 进入 "设置" > "用户和权限"
4. 添加服务账号邮箱（在 JSON 密钥文件中的 `client_email` 字段）
5. 权限设置为 "所有者"

### 3. 放置密钥文件

将下载的 JSON 密钥文件重命名为 `google-service-account.json`，放入 `scripts/` 目录。

## 使用方法

```bash
# 运行提交脚本
node scripts/submit-to-google-indexing.js

# 或者使用自定义站点 URL
SITE_URL=https://your-domain.com node scripts/submit-to-google-indexing.js
```

## 输出示例

```
============================================================
🚀 Google Indexing API 批量提交工具
============================================================
站点: https://noadobe.vercel.app
密钥: scripts/google-service-account.json
============================================================

📄 从 sitemap 提取到 101 个 URL

🔐 初始化 Google 认证...
✅ 认证初始化成功

🚀 开始提交 101 个 URL 到 Google Indexing API...

[1/101] 提交中: https://noadobe.vercel.app ... ✅ 成功
[2/101] 提交中: https://noadobe.vercel.app/cancel-adobe-no-fee-2026-guide ... ✅ 成功
[3/101] 提交中: https://noadobe.vercel.app/adobe-price-increase-alternatives ... ✅ 成功
...

============================================================
📊 提交报告
============================================================
总 URL 数: 101
✅ 成功: 101 (100.0%)
❌ 失败: 0
============================================================

💡 提示:
   - Google 通常需要几分钟到几小时来处理索引请求
   - 可以在 Search Console 中查看索引状态
   - 每个 URL 每天最多提交一次更新请求
```

## 注意事项

1. **配额限制**: Google Indexing API 每天最多提交 200 个 URL
2. **频率限制**: 脚本内置 1 秒延迟，避免触发 API 限制
3. **重试机制**: 遇到 429 或服务器错误时会自动重试（最多 3 次）
4. **幂等性**: 同一 URL 可以多次提交，Google 会处理最新版本

## 常见问题

### Q: 提示 "Permission denied" 错误？
A: 确保服务账号邮箱已添加到 Search Console 的所有者权限中。

### Q: 提示 "API not enabled" 错误？
A: 确保在 Google Cloud Console 中启用了 Indexing API。

### Q: 可以只提交部分 URL 吗？
A: 可以修改脚本中的 `getAllUrlsFromSitemap()` 函数，添加过滤逻辑。

### Q: 提交后多久能在 Google 搜索中看到？
A: 通常几分钟到几小时，取决于 Google 的爬取队列。

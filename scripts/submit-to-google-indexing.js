/**
 * Google Indexing API 提交脚本
 * 自动遍历 sitemap 中的所有 URL 并提交给 Google 索引
 * 
 * 使用方法:
 * 1. 在 Google Cloud Console 创建服务账号并下载 JSON 密钥文件
 * 2. 将密钥文件保存为 scripts/google-service-account.json
 * 3. 在 Google Search Console 添加并验证网站
 * 4. 在 Search Console 的 "设置" -> "用户和权限" 中添加服务账号邮箱
 * 5. 运行: node scripts/submit-to-google-indexing.js
 */

const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

// 服务账号密钥文件路径
const KEY_FILE_PATH = path.join(__dirname, 'google-service-account.json');

// 站点 URL（必须与 Search Console 中验证的完全一致）
const SITE_URL = process.env.SITE_URL || 'https://noadobe.vercel.app';

// 批量提交间隔（毫秒）- 避免触发 API 限制
const BATCH_DELAY = 1000;

// 最大重试次数
const MAX_RETRIES = 3;

/**
 * 从 sitemap.ts 提取所有 URL
 * 注意：这里直接读取 keywords.json 并构建 URL，与 sitemap.ts 逻辑一致
 */
function getAllUrlsFromSitemap() {
  try {
    const keywordsData = require('../src/data/keywords.json');
    
    const urls = [
      SITE_URL, // 首页
      ...keywordsData.map(item => `${SITE_URL}/${item.slug}`)
    ];
    
    console.log(`📄 从 sitemap 提取到 ${urls.length} 个 URL`);
    return urls;
  } catch (error) {
    console.error('❌ 读取 sitemap 数据失败:', error.message);
    process.exit(1);
  }
}

/**
 * 初始化 Google Auth
 */
function initializeAuth() {
  if (!fs.existsSync(KEY_FILE_PATH)) {
    console.error(`
❌ 未找到服务账号密钥文件: ${KEY_FILE_PATH}

请按以下步骤操作：
1. 访问 https://console.cloud.google.com/
2. 创建新项目或选择现有项目
3. 启用 "Indexing API" (https://console.cloud.google.com/apis/library/indexing.googleapis.com)
4. 创建服务账号并下载 JSON 密钥文件
5. 将密钥文件重命名为 google-service-account.json 并放入 scripts/ 目录
6. 在 Google Search Console (https://search.google.com/search-console) 中添加服务账号邮箱为所有者

密钥文件格式示例:
{
  "type": "service_account",
  "project_id": "your-project",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "your-service@your-project.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
    `);
    process.exit(1);
  }

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: KEY_FILE_PATH,
      scopes: ['https://www.googleapis.com/auth/indexing'],
    });
    
    return auth;
  } catch (error) {
    console.error('❌ 初始化 Google Auth 失败:', error.message);
    process.exit(1);
  }
}

/**
 * 提交单个 URL 到 Google Indexing API
 * @param {string} url - 要提交的 URL
 * @param {object} auth - Google Auth 客户端
 * @param {number} retryCount - 当前重试次数
 */
async function submitUrl(url, auth, retryCount = 0) {
  try {
    const indexing = google.indexing({ version: 'v3', auth });
    
    const response = await indexing.urlNotifications.publish({
      requestBody: {
        url: url,
        type: 'URL_UPDATED', // 或者使用 'URL_DELETED' 删除索引
      },
    });
    
    return {
      success: true,
      url: url,
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    // 如果是 429 (Too Many Requests) 或其他可重试错误，进行重试
    if (retryCount < MAX_RETRIES && (error.code === 429 || error.code >= 500)) {
      console.log(`⏳ ${url} 遇到错误 (${error.code})，${retryCount + 1}/${MAX_RETRIES} 秒后重试...`);
      await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
      return submitUrl(url, auth, retryCount + 1);
    }
    
    return {
      success: false,
      url: url,
      error: error.message,
      code: error.code,
    };
  }
}

/**
 * 批量提交 URL
 */
async function submitUrlsBatch(urls, auth) {
  const results = {
    success: [],
    failed: [],
  };
  
  console.log(`\n🚀 开始提交 ${urls.length} 个 URL 到 Google Indexing API...\n`);
  
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const progress = `[${i + 1}/${urls.length}]`;
    
    process.stdout.write(`${progress} 提交中: ${url} ... `);
    
    const result = await submitUrl(url, auth);
    
    if (result.success) {
      console.log('✅ 成功');
      results.success.push(result);
    } else {
      console.log(`❌ 失败 (${result.code || '未知错误'}): ${result.error}`);
      results.failed.push(result);
    }
    
    // 添加延迟避免触发 API 限制
    if (i < urls.length - 1) {
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
    }
  }
  
  return results;
}

/**
 * 打印统计报告
 */
function printReport(results) {
  const total = results.success.length + results.failed.length;
  const successRate = ((results.success.length / total) * 100).toFixed(1);
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 提交报告');
  console.log('='.repeat(60));
  console.log(`总 URL 数: ${total}`);
  console.log(`✅ 成功: ${results.success.length} (${successRate}%)`);
  console.log(`❌ 失败: ${results.failed.length}`);
  console.log('='.repeat(60));
  
  if (results.failed.length > 0) {
    console.log('\n❌ 失败的 URL:');
    results.failed.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.url}`);
      console.log(`     错误: ${item.error}`);
    });
  }
  
  console.log('\n💡 提示:');
  console.log('   - Google 通常需要几分钟到几小时来处理索引请求');
  console.log('   - 可以在 Search Console 中查看索引状态');
  console.log('   - 每个 URL 每天最多提交一次更新请求');
}

/**
 * 主函数
 */
async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 Google Indexing API 批量提交工具');
  console.log('='.repeat(60));
  console.log(`站点: ${SITE_URL}`);
  console.log(`密钥: ${KEY_FILE_PATH}`);
  console.log('='.repeat(60) + '\n');
  
  // 1. 获取所有 URL
  const urls = getAllUrlsFromSitemap();
  
  if (urls.length === 0) {
    console.log('⚠️ 没有找到任何 URL，退出。');
    process.exit(0);
  }
  
  // 2. 初始化认证
  console.log('🔐 初始化 Google 认证...');
  const auth = initializeAuth();
  console.log('✅ 认证初始化成功\n');
  
  // 3. 批量提交 URL
  const results = await submitUrlsBatch(urls, auth);
  
  // 4. 打印报告
  printReport(results);
  
  // 5. 返回退出码
  process.exit(results.failed.length > 0 ? 1 : 0);
}

// 运行主函数
main().catch(error => {
  console.error('❌ 脚本执行失败:', error);
  process.exit(1);
});

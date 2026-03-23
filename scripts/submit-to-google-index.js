const { google } = require('googleapis');
const keywordsData = require('../src/data/keywords.json');

// 配置
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://noadobe.vercel.app';
const SERVICE_ACCOUNT_KEY_PATH = './service-account-key.json'; // 请替换为实际路径

// 生成所有 URL（模仿 sitemap.ts 的逻辑）
function generateUrls() {
  const keywordPages = keywordsData.map((item) => `${siteUrl}/${item.slug}`);
  return [siteUrl, ...keywordPages];
}

// 初始化 Google 认证
async function initializeAuth() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_KEY_PATH,
      scopes: ['https://www.googleapis.com/auth/indexing'],
    });
    return auth;
  } catch (error) {
    console.error('认证初始化失败:', error.message);
    process.exit(1);
  }
}

// 提交 URL 到 Google Indexing API
async function submitUrl(auth, url) {
  try {
    const indexing = google.indexing({ version: 'v3', auth });
    const response = await indexing.urlNotifications.publish({
      requestBody: {
        url: url,
        type: 'URL_UPDATED'
      }
    });
    return true;
  } catch (error) {
    console.error(`提交 URL 失败 ${url}:`, error.message);
    return false;
  }
}

// 主函数
async function main() {
  console.log('开始提交 URL 到 Google Indexing API...');
  
  // 生成所有 URL
  const urls = generateUrls();
  console.log(`发现 ${urls.length} 个 URL 需要提交`);
  
  // 初始化认证
  const auth = await initializeAuth();
  
  // 提交所有 URL
  let successCount = 0;
  for (const url of urls) {
    console.log(`提交中: ${url}`);
    const success = await submitUrl(auth, url);
    if (success) {
      successCount++;
    }
    // 避免 API 速率限制
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n提交完成！`);
  console.log(`成功提交: ${successCount} 个 URL`);
  console.log(`失败: ${urls.length - successCount} 个 URL`);
}

// 运行主函数
main().catch(console.error);
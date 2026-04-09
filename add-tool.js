const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const toolsDir = './tools';

// 颜色选项 (奶油色系)
const colorOptions = {
  '1': { name: '奶油蓝', value: 'from-[#c2d7ed] to-[#a8c5e3]', class: 'card-blue' },
  '2': { name: '奶油紫', value: 'from-[#c8c8e9] to-[#b5b5d9]', class: 'card-purple' },
  '3': { name: '奶油粉', value: 'from-[#ffc1c0] to-[#ffa5a4]', class: 'card-pink' },
  '4': { name: '奶油黄', value: 'from-[#ffe47c] to-[#ffdb5c]', class: 'card-yellow' },
  '5': { name: '奶油橙', value: 'from-[#ff8e7c] to-[#ff7a5c]', class: 'card-orange' }
};

// 图标选项
const iconOptions = ['🎮', '🧮', '🎯', '🎨', '🔧', '📚', '✏️', '🧩', '🎲', '🔢', '📝', '🎓'];

// 分类选项
const categoryOptions = {
  'game': { name: 'Game', desc: '游戏类' },
  'tool': { name: 'Tool', desc: '工具类' },
  'others': { name: 'Others', desc: '其他' }
};

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

async function main() {
  console.log('🛠️  Edu Toolbox - 添加新工具\n');

  // 获取下一个工具编号
  const existingTools = fs.readdirSync(toolsDir)
    .filter(f => fs.statSync(path.join(toolsDir, f)).isDirectory())
    .filter(f => f.startsWith('Tool'))
    .map(f => parseInt(f.replace('Tool', '')))
    .filter(n => !isNaN(n));
  
  const nextNum = existingTools.length > 0 ? Math.max(...existingTools) + 1 : 1;
  const defaultId = `Tool${nextNum}`;

  // 询问信息
  const id = await ask(`工具ID (默认: ${defaultId}): `) || defaultId;
  const title = await ask('中文标题: ');
  const desc = await ask('中文描述: ');
  const titleEn = await ask('英文标题: ');
  
  console.log('\n可选图标:', iconOptions.map((icon, i) => `${i}: ${icon}`).join('  '));
  const iconIndex = await ask('选择图标编号 (0-11, 默认0): ') || '0';
  const icon = iconOptions[parseInt(iconIndex)] || iconOptions[0];

  console.log('\n可选分类:');
  Object.entries(categoryOptions).forEach(([k, v]) => console.log(`  ${k}. ${v.name} (${v.desc})`));
  const categoryChoice = await ask('选择分类 (game/tool/others, 默认tool): ') || 'tool';
  const category = categoryOptions[categoryChoice]?.name ? categoryChoice : 'tool';

  console.log('\n可选颜色:');
  Object.entries(colorOptions).forEach(([k, v]) => console.log(`  ${k}. ${v.name}`));
  const colorChoice = await ask('选择颜色编号 (1-7, 默认1): ') || '1';
  const color = colorOptions[colorChoice]?.value || colorOptions['1'].value;

  const folderPath = path.join(toolsDir, id);
  
  // 检查是否已存在
  if (fs.existsSync(folderPath)) {
    console.log(`\n❌ 错误: ${id} 已存在！`);
    rl.close();
    return;
  }

  // 创建文件夹
  fs.mkdirSync(folderPath, { recursive: true });

  // 生成config.json
  const config = { id, icon, title, desc, titleEn, category, color };
  fs.writeFileSync(
    path.join(folderPath, 'config.json'),
    JSON.stringify(config, null, 2)
  );

  // 复制基础index.html模板
  const templateHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Edu Toolbox</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Quicksand:wght@500;600;700&family=ZCOOL+KuaiLe&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-color: #f3f0f1;
        }
        * {
            font-family: 'Nunito', 'Quicksand', 'ZCOOL KuaiLe', sans-serif;
        }
        body {
            background-color: var(--bg-color);
            font-family: 'Nunito', sans-serif;
        }
        h1, h3 { font-family: 'ZCOOL KuaiLe', cursive; }
        .icon-box {
            background: rgba(255,255,255,0.85);
            backdrop-filter: blur(4px);
        }
    </style>
</head>
<body class="min-h-screen">
    <!-- 返回按钮 -->
    <a href="../../index.html"
       style="position:fixed;top:15px;left:15px;background:white;padding:10px 20px;border-radius:12px;box-shadow:0 4px 15px rgba(0,0,0,0.1);text-decoration:none;color:#555;font-weight:600;z-index:9999;display:flex;align-items:center;gap:8px;">
       <span>←</span> 返回工具箱
    </a>

    <!-- 工具标题 -->
    <div class="text-center pt-20 pb-10 px-4">
        <h1 class="text-3xl font-bold text-gray-700 mb-2">${icon} ${title}</h1>
        <p class="text-gray-500 font-medium">${desc}</p>
    </div>

    <!-- 游戏区域 -->
    <div class="max-w-4xl mx-auto px-4 pb-16">
        <div class="bg-white rounded-2xl shadow-lg p-8 min-h-[400px] flex items-center justify-center">
            <div class="text-center">
                <p class="text-gray-400 mb-4">在这里添加你的游戏代码 ♡</p>
                <p class="text-sm text-gray-300">替换这个div里的内容为你的HTML游戏</p>
            </div>
        </div>
    </div>

    <!-- 底部说明 -->
    <footer class="text-center py-8 text-gray-400 text-sm">
        <p>${titleEn} | Edu Toolbox ♡</p>
    </footer>
</body>
</html>`;

  fs.writeFileSync(path.join(folderPath, 'index.html'), templateHTML);

  console.log(`\n✅ 成功创建 ${id}！`);
  console.log(`📁 文件夹: ${folderPath}`);
  console.log(`⚙️  配置文件: ${id}/config.json`);
  console.log(`🎮 游戏文件: ${id}/index.html`);
  
  // 询问是否立即更新主页
  const updateNow = await ask('\n是否立即更新主页？(y/n, 默认y): ') || 'y';
  
  if (updateNow.toLowerCase() === 'y') {
    console.log('\n🔄 正在生成主页...');
    require('./generate.js');
    console.log('\n🚀 完成！刷新浏览器查看新工具。');
  }

  rl.close();
}

main().catch(err => {
  console.error('❌ 错误:', err);
  rl.close();
});

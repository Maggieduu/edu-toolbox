const fs = require('fs');
const path = require('path');

const toolsDir = './tools';
const outputFile = './index.html';

// 扫描所有工具文件夹
function scanTools() {
  const tools = [];
  const folders = fs.readdirSync(toolsDir).filter(f => 
    fs.statSync(path.join(toolsDir, f)).isDirectory()
  );

  folders.forEach(folder => {
    const configPath = path.join(toolsDir, folder, 'config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      tools.push(config);
    }
  });

  return tools;
}

// 颜色到class的映射
const colorClassMap = {
  'card-blue': 'card-blue',
  'card-purple': 'card-purple',
  'card-pink': 'card-pink',
  'card-yellow': 'card-yellow',
  'card-orange': 'card-orange'
};

// 生成工具卡片HTML
function generateCards(tools) {
  return tools.map(tool => {
    // 兼容旧数据：如果color是gradient字符串，转换为class
    let cardClass = 'card-blue'; // 默认
    if (tool.color && colorClassMap[tool.color.class]) {
      cardClass = tool.color.class;
    } else if (tool.color && tool.color.startsWith('from-')) {
      // 旧格式 from-[#xxx] to-[#xxx] 尝试匹配
      const colorValue = tool.color;
      if (colorValue.includes('#c2d7ed')) cardClass = 'card-blue';
      else if (colorValue.includes('#c8c8e9')) cardClass = 'card-purple';
      else if (colorValue.includes('#ffc1c0')) cardClass = 'card-pink';
      else if (colorValue.includes('#ffe47c')) cardClass = 'card-yellow';
      else if (colorValue.includes('#ff8e7c')) cardClass = 'card-orange';
    }

    const category = tool.category || 'others';

    return `
            <!-- ${tool.title} -->
            <a href="tools/${tool.id}/index.html" class="tool-card ${cardClass} rounded-2xl p-6 shadow-lg block" data-category="${category}">
                <div class="icon-box w-full h-32 rounded-xl mb-4 flex items-center justify-center text-5xl">
                    ${tool.icon}
                </div>
                <h3 class="text-xl font-bold text-gray-700 mb-2">${tool.title}</h3>
                <p class="text-gray-600 mb-1 text-sm font-medium">${tool.desc}</p>
                <p class="text-xs text-gray-500">${tool.titleEn}</p>
            </a>`;
  }).join('');
}

// 生成完整HTML
function generateHTML(tools) {
  const cards = generateCards(tools);

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edu Toolbox - 教学工具箱</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Quicksand:wght@500;600;700&family=ZCOOL+KuaiLe&display=swap" rel="stylesheet">
    <style>
        :root {
            --cream-blue: #c2d7ed;
            --cream-purple: #c8c8e9;
            --cream-pink: #ffc1c0;
            --cream-yellow: #ffe47c;
            --cream-orange: #ff8e7c;
            --bg-color: #f3f0f1;
        }

        * {
            font-family: 'Nunito', 'Quicksand', 'ZCOOL KuaiLe', sans-serif;
        }

        body {
            background-color: var(--bg-color);
            font-family: 'Nunito', sans-serif;
        }

        .font-title {
            font-family: 'ZCOOL KuaiLe', cursive;
        }

        .font-body {
            font-family: 'Nunito', sans-serif;
        }

        .tool-card {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: 3px solid transparent;
        }
        .tool-card:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.15);
        }

        .card-blue { background: linear-gradient(135deg, var(--cream-blue), #a8c5e3); border-color: #a8c5e3; }
        .card-purple { background: linear-gradient(135deg, var(--cream-purple), #b5b5d9); border-color: #b5b5d9; }
        .card-pink { background: linear-gradient(135deg, var(--cream-pink), #ffa5a4); border-color: #ffa5a4; }
        .card-yellow { background: linear-gradient(135deg, var(--cream-yellow), #ffdb5c); border-color: #ffdb5c; }
        .card-orange { background: linear-gradient(135deg, var(--cream-orange), #ff7a5c); border-color: #ff7a5c; }

        .icon-box {
            background: rgba(255,255,255,0.85);
            backdrop-filter: blur(4px);
        }

        h3 { font-family: 'ZCOOL KuaiLe', cursive; letter-spacing: 0.5px; }

        /* 邀请码验证样式 */
        .invite-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 99999;
        }
        .invite-overlay.hidden {
            display: none;
        }
        .invite-box {
            background: white;
            padding: 40px;
            border-radius: 24px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 400px;
            width: 90%;
        }
        .invite-input {
            width: 100%;
            padding: 14px 20px;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            font-size: 18px;
            text-align: center;
            margin: 20px 0;
            outline: none;
            transition: all 0.3s;
        }
        .invite-input:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102,126,234,0.2);
        }
        .invite-btn {
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }
        .invite-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102,126,234,0.4);
        }
        .invite-error {
            color: #ef4444;
            font-size: 14px;
            margin-top: 10px;
            display: none;
        }

        /* Tab 样式 */
        .tab-btn {
            padding: 10px 24px;
            border-radius: 25px;
            font-weight: 600;
            transition: all 0.3s ease;
            cursor: pointer;
            border: 2px solid transparent;
            background: transparent;
            color: #6b7280;
        }
        .tab-btn:hover {
            background: rgba(255,255,255,0.5);
        }
        .tab-btn.active {
            background: white;
            color: #667eea;
            border-color: #667eea;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }
        .tool-card.hidden {
            display: none;
        }
    </style>
</head>
<body class="min-h-screen">
    <!-- 邀请码验证 -->
    <div class="invite-overlay" id="inviteOverlay">
        <div class="invite-box">
            <h2 class="font-title text-2xl text-gray-700 mb-2">Edu Toolbox</h2>
            <p class="text-gray-500 mb-4">请输入邀请码进入</p>
            <input type="password" class="invite-input" id="inviteCode" placeholder="请输入邀请码" onkeypress="if(event.key==='Enter')checkInviteCode()">
            <button class="invite-btn" onclick="checkInviteCode()">进入</button>
            <p class="invite-error" id="inviteError">邀请码错误，请重试</p>
        </div>
    </div>

    <header class="text-center py-8 px-4">
        <h1 class="font-title text-4xl md:text-5xl text-gray-700 mb-4 tracking-wide">Edu Toolbox<span class="block text-2xl text-gray-500 mt-2">Interactive Teaching Tools</span></h1>
        <p class="text-lg text-gray-500 max-w-2xl mx-auto font-medium tracking-wide">让课堂更有趣，让老师更轻松<br><span class="text-sm text-gray-400">Make teaching fun and easy</span></p>
    </header>

    <!-- Tab 导航 -->
    <nav class="max-w-6xl mx-auto px-4 mb-8">
        <div class="flex justify-center gap-2 flex-wrap">
            <button class="tab-btn active" onclick="filterTools('all')">全部</button>
            <button class="tab-btn" onclick="filterTools('game')">Game</button>
            <button class="tab-btn" onclick="filterTools('tool')">Tool</button>
            <button class="tab-btn" onclick="filterTools('others')">Others</button>
        </div>
    </nav>

    <main class="max-w-6xl mx-auto px-4 pb-16">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="toolsGrid">
${cards}
            <!-- Add Tool Button -->
            <div class="border-3 border-dashed border-pink-300 rounded-2xl p-6 flex items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition all" onclick="alert('添加新工具：1.复制tools/Tool1文件夹 2.修改config.json 3.运行node generate.js')">
                <div class="text-center text-pink-400"><p class="mt-2 font-medium">添加新工具</p></div>
            </div>
        </div>
    </main>

    <footer class="text-center py-8 text-gray-400"><p>© 2026 Edu Toolbox ♡ Designed for Teachers.</p></footer>

    <script src="config.js"></script>
    <script>
        function checkInviteCode() {
            const code = document.getElementById('inviteCode').value;
            if (code === INVITE_CODE) {
                sessionStorage.setItem('inviteVerified', 'true');
                document.getElementById('inviteOverlay').classList.add('hidden');
            } else {
                document.getElementById('inviteError').style.display = 'block';
                document.getElementById('inviteCode').value = '';
            }
        }

        // 页面加载时检查是否已验证
        if (sessionStorage.getItem('inviteVerified') === 'true') {
            document.getElementById('inviteOverlay').classList.add('hidden');
        }

        function filterTools(category) {
            // 更新 tab 状态
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.textContent.toLowerCase() === category || (category === 'all' && btn.textContent === '全部')) {
                    btn.classList.add('active');
                }
            });

            // 过滤工具卡片
            const cards = document.querySelectorAll('.tool-card');
            cards.forEach(card => {
                if (category === 'all' || card.dataset.category === category) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        }
    </script>
</body>
</html>`;
}

// 主函数
function main() {
  try {
    const tools = scanTools();
    const html = generateHTML(tools);
    fs.writeFileSync(outputFile, html);
    console.log(`✅ 成功生成主页！共 ${tools.length} 个工具`);
    tools.forEach(t => console.log(`   - ${t.title}`));
  } catch (err) {
    console.error('❌ 错误:', err.message);
  }
}

main();

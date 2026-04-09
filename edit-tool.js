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
  console.log('✏️  Edu Toolbox - 编辑工具\n');

  // 获取现有工具列表
  const existingTools = fs.readdirSync(toolsDir)
    .filter(f => fs.statSync(path.join(toolsDir, f)).isDirectory())
    .filter(f => f.startsWith('Tool'))
    .map(f => {
      const configPath = path.join(toolsDir, f, 'config.json');
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        return { id: f, ...config };
      }
      return { id: f, title: '(无标题)', icon: '📁' };
    })
    .sort((a, b) => {
      const numA = parseInt(a.id.replace('Tool', ''));
      const numB = parseInt(b.id.replace('Tool', ''));
      return numA - numB;
    });

  if (existingTools.length === 0) {
    console.log('❌ 没有找到现有工具！');
    rl.close();
    return;
  }

  console.log('现有工具:');
  existingTools.forEach((tool, i) => {
    console.log(`  ${i + 1}. ${tool.icon} ${tool.id} - ${tool.title}`);
  });
  console.log();

  const choice = await ask(`选择要编辑的工具编号 (1-${existingTools.length}): `);
  const choiceNum = parseInt(choice);

  if (isNaN(choiceNum) || choiceNum < 1 || choiceNum > existingTools.length) {
    console.log('❌ 无效的选择！');
    rl.close();
    return;
  }

  const selectedTool = existingTools[choiceNum - 1];
  const folderPath = path.join(toolsDir, selectedTool.id);
  const configPath = path.join(folderPath, 'config.json');
  const indexPath = path.join(folderPath, 'index.html');

  console.log(`\n✏️  编辑: ${selectedTool.id} - ${selectedTool.title}`);
  console.log('(直接回车保留原值)\n');

  // 读取现有配置
  const currentConfig = fs.existsSync(configPath)
    ? JSON.parse(fs.readFileSync(configPath, 'utf8'))
    : {};

  // 询问新值
  const newTitle = await ask(`中文标题 [${currentConfig.title || ''}]: `) || currentConfig.title;
  const newDesc = await ask(`中文描述 [${currentConfig.desc || ''}]: `) || currentConfig.desc;
  const newTitleEn = await ask(`英文标题 [${currentConfig.titleEn || ''}]: `) || currentConfig.titleEn;

  console.log('\n可选图标:', iconOptions.map((icon, i) => `${i}: ${icon}`).join('  '));
  const currentIconIndex = iconOptions.indexOf(currentConfig.icon || '');
  const iconIndex = await ask(`选择图标编号 (0-11, 默认${currentIconIndex}): `) || currentIconIndex.toString();
  const newIcon = iconOptions[parseInt(iconIndex)] || currentConfig.icon || iconOptions[0];

  console.log('\n可选分类:');
  Object.entries(categoryOptions).forEach(([k, v]) => console.log(`  ${k}. ${v.name} (${v.desc})`));
  const currentCategory = currentConfig.category || 'tool';
  const categoryChoice = await ask(`选择分类 (game/tool/others, 默认${currentCategory}): `) || currentCategory;
  const newCategory = categoryOptions[categoryChoice]?.name ? categoryChoice : (currentConfig.category || 'tool');

  console.log('\n可选颜色:');
  Object.entries(colorOptions).forEach(([k, v]) => console.log(`  ${k}. ${v.name}`));

  // 找出当前颜色的编号
  let currentColorNum = '1';
  for (const [k, v] of Object.entries(colorOptions)) {
    if (v.value === currentConfig.color) {
      currentColorNum = k;
      break;
    }
  }
  const colorChoice = await ask(`选择颜色编号 (1-5, 默认${currentColorNum}): `) || currentColorNum;
  const newColor = colorOptions[colorChoice]?.value || currentConfig.color;

  // 更新config.json
  const newConfig = {
    id: selectedTool.id,
    icon: newIcon,
    title: newTitle,
    desc: newDesc,
    titleEn: newTitleEn,
    category: newCategory,
    color: newColor
  };

  fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
  console.log(`\n✅ 已更新配置文件: ${configPath}`);

  // 询问是否更新主页
  const updateNow = await ask('\n是否立即更新主页？(y/n, 默认y): ') || 'y';

  if (updateNow.toLowerCase() === 'y') {
    console.log('\n🔄 正在生成主页...');
    require('./generate.js');
    console.log('\n🚀 完成！刷新浏览器查看更改。');
  }

  rl.close();
}

main().catch(err => {
  console.error('❌ 错误:', err);
  rl.close();
});

# 美术素材Prompt汇总

## 概述

本目录包含了游戏所有美术素材的AI生成prompt，分为三大类：

1. **背景场景**（1个）：荷兰酒馆
2. **NPC立绘**（5个）：5个不同性格的角色
3. **郁金香品种**（4个）：4种不同的郁金香

## Prompt风格

### 背景场景
- 伦勃朗《夜巡》风格
- 暖色调，烛光氛围
- 17世纪荷兰酒馆
- 油画质感 + 现代插画清晰度

### NPC立绘
- 油画厚涂 + 美国漫画综合风格
- 美艳化处理
- 17世纪荷兰服饰
- 强烈的表情和情绪

### 郁金香品种
- 植物学插画风格
- 油画质感
- 历史准确性
- 丰富的色彩

## 素材清单

### 背景场景

| 文件 | 名称 | 描述 | 情绪/风格 |
|---|---|---|---|
| tavern-prompt.txt | Dutch Tavern Background | 温暖的17世纪荷兰酒馆内部 | 暖色调，烛光氛围 |

### NPC立绘

| 文件 | 名字 | 身份 | 性格 | 情绪 |
|---|---|---|---|---|
| jan-prompt.txt | Jan | 酒馆老板 | 冷静、理性、见多识广 | 平静 |
| willem-prompt.txt | Willem | 激进投机者 | 狂热、贪婪、冲动 | 兴奋 |
| maria-prompt.txt | Maria | 谨慎商人 | 谨慎、保守、精明 | 谨慎 |
| pieter-prompt.txt | Pieter | 退休花商 | 怀旧、感慨、有经验 | 平静 |
| lucas-prompt.txt | Lucas | 旅人 | 好奇、多问、旁观者 | 平静 |

### 郁金香品种

| 文件 | 名称 | 描述 | 颜色 |
|---|---|---|---|
| semper_augustus-prompt.txt | Semper Augustus | 最昂贵的郁金香品种 | 深红色配白色条纹 |
| gouda-prompt.txt | Gouda | 美丽的黄色郁金香 | 温暖的金黄色 |
| viceroy-prompt.txt | Viceroy | 优雅的紫色郁金香 | 深紫色 |
| black_tulip-prompt.txt | Black Tulip | 稀有的黑色郁金香 | 深黑色配微紫色调 |

## 如何使用

### 1. 审批prompt

查看各个prompt文件，确保描述符合你的期望：
```bash
ls -la *.txt
cat tavern-prompt.txt
cat jan-prompt.txt
# ... 等等
```

### 2. 执行图片生成

审批通过后，运行以下命令生成图片：

```bash
cd ../../03-src/scripts
node generate-art-assets.mjs --types backgrounds,npcs,tulips --execute
```

或者只生成特定类型的素材：
```bash
# 只生成背景
node generate-art-assets.mjs --types backgrounds --execute

# 只生成NPC
node generate-art-assets.mjs --types npcs --execute

# 只生成郁金香
node generate-art-assets.mjs --types tulips --execute
```

### 3. 环境变量

确保已设置302AI的API Key：
```bash
export AI302_API_KEY=your-api-key-here
```

或在运行时直接提供：
```bash
AI302_API_KEY=your-api-key-here node generate-art-assets.mjs --execute
```

## 技术细节

- **API端点**: `https://api.302.ai/v1/images/generations`
- **模型**: `gpt-image-2`
- **分辨率**: 2k (1024x1024)
- **格式**: PNG
- **宽高比**:
  - 背景：16:9
  - NPC：2:3
  - 郁金香：1:1

## 注意事项

1. 图片生成可能需要一些时间，请耐心等待
2. 生成的图片会保存在 `00-data/art-prompts/` 目录
3. 如果不满意某些生成的图片，可以手动调整prompt文件，然后重新生成
4. 建议先生成少量图片进行测试，满意后再批量生成

## 下一步

图片生成完成后：
1. 将图片移动到 `frontend/public/images/` 目录
2. 更新代码中的图片路径引用
3. 继续执行M4：主界面集成

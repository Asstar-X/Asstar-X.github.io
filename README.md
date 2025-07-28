# Asstar - 探索未知的边界

一个具有外星科技感的现代化官方网站，采用深色主题和未来感设计。

## 🌟 特性

- **外星科技感设计**: 深色主题配合星空背景和发光效果
- **响应式布局**: 完美适配桌面端和移动端
- **流畅动画**: 包含视差滚动、粒子效果、浮动球体等动画
- **现代交互**: 平滑滚动、悬停效果、按钮涟漪动画
- **优雅排版**: 使用Orbitron和Exo 2字体，营造科技感

## 🚀 技术栈

- HTML5
- CSS3 (动画、渐变、滤镜)
- JavaScript (ES6+)
- Google Fonts (Orbitron, Exo 2)

## 📁 文件结构

```
Asstar.github.io/
├── index.html          # 主页面
├── styles.css          # 样式文件
├── script.js           # JavaScript交互
└── README.md           # 项目说明
```

## 🎨 设计特色

### 视觉效果
- 三层星空背景动画
- 渐变色彩搭配 (#00d4ff, #ff6b6b, #a8e6cf)
- 发光和模糊效果
- 浮动球体动画

### 交互体验
- 平滑滚动导航
- 鼠标跟随粒子效果
- 按钮点击涟漪动画
- 元素进入视口动画

### 响应式设计
- 移动端优化
- 弹性布局
- 自适应字体大小

## 🌐 部署到GitHub Pages

1. **推送代码到GitHub**
   ```bash
   git add .
   git commit -m "Initial commit: Asstar website"
   git push origin main
   ```

2. **启用GitHub Pages**
   - 进入GitHub仓库设置
   - 找到"Pages"选项
   - 选择"Deploy from a branch"
   - 选择main分支
   - 保存设置

3. **访问网站**
   - 网站将在几分钟内部署完成
   - 访问地址: `https://你的用户名.github.io/Asstar.github.io`

## 🎯 自定义

### 修改颜色主题
在 `styles.css` 中修改以下CSS变量：
```css
--primary-color: #00d4ff;
--secondary-color: #ff6b6b;
--accent-color: #a8e6cf;
```

### 添加新内容
在 `index.html` 中添加新的section：
```html
<section id="new-section" class="new-section">
    <div class="container">
        <h2 class="section-title">新标题</h2>
        <!-- 内容 -->
    </div>
</section>
```

### 修改动画效果
在 `script.js` 中调整动画参数：
```javascript
// 修改粒子数量
for (let i = 0; i < 50; i++) { // 改为你想要的数字
    createParticle(particleContainer);
}
```

## 📱 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

## 📄 许可证

MIT License - 详见LICENSE文件

---

**Asstar** - 探索未知的边界 ✨ 
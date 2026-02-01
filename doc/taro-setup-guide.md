# Taro 开发环境配置指南 (macOS)

## 📋 目录

1. [环境要求](#环境要求)
2. [安装 Node.js](#安装-nodejs)
3. [安装 Taro CLI](#安装-taro-cli)
4. [微信开发者工具](#微信开发者工具)
5. [项目配置](#项目配置)
6. [常见问题](#常见问题)

---

## 环境要求

### 系统要求
- macOS 10.15 或更高版本
- 至少 8GB 内存
- 至少 10GB 可用磁盘空间

### 必需软件
- Node.js >= 18.0.0
- npm >= 8.0.0 或 pnpm >= 8.0.0
- 微信开发者工具（用于小程序开发）

---

## 安装 Node.js

### 方法一：使用 Homebrew（推荐）

1. **安装 Homebrew**（如果尚未安装）
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

2. **安装 Node.js**
```bash
brew install node@18
```

3. **验证安装**
```bash
node -v  # 应显示 v18.x.x 或更高
npm -v   # 应显示 8.x.x 或更高
```

### 方法二：使用 nvm（Node 版本管理器）

1. **安装 nvm**
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

2. **重启终端，然后安装 Node.js**
```bash
nvm install 18
nvm use 18
nvm alias default 18
```

3. **验证安装**
```bash
node -v
npm -v
```

---

## 安装 Taro CLI

### 1. 全局安装 Taro CLI

```bash
# 使用 npm
npm install -g @tarojs/cli

# 或使用 pnpm（推荐，更快）
npm install -g pnpm
pnpm install -g @tarojs/cli
```

### 2. 验证安装

```bash
taro -v
# 应显示 Taro CLI 版本号，如：👽 Taro v3.6.0
```

---

## 微信开发者工具

### 1. 下载安装

访问微信开发者工具官网下载：
https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html

选择 **macOS 版本** 下载并安装。

### 2. 配置开发者工具

1. **打开微信开发者工具**
2. **扫码登录**（使用微信扫描二维码）
3. **设置 → 安全设置**
   - ✅ 勾选 **服务端口**
   - 记住端口号（默认 27065）

### 3. 获取项目 AppID（可选）

如果需要真机预览或发布：
1. 访问 https://mp.weixin.qq.com/
2. 注册小程序账号
3. 获取 AppID

---

## 项目配置

### 1. 克隆项目

```bash
cd ~/Projects
git clone https://gitee.com/zcy2233/hotel.git
cd hotel/src/mobile
```

### 2. 安装项目依赖

```bash
# 使用 npm
npm install

# 或使用 pnpm（推荐）
pnpm install
```

### 3. 配置微信小程序 AppID（可选）

编辑 `project.config.json`：

```json
{
  "miniprogramRoot": "dist/",
  "projectname": "hotel-mobile",
  "description": "易宿酒店预订平台",
  "appid": "你的AppID",  // 如果没有，填 "touristappid"
  "setting": {
    "urlCheck": false,
    "es6": false,
    "postcss": false,
    "minified": false
  }
}
```

### 4. 启动开发服务

#### 微信小程序开发

```bash
# 编译并监听文件变化
npm run dev:weapp

# 或
pnpm dev:weapp
```

#### H5 开发

```bash
# 启动 H5 开发服务器
npm run dev:h5

# 访问 http://localhost:10086
```

### 5. 在微信开发者工具中打开项目

1. 打开微信开发者工具
2. 点击 **导入项目**
3. 选择项目目录：`hotel/src/mobile/dist`
4. 点击 **导入**

---

## 开发流程

### 1. 启动后端服务

```bash
# 终端 1：启动后端
cd hotel/src/server
npm install  # 首次运行
npm run dev
```

### 2. 启动管理后台（可选）

```bash
# 终端 2：启动管理后台
cd hotel/src/admin
npm install  # 首次运行
npm run dev
```

### 3. 启动移动端开发

```bash
# 终端 3：启动 Taro 编译
cd hotel/src/mobile
npm install  # 首次运行
npm run dev:weapp  # 微信小程序
# 或
npm run dev:h5     # H5
```

### 4. 实时预览

- **微信小程序**：在微信开发者工具中查看
- **H5**：浏览器访问 http://localhost:10086

---

## 常见问题

### Q1: 提示 "command not found: taro"

**解决方案**：
```bash
# 重新安装 Taro CLI
npm install -g @tarojs/cli

# 或检查 PATH 环境变量
echo $PATH
```

### Q2: 微信开发者工具无法打开项目

**解决方案**：
1. 确保已运行 `npm run dev:weapp`
2. 检查 `dist` 目录是否生成
3. 在微信开发者工具中选择 `hotel/src/mobile/dist` 目录

### Q3: 编译报错 "Cannot find module"

**解决方案**：
```bash
# 删除 node_modules 和 lock 文件
rm -rf node_modules package-lock.json

# 重新安装依赖
npm install
```

### Q4: H5 页面无法访问后端 API

**解决方案**：
检查 `config/index.js` 中的代理配置：
```javascript
h5: {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',  // 确保端口正确
        changeOrigin: true
      }
    }
  }
}
```

### Q5: 微信开发者工具提示 "不在以下 request 合法域名列表中"

**解决方案**：
1. 打开微信开发者工具
2. 右上角 **详情** → **本地设置**
3. ✅ 勾选 **不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书**

### Q6: Mac M1/M2 芯片兼容性问题

**解决方案**：
```bash
# 使用 Rosetta 运行终端
arch -x86_64 zsh

# 或安装 ARM 版本的 Node.js
brew install node
```

---

## 推荐工具

### 1. VS Code 插件

- **Taro UI Helper** - Taro 组件智能提示
- **ESLint** - 代码检查
- **Prettier** - 代码格式化
- **Vetur** - Vue 语法支持（如果使用 Vue）

### 2. 终端工具

```bash
# 安装 pnpm（更快的包管理器）
npm install -g pnpm

# 安装 nrm（npm 源管理器）
npm install -g nrm
nrm use taobao  # 切换到淘宝源
```

---

## 项目结构

```
mobile/
├── src/
│   ├── app.jsx              # 应用入口
│   ├── app.config.js        # 应用配置
│   ├── pages/               # 页面目录
│   │   ├── index/           # 首页
│   │   ├── list/            # 列表页
│   │   └── detail/          # 详情页
│   ├── components/          # 组件目录
│   ├── services/            # API 服务
│   └── utils/               # 工具函数
├── config/                  # Taro 配置
│   ├── index.js             # 主配置
│   ├── dev.js               # 开发环境
│   └── prod.js              # 生产环境
└── package.json
```

---

## 构建生产版本

### 微信小程序

```bash
npm run build:weapp
```

构建产物在 `dist/` 目录，使用微信开发者工具上传发布。

### H5

```bash
npm run build:h5
```

构建产物在 `dist/` 目录，部署到静态服务器即可。

---

## 参考资源

- **Taro 官方文档**: https://taro-docs.jd.com/
- **微信小程序文档**: https://developers.weixin.qq.com/miniprogram/dev/framework/
- **Taro UI 组件库**: https://taro-ui.jd.com/
- **项目仓库**: https://gitee.com/zcy2233/hotel

---

## 技术支持

如遇到问题，可以：
1. 查看 Taro 官方文档
2. 搜索 GitHub Issues
3. 在项目仓库提 Issue

---

**祝开发顺利！** 🚀

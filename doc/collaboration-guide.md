# 协作者开发指南

本文档旨在帮助新加入项目的协作者快速上手开发流程，包括代码拉取、提交和推送规范。

## 1. 准备工作

### 接受邀请
在开始之前，请确保仓库管理员已经邀请您加入项目。
1. 检查您的 GitHub 注册邮箱，查找来自 GitHub 的邀请邮件。
2. 点击邮件中的 **View invitation** 链接。
3. 在打开的页面中点击 **Accept invitation** 接受邀请。
4. 接受后，您将拥有对仓库的写入权限（Push）。

## 2. 首次获取代码

如果您是第一次参与开发，需要将代码克隆到本地环境。

### 克隆仓库
打开终端（Terminal）或 Git Bash，执行以下命令：

```bash
# HTTPS 方式 (推荐)
git clone https://github.com/zcyneiya/hotel.git

# 或者 SSH 方式 (需配置 SSH Key)
git clone git@github.com:zcyneiya/hotel.git
```

进入项目目录：
```bash
cd hotel
```

## 3. 日常开发流程

建议遵循以下步骤进行日常开发，以减少冲突。

### 3.1 拉取最新代码 (Sync)
**在每天开始工作前**，或准备提交代码前，务必先拉取远程仓库的最新更改：

```bash
git pull origin master
```

### 3.2 开发与提交 (Commit)
完成某个功能或修复后，提交您的更改。

1. **查看状态**：检查修改了哪些文件
    ```bash
    git status
    ```

2. **添加到暂存区**：
    ```bash
    # 添加所有修改
    git add .
    
    # 或添加指定文件
    git add src/mobile-rn/README.md
    ```

3. **提交到本地仓库**：
    请使用清晰的提交信息，参考 Conventional Commits 规范 (feat, fix, docs 等)。
    ```bash
    git commit -m "feat: 完成用户登录页面布局"
    ```

### 3.3 推送到远程 (Push)
将本地的提交推送到 GitHub 服务器：

```bash
git push origin master
```

## 4. 常见问题排查

### 403 Permission Denied
**现象**：`push` 时提示无权限。
**原因**：
1. 您可能还没有点击邮件中的 **Accept invitation**。
2. 本地 git 配置的凭证与受邀账户不匹配。

### Merge Conflict (合并冲突)
**现象**：`git pull` 或 `git push` 时提示冲突。
**解决**：
1. 打开提示冲突的文件。
2. 搜索 `<<<<<<<` 标记，手动保留需要的代码，删除冲突标记。
3. 保存文件后，重新执行 `git add .` 和 `git commit`。

## 5. 多人协作建议 (分支工作流)

为了避免在主分支 (`master`) 频繁发生冲突，建议使用分支开发：

1. **新建分支**：
    ```bash
    # 基于主分支创建一个新功能分支
    git checkout -b feature/user-profile
    ```
2. **在新分支上开发、提交**。
3. **推送分支**：
    ```bash
    git push origin feature/user-profile
    ```
4. **发起合并请求 (Pull Request)**：
    在 GitHub 页面上发起 Pull Request，将 `feature/user-profile` 合并回 `master`。

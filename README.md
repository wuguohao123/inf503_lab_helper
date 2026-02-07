# inf503_lab_helper
trine inf 503 ucertify lab helper

## 如何使用这个脚本 (How to Use This Script)

这个脚本 (`lab_helper.user.js`) 是一个用户脚本 (UserScript)，需要通过浏览器扩展来运行。最常用的用户脚本管理器是 Tampermonkey。

### 第一步：安装 Tampermonkey 浏览器扩展

1.  **打开你的浏览器并访问相应的应用商店：**
    *   对于 **Chrome** 浏览器：访问 [Chrome 网上应用店](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)。
    *   对于 **Firefox** 浏览器：访问 [Firefox Add-ons 商店](https://addons.mozilla.org/zh-CN/firefox/addon/tampermonkey/)。
    *   对于 **Edge** 浏览器：访问 [Microsoft Edge Add-ons 商店](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpbldcldcblieohhknlghcbfah)。
    *   对于 **Opera** 浏览器：访问 [Opera Addons 商店](https://addons.opera.com/zh-cn/extensions/details/tampermonkey-beta/)。
2.  **安装扩展：** 在对应的商店页面，点击 "添加至 [浏览器名称]" 或 "获取" 按钮，然后按照提示完成安装。安装完成后，你会在浏览器的工具栏上看到一个 Tampermonkey 图标 (通常是一个黑色的方块，上面有两个圈)。

### 第二步：安装 `lab_helper.user.js` 脚本

1.  **打开 `lab_helper.user.js` 文件：**
    *   你可以直接点击这个链接在浏览器中打开文件：[https://raw.githubusercontent.com/wuguohao123/inf503_lab_helper/main/lab_helper.user.js](https://raw.githubusercontent.com/wuguohao123/inf503_lab_helper/main/lab_helper.user.js)
2.  **通过 Tampermonkey 创建新脚本：**
    *   点击浏览器工具栏上的 Tampermonkey 图标。
    *   在弹出的菜单中，选择 "创建新脚本..." (或者 "Add a new script...")。
    *   这会打开一个新的 Tampermonkey 编辑器标签页。
3.  **粘贴脚本代码：**
    *   删除编辑器中所有预设的代码 (通常是一些模板代码)。
    *   将你在第一步打开的 `lab_helper.user.js` 的全部内容复制并粘贴到编辑器中。
4.  **保存脚本：**
    *   点击文件菜单 (通常是左上角的磁盘图标，或 "文件" -> "保存") 来保存脚本。
    *   脚本保存后，它应该会自动启用。你可以在 Tampermonkey 的“仪表板”中查看和管理所有已安装的脚本。

### 第三步：使用脚本

1.  打开 uCertify SQL Lab 页面。
2.  如果脚本已正确安装并启用，你会在页面上看到一个自定义的 SQL Lab 辅助面板。
3.  点击面板上的按钮来执行相应的操作，例如 "一键全通关"。
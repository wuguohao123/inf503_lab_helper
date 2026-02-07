// ==UserScript==
// @name         uCertify SQL Lab 终极完全体 (v1.3)
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  0.连接VM -> 1.新建 -> 2.运行 -> 3.保存 -> 4.文件名 -> 5.评分 -> 6.提交
// @author       Guohao Wu
// @match        *://trine.ucertify.com/*
// @grant        none
// @noframes
// ==/UserScript==

(function() {
    'use strict';

    // --- UI 面板 ---
    const panel = document.createElement('div');
    panel.style = `
        position: fixed; top: 80px; left: 20px; z-index: 9999;
        display: flex; flex-direction: column; gap: 6px;
        background: rgba(33, 37, 41, 0.98); padding: 12px; border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.6); border: 1px solid #555; width: 260px;
    `;
    document.body.appendChild(panel);

    const title = document.createElement('div');
    title.innerText = "👑 SQL Lab 终极完全体 v1.3";
    title.style = "color: #ffc107; font-weight: bold; margin-bottom: 8px; text-align: center; font-size: 14px; border-bottom: 1px solid #666; padding-bottom: 8px;";
    panel.appendChild(title);

    // 辅助工具：等待
    const wait = (ms) => new Promise(r => setTimeout(r, ms));

    // 辅助工具：创建按钮
    function createBtn(text, color, onClick) {
        const btn = document.createElement('button');
        btn.innerHTML = text;
        btn.style = `
            padding: 8px; background: ${color}; color: white; border: none;
            border-radius: 4px; cursor: pointer; text-align: left; width: 100%; font-size: 12px; font-family: sans-serif;
            transition: all 0.2s; margin-bottom: 1px;
        `;
        btn.onmouseover = () => btn.style.opacity = "0.85";
        btn.onmouseout = () => btn.style.opacity = "1";

        btn.onclick = async () => {
            if (btn.disabled) return;
            const originalText = btn.innerHTML;
            btn.disabled = true;
            btn.style.opacity = '0.6';
            try {
                await onClick(btn);
            } catch (e) {
                console.error(e);
                btn.innerHTML = '❌ ' + e.message;
            }
            btn.disabled = false;
            btn.style.opacity = '1';
            if (btn.innerHTML.includes('...')) btn.innerHTML = originalText;
        };
        panel.appendChild(btn);
        return btn;
    }

    // --- 核心查找函数 ---

    function getVMContext() {
        const iframes = document.querySelectorAll('iframe');
        let targetFrame = null;
        for (let i = 0; i < iframes.length; i++) {
            const title = (iframes[i].title || "").toLowerCase();
            if (title.includes("virtual lab") || title.includes("console")) {
                targetFrame = iframes[i];
                break;
            }
        }
        if (!targetFrame) throw new Error('未找到虚拟机窗口');
        try {
            const innerWin = targetFrame.contentWindow;
            const innerDoc = targetFrame.contentDocument;
            const canvas = innerDoc.getElementById('mainCanvas') || innerDoc.querySelector('canvas') || innerDoc.body;
            return { win: innerWin, el: canvas };
        } catch (e) {
            throw new Error('跨域限制');
        }
    }

    function findFileNameBtn(container) {
        const btns = container.querySelectorAll('span.send_text_inside');
        for (const btn of btns) {
            const parent = btn.closest('li') || btn.parentElement.parentElement || btn.parentElement;
            if (parent) {
                const text = parent.innerText;
                if (text.includes("Save") && text.includes("File Name")) return btn;
            }
        }
        return btns.length > 0 ? btns[btns.length - 1] : null;
    }

    function findEvaluateBtn() {
        const spans = document.querySelectorAll('span');
        for (const span of spans) {
            if (span.innerText.trim() === 'Evaluate') return span;
        }
        return null;
    }

    // --- 新增：查找 WIN 和 Connect 按钮 ---
    function findWinBtn() {
        const spans = document.querySelectorAll('span.select_device');
        for (const span of spans) {
            if (span.innerText.trim() === 'WIN') return span;
        }
        return null;
    }

    // ==========================================
    //  核心逻辑模块 (Step 0 - 6)
    // ==========================================

    // --- Step 0: 连接虚拟机 ---
    async function step0_ConnectVM(updateStatus) {
        updateStatus('⏳ [0/6] 查找 WIN 按钮...');
        const winBtn = findWinBtn();
        if (!winBtn) throw new Error('未找到 "WIN" 按钮');

        // 1. 点击 WIN
        winBtn.click();
        await wait(1000); // 等待下拉菜单出现

        // 2. 查找 On/Connect
        updateStatus('⏳ [0/6] 点击 Connect...');
        // 使用 action="Connect" 精准定位
        const connectBtn = document.querySelector('a[action="Connect"]');
        if (!connectBtn) throw new Error('未找到 "On/Connect" 按钮');

        connectBtn.click();

        // 3. 等待虚拟机启动
        // 虚拟机启动比较慢，这里给一个倒计时，避免用户以为卡死了
        for (let i = 15; i > 0; i--) {
            updateStatus(`⏳ [0/6] 等待虚拟机启动 (${i}s)...`);
            await wait(1000);
        }
    }

    async function step1_NewFile(updateStatus) {
        updateStatus('⏳ [1/6] 新建文件 (Alt+F10)...');
        const vm = getVMContext();

        vm.win.focus(); vm.el.focus();
        vm.el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Alt', code: 'AltLeft', keyCode: 18, which: 18, altKey: true, bubbles: true, view: vm.win }));
        await wait(100);
        const f10Opts = { key: 'F10', code: 'F10', keyCode: 121, which: 121, altKey: true, bubbles: true, view: vm.win };
        vm.el.dispatchEvent(new KeyboardEvent('keydown', f10Opts));
        vm.el.dispatchEvent(new KeyboardEvent('keyup', f10Opts));
        await wait(100);
        vm.el.dispatchEvent(new KeyboardEvent('keyup', { key: 'Alt', code: 'AltLeft', keyCode: 18, which: 18, altKey: false, bubbles: true, view: vm.win }));

        await wait(1500);

        const enterOpts = { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, view: vm.win };
        vm.el.dispatchEvent(new KeyboardEvent('keydown', enterOpts));
        vm.el.dispatchEvent(new KeyboardEvent('keypress', enterOpts));
        vm.el.dispatchEvent(new KeyboardEvent('keyup', enterOpts));

        await wait(2000);
    }

    async function step2_RunSQL(updateStatus) {
        updateStatus('⏳ [2/6] 运行 SQL...');
        const vm = getVMContext(); // Get VM context here
        const container = document.getElementById('right_pane_content');
        if (!container) throw new Error('未找到内容区域');

        const codeBlocks = container.querySelectorAll('pre.prettyprint');

        for (let i = 0; i < codeBlocks.length; i++) {
            const block = codeBlocks[i];
            let sendBtn = block.parentElement.querySelector('[title*="Send"], .send-text-btn, .execute-btn');
            if (!sendBtn) {
                const allSendBtns = container.querySelectorAll('button[title*="Send text"]');
                sendBtn = allSendBtns[i];
            }
            if (sendBtn) {
                const codeLength = block.innerText.length;
                const dynamicWait = (codeLength * 80) + 1000;

                block.style.border = "3px solid #007bff";
                block.scrollIntoView({ behavior: 'smooth', block: 'center' });

                sendBtn.click();

                // Simulate Enter key press to add a newline
                const enterOpts = { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, view: vm.win };
                vm.el.dispatchEvent(new KeyboardEvent('keydown', enterOpts));
                vm.el.dispatchEvent(new KeyboardEvent('keypress', enterOpts));
                vm.el.dispatchEvent(new KeyboardEvent('keyup', enterOpts));
                await wait(100); // Short wait after Enter key press

                updateStatus(`⏳ [2/6] 运行中 (${i+1}/${codeBlocks.length})...`);

                await wait(dynamicWait);
                block.style.border = "3px solid #28a745";
            }
        }
    }

    async function step3_OpenSave(updateStatus) {
        updateStatus('⏳ [3/6] 调出保存框...');
        const vm = getVMContext();

        vm.win.focus(); vm.el.focus();

        vm.el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Control', code: 'ControlLeft', keyCode: 17, which: 17, ctrlKey: true, bubbles: true, view: vm.win }));
        await wait(50);
        const sOpts = { key: 's', code: 'KeyS', keyCode: 83, which: 83, ctrlKey: true, bubbles: true, view: vm.win };
        vm.el.dispatchEvent(new KeyboardEvent('keydown', sOpts));
        vm.el.dispatchEvent(new KeyboardEvent('keypress', sOpts));
        vm.el.dispatchEvent(new KeyboardEvent('keyup', sOpts));
        await wait(50);
        vm.el.dispatchEvent(new KeyboardEvent('keyup', { key: 'Control', code: 'ControlLeft', keyCode: 17, which: 17, ctrlKey: false, bubbles: true, view: vm.win }));

        await wait(1500);
    }

    async function step4_FileName(updateStatus) {
        updateStatus('⏳ [4/6] 输入文件名...');
        const container = document.getElementById('right_pane_content');
        const fileNameBtn = findFileNameBtn(container);

        if (!fileNameBtn) throw new Error('未找到文件名按钮');

        fileNameBtn.style.border = "3px solid #d63384";
        fileNameBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        fileNameBtn.click();

        await wait(2500);
        fileNameBtn.style.border = "none";

        updateStatus('⏳ [4/6] 确认保存...');
        const vm = getVMContext();
        vm.win.focus(); vm.el.focus();
        const enterOpts = { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, view: vm.win };
        vm.el.dispatchEvent(new KeyboardEvent('keydown', enterOpts));
        vm.el.dispatchEvent(new KeyboardEvent('keypress', enterOpts));
        vm.el.dispatchEvent(new KeyboardEvent('keyup', enterOpts));

        await wait(1000);
    }

    async function step5_Evaluate(updateStatus) {
        updateStatus('⏳ [5/6] 提交评分...');
        const evaluateSpan = findEvaluateBtn();
        if (!evaluateSpan) throw new Error('未找到 Evaluate 按钮');

        evaluateSpan.style.border = "3px solid red";
        evaluateSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });

        await wait(500);

        const parentBtn = evaluateSpan.closest('button') || evaluateSpan.closest('a') || evaluateSpan.closest('.btn');
        if (parentBtn) {
            parentBtn.click();
        } else {
            evaluateSpan.click();
        }

        await wait(2000);
        evaluateSpan.style.border = "none";
    }

    async function step6_Record(updateStatus) {
        updateStatus('⏳ [6/6] 验证评分结果...');

        let isCorrect = false;
        let checks = 0;

        while (checks < 20) {
            const alertBox = document.querySelector('.alert.alert-success');
            const ansText = document.getElementById('ans-text');

            if ((alertBox && alertBox.innerText.includes('Correct')) ||
                (ansText && ansText.innerText.includes('Correct'))) {
                isCorrect = true;
                break;
            }
            const errorBox = document.querySelector('.alert.alert-danger');
            if (errorBox && errorBox.innerText.includes('Incorrect')) {
                throw new Error('评分结果为 Incorrect！脚本已停止。');
            }
            await wait(500);
            checks++;
        }

        if (!isCorrect) {
            throw new Error('未检测到 Correct 结果 (超时)。请手动检查。');
        }

        updateStatus('✅ 正确! 正在提交...');
        const recordBtn = document.querySelector('.record_my_answer') || document.getElementById('btn-reset-confirm');

        if (recordBtn && !recordBtn.disabled && recordBtn.value !== 'Recorded') {
            recordBtn.click();
            await wait(1000);
        }

        updateStatus('⏳ [6/6] 关闭弹窗...');
        const closeBtn = document.getElementById('closeLab');
        if (closeBtn) closeBtn.click();

        await wait(500);
    }

    // ===========================
    //  UI 按钮绑定
    // ===========================

    createBtn('0️⃣ 连接虚拟机', '#6f42c1', async (btn) => {
        await step0_ConnectVM((msg) => btn.innerHTML = msg);
        btn.innerHTML = '✅ VM 已连接';
    });

    createBtn('1️⃣ 新建文件', '#17a2b8', async (btn) => {
        await step1_NewFile((msg) => btn.innerHTML = msg);
        btn.innerHTML = '✅ 新建完成';
    });

    createBtn('2️⃣ 运行 SQL', '#ffc107', async (btn) => {
        await step2_RunSQL((msg) => btn.innerHTML = msg);
        btn.innerHTML = '✅ SQL 运行完毕';
    });

    createBtn('3️⃣ 调出保存框', '#fd7e14', async (btn) => {
        await step3_OpenSave((msg) => btn.innerHTML = msg);
        btn.innerHTML = '✅ 已发送 Ctrl+S';
    });

    createBtn('4️⃣ 填文件名 + 确认', '#d63384', async (btn) => {
        await step4_FileName((msg) => btn.innerHTML = msg);
        btn.innerHTML = '✅ 文件名已保存';
    });

    createBtn('5️⃣ 提交评分', '#dc3545', async (btn) => {
        await step5_Evaluate((msg) => btn.innerHTML = msg);
        btn.innerHTML = '✅ 已评分';
    });

    createBtn('6️⃣ 验证并提交', '#20c997', async (btn) => {
        await step6_Record((msg) => btn.innerHTML = msg);
        btn.innerHTML = '✅ 已完成';
    });

    const separator = document.createElement('div');
    separator.style = "height: 1px; background: #666; margin: 5px 0;";
    panel.appendChild(separator);

    // --- 🚀 终极一键按钮 ---
    createBtn('🚀 一键全通关 (0-6)', '#28a745', async (btn) => {
        try {
            const log = (msg) => btn.innerHTML = msg;

            // Step 0: Connect
            await step0_ConnectVM(log);

            // Step 1: New File
            await step1_NewFile(log);
            await wait(1000);

            // Step 2: Run SQL
            await step2_RunSQL(log);
            await wait(1000);

            // Step 3: Ctrl+S
            await step3_OpenSave(log);
            await wait(1000);

            // Step 4: Filename
            await step4_FileName(log);
            await wait(1000);

            // Step 5: Evaluate
            await step5_Evaluate(log);
            await wait(2000);

            // Step 6: Record
            await step6_Record(log);

            btn.innerHTML = '🎉 完美通关！';
            btn.style.background = '#198754';
        } catch (error) {
            alert('流程中断: ' + error.message);
            btn.innerHTML = '❌ ' + error.message;
        }
    });

})();
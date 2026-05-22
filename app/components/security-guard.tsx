"use client";

import { useEffect } from "react";

export default function SecurityGuard() {
  useEffect(() => {
    // 1. 禁用右键菜单
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };
    document.addEventListener("contextmenu", handleContextMenu);

    // 2. 禁用文本选择
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      return false;
    };
    document.addEventListener("selectstart", handleSelectStart);

    // 3. 拦截快捷键
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S / Cmd+S 保存页面
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        return false;
      }
      // Ctrl+U / Cmd+U 查看源码
      if ((e.ctrlKey || e.metaKey) && e.key === "u") {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+I / Cmd+Option+I 开发者工具（尝试拦截，但浏览器可能允许）
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        (e.key === "i" || e.key === "I" || e.key === "j" || e.key === "J")
      ) {
        // 不阻止，但记录（无法可靠阻止浏览器内置快捷键）
      }
      // F12 开发者工具
      if (e.key === "F12") {
        // 无法可靠阻止
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    // 4. 控制台警告 + 简单的debugger干扰
    const consoleWarning = () => {
      console.log(
        "%c欢迎来到数学小讲师联盟",
        "font-size:20px;color:#5C4B37;font-weight:bold;"
      );
      console.log(
        "%c这里的内容属于小朋友们哦~ 未经授权禁止复制或转载。",
        "font-size:14px;color:#8A7B6D;"
      );
      // 轻度干扰：让控制台输出混乱（可选）
      // setInterval(() => { debugger; }, 100); // 太激进，暂时不用
    };
    consoleWarning();

    // 检测开发者工具打开时显示警告
    let devToolsOpen = false;
    const threshold = 160;
    const detectDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      if (widthThreshold || heightThreshold) {
        if (!devToolsOpen) {
          devToolsOpen = true;
          console.log(
            "%c⚠️ 数学小讲师联盟提示：请勿复制或盗用小朋友们的原创内容。",
            "font-size:16px;color:#E85D04;font-weight:bold;"
          );
        }
      } else {
        devToolsOpen = false;
      }
    };
    window.addEventListener("resize", detectDevTools);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("selectstart", handleSelectStart);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", detectDevTools);
    };
  }, []);

  return null;
}

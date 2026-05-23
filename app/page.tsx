"use client";

import Link from "next/link";
import { useState } from "react";
import Navbar from "@/components/navbar";

/* ============================================================
   植物 SVG 节点组件
   ============================================================ */

function SproutSVG({ className = "" }: { className?: string }) {
  return (
    <svg width="32" height="36" viewBox="0 0 40 40" className={className}>
      <path
        d="M20 38 Q21.5 28 19.5 18 Q18.5 12 20 8"
        fill="none"
        stroke="#8D6E63"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M20 8 Q13 4 11.5 10.5 Q14 14.5 20 8"
        fill="#E8F5E9"
        stroke="#8D6E63"
        strokeWidth="1.5"
        opacity="0.5"
      />
      <path
        d="M20 8 Q27 3 28.5 9.5 Q26 13.5 20 8"
        fill="#E8F5E9"
        stroke="#8D6E63"
        strokeWidth="1.5"
        opacity="0.5"
      />
      <path
        d="M20 8 Q17.5 2 20 0.5 Q22.5 2 20 8"
        fill="#E8F5E9"
        stroke="#8D6E63"
        strokeWidth="1.5"
        opacity="0.5"
      />
    </svg>
  );
}

function TreeSVG({ className = "" }: { className?: string }) {
  return (
    <svg width="40" height="52" viewBox="0 0 40 52" className={className}>
      {/* 树干 */}
      <path
        d="M20 50 L20 16"
        fill="none"
        stroke="#8D6E63"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* 左树枝 */}
      <path
        d="M20 32 L13 26"
        fill="none"
        stroke="#8D6E63"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* 右树枝 */}
      <path
        d="M20 28 L27 22"
        fill="none"
        stroke="#8D6E63"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* 树冠 - 中央大圆 */}
      <circle
        cx="20"
        cy="14"
        r="11"
        fill="#C8E6C9"
        fillOpacity="0.5"
        stroke="#8D6E63"
        strokeWidth="2"
      />
      {/* 树冠 - 左侧小圆 */}
      <circle
        cx="11"
        cy="18"
        r="7"
        fill="#C8E6C9"
        fillOpacity="0.4"
        stroke="#8D6E63"
        strokeWidth="1.5"
      />
      {/* 树冠 - 右侧小圆 */}
      <circle
        cx="29"
        cy="18"
        r="7"
        fill="#C8E6C9"
        fillOpacity="0.4"
        stroke="#8D6E63"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function ForestSVG({ className = "" }: { className?: string }) {
  return (
    <svg width="60" height="52" viewBox="0 0 70 55" className={className}>
      {/* 左树 */}
      <path
        d="M15 50 L15 32"
        fill="none"
        stroke="#8D6E63"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M15 32 Q8 24 10.5 17 Q12.5 10 15 14 Q17.5 10 19.5 17 Q22 24 15 32"
        fill="#A5D6A7"
        stroke="#8D6E63"
        strokeWidth="1.5"
        opacity="0.5"
      />
      {/* 中树 */}
      <path
        d="M35 50 L35 15"
        fill="none"
        stroke="#8D6E63"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M35 15 Q25 8 28.5 1 Q32 -2 35 3 Q38 -2 41.5 1 Q45 8 35 15"
        fill="#A5D6A7"
        stroke="#8D6E63"
        strokeWidth="1.5"
        opacity="0.5"
      />
      {/* 右树 */}
      <path
        d="M55 50 L55 32"
        fill="none"
        stroke="#8D6E63"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M55 32 Q48 24 50.5 17 Q52.5 10 55 14 Q57.5 10 59.5 17 Q62 24 55 32"
        fill="#A5D6A7"
        stroke="#8D6E63"
        strokeWidth="1.5"
        opacity="0.5"
      />
      {/* 地平线 */}
      <path
        d="M5 50 Q20 51.5 35 50 Q50 48.5 65 50"
        fill="none"
        stroke="#8D6E63"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ============================================================
   阶段数据
   ============================================================ */

const stages = [
  {
    status: "done" as const,
    emoji: "❓",
    role: "提问者",
    cta: "遇到难题？大胆问",
    detail: "拍照或语音上传你的困惑，同龄小伙伴 24h 内回复",
    stickyColor: "#FFF9C4",
    rotate: -2,
    Plant: SproutSVG,
    plantStyle: { transform: "rotate(-5deg)" },
  },
  {
    status: "current" as const,
    emoji: "🎤",
    role: "小讲师",
    cta: "会讲题？录视频教别人",
    detail: "录制 3-5 分钟讲题视频，被采纳赚积分，解锁小讲师身份",
    stickyColor: "#C8E6C9",
    rotate: 8,
    Plant: TreeSVG,
    plantStyle: { transform: "translateY(-10px) translateX(-5px)" },
  },
  {
    status: "todo" as const,
    emoji: "🔬",
    role: "项目成员",
    cta: "想深度玩？组队做项目",
    detail: "5 天一个小项目，和队友一起测量、探索、做汇报，异步协作",
    stickyColor: "#BBDEFB",
    rotate: -1,
    Plant: ForestSVG,
    plantStyle: {},
  },
];

const trustItems = [
  {
    iconBg: "#FFF9C4",
    icon: "🔒",
    title: "内容安全",
    desc: "所有讲题视频经老师审核后才会展示",
  },
  {
    iconBg: "#C8E6C9",
    icon: "⏱️",
    title: "时间灵活",
    desc: "异步协作，孩子每天只需 15 分钟",
  },
  {
    iconBg: "#BBDEFB",
    icon: "👥",
    title: "真实同伴",
    desc: "同年级孩子互助，不是 AI 陪聊",
  },
];

/* ============================================================
   首页组件
   ============================================================ */

export default function HomePage() {
  const [expandedStage, setExpandedStage] = useState<number | null>(null);

  const toggleStage = (index: number) => {
    setExpandedStage(expandedStage === index ? null : index);
  };

  return (
    <main className="min-h-screen relative">
      {/* 涂鸦符号层 */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <span className="absolute top-8 left-8 text-4xl text-[#8D6E63] opacity-[0.08] doodle-float">&#8734;</span>
        <span className="absolute top-20 right-12 text-3xl text-[#8D6E63] opacity-[0.1] doodle-float-slow">&times;</span>
        <span className="absolute top-1/3 left-6 text-3xl text-[#8D6E63] opacity-[0.1] doodle-float-fast">&divide;</span>
        <span className="absolute top-1/3 right-8 text-3xl text-[#8D6E63] opacity-[0.08] doodle-float">&pi;</span>
        <span className="absolute bottom-1/3 left-12 text-3xl text-[#8D6E63] opacity-[0.12] doodle-float-slow">&sum;</span>
        <span className="absolute bottom-1/3 right-6 text-3xl text-[#8D6E63] opacity-[0.1] doodle-float-fast">&radic;</span>
        <span className="absolute bottom-20 left-8 text-3xl text-[#8D6E63] opacity-[0.08] doodle-float">&plusmn;</span>
        <span className="absolute bottom-16 right-12 text-4xl text-[#8D6E63] opacity-[0.1] doodle-float-slow">&#8734;</span>
      </div>

      <Navbar />

      {/* ==================== 首屏核心区 ==================== */}
      <section className="relative z-10 px-4 pt-20 pb-20 text-center">
        {/* ① 品牌标题区 */}
        <h1
          className="text-[32px] leading-tight"
          style={{ fontFamily: "'ZCOOL KuaiLe', 'Noto Sans SC', cursive", color: "#3E2723" }}
        >
          数学小讲师联盟
        </h1>
        <p
          className="mt-3 text-sm"
          style={{ fontFamily: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif", color: "#8D6E63" }}
        >
          小学生·数学互助成长社区
        </p>

        {/* ② 身份进阶路径图 */}
        <div className="mt-20 mx-auto w-[90%] max-w-[400px] md:max-w-[720px]">
          {/* 移动端：纵向排列 */}
          <div className="md:hidden relative flex flex-col items-start gap-8">
            {/* 左侧竖线 */}
            <div className="absolute left-[15px] top-3 bottom-3 w-0.5 bg-[#8D6E63]" />

            {stages.map((stage, index) => {
              const Plant = stage.Plant;
              const isCurrent = stage.status === "current";
              return (
                <div key={index} className="flex items-start gap-4 relative w-full">
                  {/* 植物节点 */}
                  <div className="w-8 flex justify-center shrink-0 relative z-10">
                    <div style={isCurrent ? { transform: "scale(1.2) translateY(-15px) translateX(-8px)" } : stage.plantStyle}>
                      <Plant />
                    </div>
                  </div>

                  {/* 便利贴卡片 */}
                  <div
                    className={`sticky-note flex-1 relative cursor-pointer ${isCurrent ? "current" : ""}`}
                    style={{
                      background: stage.stickyColor,
                      transform: isCurrent
                        ? "rotate(6deg) translateY(-16px)"
                        : `rotate(${stage.rotate}deg)`,
                    }}
                    onClick={() => toggleStage(index)}
                  >
                    {/* 手绘对话框 */}
                    {isCurrent && (
                      <div className="speech-bubble">你现在在这里！ 👇</div>
                    )}

                    <div className="text-2xl text-center">{stage.emoji}</div>
                    <div
                      className="text-center mt-2 text-base"
                      style={{ fontFamily: "'ZCOOL KuaiLe', 'Noto Sans SC', cursive", color: "#3E2723" }}
                    >
                      {stage.role}
                    </div>
                    <div
                      className="text-center mt-1 text-[13px]"
                      style={{ fontFamily: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif", color: "#5D4037" }}
                    >
                      {stage.cta}
                    </div>
                  </div>

                  {/* 展开内容 */}
                  {expandedStage === index && (
                    <div
                      className="ml-12 w-full text-[13px] leading-relaxed"
                      style={{
                        fontFamily: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif",
                        color: "#5D4037",
                        background: "#FAFAF5",
                        border: "1px solid rgba(141,110,99,0.3)",
                        padding: "16px",
                        borderRadius: "2px",
                        marginTop: "8px",
                        animation: "fadeIn 0.3s ease",
                      }}
                    >
                      {stage.detail}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 桌面端：横向排列 */}
          <div className="hidden md:flex relative items-start justify-center gap-10">
            {/* 下方横线 */}
            <div className="absolute left-10 right-10 bottom-[15px] h-0.5 bg-[#8D6E63]" />

            {stages.map((stage, index) => {
              const Plant = stage.Plant;
              const isCurrent = stage.status === "current";
              return (
                <div key={index} className="flex flex-col items-center flex-1 max-w-[200px] relative">
                  {/* 植物节点 */}
                  <div className="h-10 flex items-end justify-center relative z-10 mb-4">
                    <div style={isCurrent ? { transform: "scale(1.2) translateY(-15px) translateX(-8px)" } : stage.plantStyle}>
                      <Plant />
                    </div>
                  </div>

                  {/* 便利贴卡片 */}
                  <div
                    className={`sticky-note w-full relative cursor-pointer ${isCurrent ? "current" : ""}`}
                    style={{
                      background: stage.stickyColor,
                      transform: isCurrent
                        ? "rotate(8deg) translateY(-20px)"
                        : `rotate(${stage.rotate}deg)`,
                    }}
                    onClick={() => toggleStage(index)}
                  >
                    {/* 手绘对话框 */}
                    {isCurrent && (
                      <div className="speech-bubble">你现在在这里！ 👇</div>
                    )}

                    <div className="text-2xl text-center">{stage.emoji}</div>
                    <div
                      className="text-center mt-2 text-base"
                      style={{ fontFamily: "'ZCOOL KuaiLe', 'Noto Sans SC', cursive", color: "#3E2723" }}
                    >
                      {stage.role}
                    </div>
                    <div
                      className="text-center mt-1 text-[13px]"
                      style={{ fontFamily: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif", color: "#5D4037" }}
                    >
                      {stage.cta}
                    </div>
                  </div>

                  {/* 展开内容 */}
                  {expandedStage === index && (
                    <div
                      className="mt-3 w-full text-[13px] leading-relaxed"
                      style={{
                        fontFamily: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif",
                        color: "#5D4037",
                        background: "#FAFAF5",
                        border: "1px solid rgba(141,110,99,0.3)",
                        padding: "16px",
                        borderRadius: "2px",
                        animation: "fadeIn 0.3s ease",
                      }}
                    >
                      {stage.detail}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ③ 分流按钮区 */}
        <div className="mt-20 flex flex-col md:flex-row items-center justify-center gap-4">
          <Link
            href="/qa"
            className="btn-hand btn-yellow w-full md:w-[240px] text-center"
            style={{
              padding: "14px 0",
              fontSize: "16px",
              fontFamily: "'ZCOOL KuaiLe', 'Noto Sans SC', cursive",
            }}
          >
            🙋 我是新手，先提问
          </Link>
          <Link
            href="/qa"
            className="btn-hand btn-green w-full md:w-[240px] text-center"
            style={{
              padding: "14px 0",
              fontSize: "16px",
              fontFamily: "'ZCOOL KuaiLe', 'Noto Sans SC', cursive",
            }}
          >
            🎤 我会做题，来讲讲
          </Link>
        </div>
        <p
          className="mt-4 text-[13px]"
          style={{ fontFamily: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif", color: "#8D6E63" }}
        >
          已有账号？
          <Link href="/login" className="text-[#3E2723] hover:underline">
            登录
          </Link>
          · 新同学？
          <Link href="/register" className="text-[#3E2723] hover:underline">
            注册
          </Link>
        </p>
      </section>

      {/* ==================== 信任背书区 ==================== */}
      <section className="relative z-10 px-4 pt-20 pb-10 text-center">
        <h2
          className="text-xl"
          style={{ fontFamily: "'ZCOOL KuaiLe', 'Noto Sans SC', cursive", color: "#3E2723" }}
        >
          家长最关心的三件事
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto mt-12 items-start md:items-stretch">
          {trustItems.map((item, index) => {
            const rotations = [-2, 1, -1];
            return (
              <div
                key={index}
                className="flex flex-col items-center"
                style={{
                  background: item.iconBg,
                  border: "2px dashed #8D6E63",
                  borderRadius: "2px 255px 2px 255px / 255px 2px 255px 2px",
                  padding: "32px 24px",
                  transform: `rotate(${rotations[index]}deg)`,
                }}
              >
                {/* 手绘不规则图标 */}
                <div
                  className="w-14 h-14 flex items-center justify-center relative corner-fold"
                  style={{
                    background: "rgba(255,255,255,0.5)",
                    border: "2px solid #8D6E63",
                    borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px",
                  }}
                >
                  <span className="text-2xl">{item.icon}</span>
                </div>

                <h3
                  className="mt-4 text-[15px]"
                  style={{ fontFamily: "'ZCOOL KuaiLe', 'Noto Sans SC', cursive", color: "#3E2723" }}
                >
                  {item.title}
                </h3>
                <p
                  className="mt-2 text-[13px] leading-[1.6] max-w-[280px]"
                  style={{ fontFamily: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif", color: "#5D4037" }}
                >
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 波浪线分隔 */}
      <div className="relative z-10 flex justify-center my-10">
        <svg
          width="200"
          height="12"
          viewBox="0 0 200 12"
          style={{ opacity: 0.2, width: "60%", maxWidth: "200px" }}
        >
          <path
            d="M0,6 Q10,0 20,6 T40,6 T60,6 T80,6 T100,6 T120,6 T140,6 T160,6 T180,6 T200,6"
            fill="none"
            stroke="#8D6E63"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* ==================== 行动号召区 ==================== */}
      <section className="relative z-10 px-4 py-16">
        <div
          className="card-paper mx-auto w-[90%] max-w-[400px] md:max-w-[600px] text-center"
          style={{ background: "transparent" }}
        >
          <h2
            className="text-2xl"
            style={{ fontFamily: "'ZCOOL KuaiLe', 'Noto Sans SC', cursive", color: "#3E2723" }}
          >
            准备好加入了吗？
          </h2>
          <p
            className="mt-2 text-sm"
            style={{ fontFamily: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif", color: "#8D6E63" }}
          >
            第一期种子用户招募中
          </p>

          <Link
            href="/register"
            className="btn-hand mt-6 inline-block"
            style={{
              padding: "16px 48px",
              fontSize: "16px",
              fontFamily: "'ZCOOL KuaiLe', 'Noto Sans SC', cursive",
              background: "transparent",
              color: "#3E2723",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.background = "#FFF9C4";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.background = "transparent";
            }}
          >
            立即报名
          </Link>
        </div>
      </section>

      {/* fadeIn 动画 */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}

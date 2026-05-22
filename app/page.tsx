import Link from "next/link";
import Navbar from "@/components/navbar";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* 顶部导航 */}
      <Navbar />

      {/* Hero 区域 */}
      <section className="px-6 pt-12 pb-16 max-w-6xl mx-auto relative z-10">
        <div className="text-center space-y-6">
          <div className="inline-block sticker sticker-yellow">
            <span className="text-sm font-medium" style={{ color: "#5D4E44" }}>小学一、二年级 · 同伴互助 · 项目制学习</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold leading-tight handwritten-title infinity-title">
            数学小讲师联盟
          </h1>
          
          <p className="text-xl md:text-2xl font-medium" style={{ color: "#5D4E44" }}>
            会思考，爱数学
          </p>
          
          <p className="max-w-xl mx-auto leading-relaxed" style={{ color: "#8D7E72" }}>
            同年级的孩子教孩子，真实协作，共同成长。
            <br />
            不是上网课，是找一群爱数学的小伙伴。
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/qa"
              className="hand-btn hand-btn-green"
            >
              🙋 去提问 / 讲题
            </Link>
            <Link
              href="/projects"
              className="hand-btn hand-btn-blue"
            >
              🚀 探索项目营
            </Link>
          </div>
        </div>
      </section>

      {/* ∞ 分隔线 */}
      <div className="max-w-4xl mx-auto px-6">
        <hr className="infinity-divider" />
      </div>

      {/* 核心玩法区域 */}
      <section className="px-6 py-16 max-w-6xl mx-auto relative z-10">
        <h2 className="text-2xl font-bold text-center mb-10 handwritten-title">
          在这里，孩子可以
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* 卡片 1：提问 */}
          <div className="sticker sticker-white">
            <div className="text-3xl mb-4" style={{ opacity: 0.8 }}>❓</div>
            <h3 className="text-lg font-bold mb-2" style={{ color: "#3E2723" }}>遇到难题？大胆问</h3>
            <p className="text-sm leading-relaxed" style={{ color: "#5D4E44" }}>
              拍照上传作业题，或语音说出你的困惑。同龄小讲师24小时内为你讲解，保护提问安全感。
            </p>
          </div>

          {/* 卡片 2：讲题 */}
          <div className="sticker sticker-green">
            <div className="text-3xl mb-4" style={{ opacity: 0.8 }}>🎤</div>
            <h3 className="text-lg font-bold mb-2" style={{ color: "#3E2723" }}>会做题？来讲讲</h3>
            <p className="text-sm leading-relaxed" style={{ color: "#5D4E44" }}>
              录制3-5分钟讲题视频，教别的小朋友。讲题被采纳赚积分，还能解锁小讲师身份！
            </p>
          </div>

          {/* 卡片 3：项目营 */}
          <div className="sticker sticker-blue">
            <div className="text-3xl mb-4" style={{ opacity: 0.8 }}>🔬</div>
            <h3 className="text-lg font-bold mb-2" style={{ color: "#3E2723" }}>想深度玩？进项目营</h3>
            <p className="text-sm leading-relaxed" style={{ color: "#5D4E44" }}>
              5天一个小项目，和队友一起测量、探索、做汇报。异步为主，不占用整块时间。
            </p>
          </div>
        </div>
      </section>

      {/* ∞ 分隔线 */}
      <div className="max-w-4xl mx-auto px-6">
        <hr className="infinity-divider" />
      </div>

      {/* 理念横幅 */}
      <section className="px-6 py-12 max-w-4xl mx-auto relative z-10">
        <div className="sticker sticker-yellow text-center">
          <p className="text-lg font-medium mb-3" style={{ color: "#3E2723" }}>我们的坚持</p>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            {["赋能而非替代", "反焦虑教育", "真实同伴互动", "科学有依据", "可落地"].map((item) => (
              <span key={item} className="hand-badge hand-badge-white">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA 底部 */}
      <section className="px-6 py-16 text-center relative z-10">
        <h2 className="text-2xl font-bold mb-4 handwritten-title" style={{ color: "#3E2723" }}>
          准备好加入了吗？
        </h2>
        <p className="mb-6" style={{ color: "#5D4E44" }}>
          第一期种子用户招募中，仅限30名
        </p>
        <Link
          href="/register"
          className="hand-btn hand-btn-green text-lg"
        >
          ✏️ 立即报名
        </Link>
      </section>

      {/* 尾部已移至 layout.tsx */}
    </main>
  );
}

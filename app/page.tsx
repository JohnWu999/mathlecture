"use client";

import Link from "next/link";
import Navbar from "@/components/navbar";

const stages = [
  { key: "seed", title: "问题发芽", note: "我敢问", badge: "今日问题种子" },
  { key: "teacher", title: "讲解长高", note: "我能讲", badge: "等待小讲师" },
  { key: "forest", title: "项目成林", note: "我们做", badge: "一起探索" },
];

const identities = [
  {
    key: "seedling",
    badge: "提问者",
    surprise: "敢问也很棒",
    title: "思考发芽",
    desc: "能说出“我哪里不明白”，就是数学开窍的开始。",
  },
  {
    key: "teacher",
    badge: "小讲师",
    surprise: "讲慢点也可以",
    title: "理解长高",
    desc: "用图、用话、用自己的方法，把一道题讲给别人听懂。",
  },
  {
    key: "explorer",
    badge: "探索家",
    surprise: "一起完成",
    title: "项目成林",
    desc: "和同伴测量、记录、讨论，把数学放进真实生活。",
  },
];

const posters = [
  ["我提出了一个好问题", "好问题海报"],
  ["我把这个方法讲清楚了", "小讲师封面"],
  ["我们一起完成了一个项目", "项目成果海报"],
];

function LogoMark() {
  return (
    <svg viewBox="0 0 140 86" aria-label="两个孩子握手形成无限符号">
      <path
        d="M20 43C36 10 62 11 70 43C78 75 104 76 120 43C104 10 78 11 70 43C62 75 36 76 20 43Z"
        fill="none"
        stroke="#2f8f67"
        strokeWidth="9.5"
        strokeLinecap="round"
      />
      <circle cx="48" cy="27" r="8" fill="#ffd166" />
      <circle cx="92" cy="59" r="8" fill="#3b82f6" />
      <path d="M58 39c7 7 17 7 24 0" fill="none" stroke="#f9733d" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

function StageGlyph({ type }: { type: string }) {
  return <div className={`glyph ${type}`} aria-hidden="true" />;
}

export default function HomePage() {
  return (
    <main className="forest-home">
      <Navbar />

      <div className="test-ribbon" role="note">
        <b>内部测试版</b>
        <span>功能入口正在验收：能真实闭环的保留强入口，未补齐的下一阶段降级或隐藏。</span>
      </div>

      <header className="hero" id="growth-path">
        <div className="wrap hero-grid">
          <section className="hero-copy" aria-labelledby="home-title">
            <div className="kicker"><i />会思考，爱数学</div>
            <h1 id="home-title">
              让一个好问题，<span className="hi">长成一片数学森林</span>。
            </h1>
            <p className="lead">先把“不明白”说出来，再讲给别人听，最后和同伴一起做出来。</p>
            <div className="buttons">
              <Link className="btn primary" href="/qa/ask">我要提问</Link>
              <Link className="btn secondary" href="#journey">看孩子如何成长</Link>
            </div>
            <div className="tiny-story" aria-label="成长路径">
              <span>🌱</span>问题发芽 <span>🌳</span>讲解长高 <span>🌲</span>项目成林
            </div>
          </section>

          <section className="world" aria-label="一个问题正在长大的视觉动线">
            <div className="world-title">一个问题正在长大</div>
            <svg className="path-svg" viewBox="0 0 900 520" aria-hidden="true">
              <path className="path-bg" d="M140 260C250 42 390 42 450 260C510 478 650 478 760 260C650 42 510 42 450 260C390 478 250 478 140 260Z" />
              <path className="path-dash" d="M140 260C250 42 390 42 450 260C510 478 650 478 760 260C650 42 510 42 450 260C390 478 250 478 140 260Z" />
              <circle cx="340" cy="160" r="13" fill="#ffd166" />
              <circle cx="560" cy="360" r="13" fill="#3b82f6" />
              <path d="M354 174c58 36 134 36 192 0" stroke="#f9733d" strokeWidth="7" strokeLinecap="round" fill="none" opacity=".72" />
            </svg>
            <i className="firefly f1" /><i className="firefly f2" /><i className="firefly f3" /><i className="firefly f4" />
            {stages.map((stage) => (
              <div className={`stage ${stage.key}`} key={stage.key}>
                <div className="bubble">
                  <StageGlyph type={stage.key} />
                  <b>{stage.title}</b>
                  <small>{stage.note}</small>
                </div>
              </div>
            ))}
            <div className="question-card">
              <div className="top">
                <span className="tag">今日问题种子</span>
                <span className="interest">3 个同学也想知道</span>
              </div>
              <h3>为什么 1/2 比 1/3 大？</h3>
              <div className="chips"><span>二年级</span><span>分数直观</span><span>等待小讲师</span></div>
            </div>
            <div className="warm-note">谢谢你把问题说出来</div>
          </section>
        </div>
        <a className="scroll-cue" href="#journey">往下看，它怎么长大</a>
      </header>

      <section className="section" id="journey">
        <div className="wrap">
          <div className="section-title">
            <h2>少一点说明，多看见一条生命动线。</h2>
            <div className="hint">从“我不会”到“我讲清楚了”，再到“我们一起做出来”。</div>
          </div>
          <div className="journey">
            <div className="river" aria-hidden="true"><svg viewBox="0 0 1000 220"><path d="M70 120C210 20 300 210 450 105S715 25 920 132" /><path className="thin" d="M70 120C210 20 300 210 450 105S715 25 920 132" /></svg></div>
            <article className="scene one"><div className="pic"><span className="kid a" /><span className="board" /></div><h3>提出问题</h3><p>困惑被温柔接住。</p></article>
            <article className="scene two"><div className="pic treepic"><span className="stamp">讲清楚</span></div><h3>讲给别人</h3><p>理解开始长高。</p></article>
            <article className="scene three"><div className="pic forestpic"><span className="kid a" /><span className="kid b" /></div><h3>一起探索</h3><p>小树汇成森林。</p></article>
          </div>
        </div>
      </section>

      <section className="section" id="identities">
        <div className="wrap">
          <div className="section-title">
            <h2>三种身份，是孩子被看见的三种光。</h2>
            <div className="hint">不排名，不比较。只记录孩子真实长出来的能力。</div>
          </div>
          <div className="growth-strip">
            {identities.map((identity) => (
              <article className="identity" key={identity.key}>
                <span className="surprise">{identity.surprise}</span>
                <div className={`mini ${identity.key}`} aria-hidden="true" />
                <span className="badge">{identity.badge}</span>
                <h3>{identity.title}</h3>
                <p>{identity.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="projects-preview">
        <div className="wrap">
          <div className="section-title">
            <h2>项目营像森林任务，不像课程货架。</h2>
            <div className="hint">一眼看懂几人解锁、做什么、会留下什么作品。</div>
          </div>
          <div className="project-board">
            <article className="mission">
              <span className="label">森林任务｜二年级</span>
              <h3>给家里的物品做一次“长度调查”</h3>
              <p>3 位探索家组队，测量、比较、讲清楚。</p>
              <div className="slots"><div><b>3 人</b><small>达到人数自动解锁</small></div><div><b>2/3</b><small>已加入探索家</small></div><div><b>作品</b><small>海报 + 讲解视频</small></div></div>
            </article>
            <div className="poster-wall">
              {posters.map(([title, label]) => <article className="poster" key={title}><b>{title}</b><span>{label}</span></article>)}
            </div>
          </div>
        </div>
      </section>

      <section className="warm">
        <div className="wrap warm-panel">
          <section>
            <h2>有些小设计，是给孩子的温柔回应。</h2>
            <p>当孩子提交问题时，不只显示“提交成功”，而是出现一张小纸条：<b>谢谢你把问题说出来。</b> 这类细节，会让网站更有人味儿。</p>
            <div className="final-buttons"><Link className="btn primary" href="/qa/ask">我要提问</Link><Link className="btn secondary" href="#journey">看孩子如何成长</Link></div>
          </section>
          <div className="note-stack"><div className="note one">你的问题已经发芽 🌱</div><div className="note two">有同学也想知道这道题</div><div className="note three">慢慢讲，我们听得见</div></div>
        </div>
      </section>

      <style jsx global>{`
        :root{
          --paper:#fff8e8; --cream:#fffdf3; --green:#184638; --green2:#2f8f67; --sprout:#8bd86f; --mint:#dff4d8; --blue:#3b82f6; --sun:#ffd166; --orange:#f9733d; --soil:#8b6b4a; --ink:#14352b; --muted:#435f54; --line:rgba(24,70,56,.12);
          --shadow:0 28px 90px rgba(24,70,56,.16); --soft:0 14px 38px rgba(24,70,56,.10);
        }
        html{scroll-behavior:smooth}
        body{margin:0;color:var(--green);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans SC","PingFang SC","Microsoft YaHei",sans-serif;background:var(--paper);overflow-x:hidden}
        body:before{content:"";position:fixed;inset:0;z-index:-2;background:radial-gradient(circle at 12% 10%,rgba(255,209,102,.42),transparent 25%),radial-gradient(circle at 88% 16%,rgba(139,216,111,.32),transparent 28%),linear-gradient(180deg,#fff8e8 0%,#fffdf3 42%,#eef9e8 100%)}
        body:after{content:"";position:fixed;inset:0;z-index:-1;background-image:linear-gradient(rgba(24,70,56,.032) 1px,transparent 1px),linear-gradient(90deg,rgba(24,70,56,.032) 1px,transparent 1px);background-size:34px 34px;mask-image:linear-gradient(to bottom,#000 0%,rgba(0,0,0,.52) 58%,transparent 100%)}
        .forest-home *{box-sizing:border-box}.forest-home a{text-decoration:none;color:inherit}.wrap{max-width:1360px;margin:0 auto}.forest-nav{height:76px;display:flex;align-items:center;justify-content:space-between;padding:0 56px;position:sticky;top:0;z-index:80;background:rgba(255,248,232,.72);backdrop-filter:blur(18px);border-bottom:1px solid rgba(24,70,56,.08)}
        .brand{display:flex;align-items:center;gap:12px;font-weight:950;letter-spacing:-.02em}.brand svg{width:56px;height:38px}.navlinks{display:flex;align-items:center;gap:26px;font-size:15px;font-weight:850;color:rgba(24,70,56,.72)}.navlinks a:hover{color:var(--green)}.navlinks .ask{background:var(--green);color:white;padding:12px 18px;border-radius:999px;box-shadow:var(--soft)}
        .test-ribbon{position:relative;z-index:70;display:flex;justify-content:center;gap:12px;align-items:center;padding:10px 18px;background:rgba(255,247,214,.82);border-bottom:1px solid rgba(139,107,74,.16);font-size:14px;color:#684b1f}.test-ribbon b{color:#184638}.test-ribbon span{font-weight:800}
        .hero{min-height:790px;padding:58px 56px 46px;position:relative}.hero-grid{display:grid;grid-template-columns:.92fr 1.08fr;gap:42px;align-items:center}.kicker{display:inline-flex;align-items:center;gap:10px;background:#fffef8;border:1px solid rgba(47,143,103,.16);border-radius:999px;padding:10px 14px;font-weight:950;color:var(--green2);box-shadow:var(--soft)}.kicker i{width:10px;height:10px;border-radius:50%;background:var(--orange);box-shadow:0 0 0 7px rgba(249,115,61,.12)}
        h1{font-size:clamp(48px,5.7vw,84px);line-height:1.03;letter-spacing:-.075em;margin:24px 0 18px;max-width:760px}.hi{position:relative;white-space:nowrap}.hi:after{content:"";position:absolute;left:-8px;right:-7px;bottom:7px;height:21px;border-radius:20px;background:rgba(255,209,102,.68);z-index:-1;transform:rotate(-1.2deg)}
        .lead{max-width:630px;font-size:20px;line-height:1.72;color:rgba(24,70,56,.78);margin:0 0 30px}.buttons,.final-buttons{display:flex;gap:16px;flex-wrap:wrap}.btn{display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:999px;min-height:58px;padding:0 26px;font-size:17px;font-weight:950;cursor:pointer}.btn.primary{background:var(--orange);color:#fff;box-shadow:0 18px 38px rgba(249,115,61,.28)}.btn.secondary{background:white;color:var(--green);border:1px solid rgba(24,70,56,.13);box-shadow:var(--soft)}
        .tiny-story{display:flex;align-items:center;gap:10px;margin-top:24px;color:rgba(24,70,56,.66);font-size:14px;font-weight:850}.tiny-story span{display:inline-grid;place-items:center;width:28px;height:28px;border-radius:50%;background:#fff;border:1px solid rgba(24,70,56,.10)}
        .world{position:relative;height:650px;border-radius:60px;background:linear-gradient(180deg,#fffef6 0%,#f2fbec 52%,#dff3d7 100%);border:1px solid rgba(24,70,56,.10);box-shadow:var(--shadow);overflow:hidden}.world:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 38% 18%,rgba(255,209,102,.34),transparent 18%),radial-gradient(circle at 88% 78%,rgba(59,130,246,.14),transparent 22%)}
        .world-title{position:absolute;left:34px;top:28px;z-index:5;background:rgba(255,255,255,.72);border:1px solid rgba(24,70,56,.10);border-radius:22px;padding:11px 14px;font-weight:950;box-shadow:var(--soft)}.path-svg{position:absolute;left:50%;top:48%;width:800px;max-width:118%;transform:translate(-50%,-50%) rotate(-4deg);opacity:.95}.path-bg{fill:none;stroke:rgba(59,130,246,.16);stroke-width:28;stroke-linecap:round}.path-dash{fill:none;stroke:rgba(47,143,103,.42);stroke-width:4;stroke-dasharray:9 15;stroke-linecap:round;animation:dash 18s linear infinite}@keyframes dash{to{stroke-dashoffset:-240}}
        .firefly{position:absolute;width:9px;height:9px;border-radius:50%;background:var(--sun);box-shadow:0 0 18px rgba(255,209,102,.9);animation:fly 8s ease-in-out infinite}.f1{left:18%;top:24%}.f2{right:18%;top:18%;animation-delay:1.4s;background:#9be27a}.f3{right:25%;bottom:20%;animation-delay:2.1s;background:#76a7ff}.f4{left:24%;bottom:27%;animation-delay:3.2s}@keyframes fly{50%{transform:translate(24px,-18px) scale(1.25)}}
        .stage{position:absolute;z-index:6;width:168px;text-align:center}.stage .bubble{background:rgba(255,254,249,.88);backdrop-filter:blur(10px);border:1px solid rgba(24,70,56,.11);border-radius:34px;padding:16px 14px;box-shadow:var(--soft)}.stage b{display:block;font-size:20px;letter-spacing:-.02em}.stage small{display:block;margin-top:4px;color:var(--muted);font-weight:800}.stage.seed{left:42px;top:248px}.stage.teacher{left:275px;top:95px}.stage.forest{right:42px;top:248px}
        .glyph{height:70px;margin-bottom:8px;position:relative}.glyph.seed:before{content:"";position:absolute;left:50%;bottom:10px;width:8px;height:34px;background:var(--green2);border-radius:99px;transform:translateX(-50%)}.glyph.seed:after{content:"";position:absolute;left:50%;top:12px;width:48px;height:30px;border-radius:80% 0 80% 0;background:var(--sprout);transform:translateX(-50%) rotate(18deg)}.glyph.teacher:before{content:"";position:absolute;left:50%;bottom:8px;width:12px;height:42px;background:var(--soil);border-radius:8px;transform:translateX(-50%)}.glyph.teacher:after{content:"";position:absolute;left:50%;top:6px;width:64px;height:58px;border-radius:50% 50% 46% 46%;background:var(--green2);transform:translateX(-50%)}.glyph.forest:before{content:"";position:absolute;left:20px;top:14px;width:48px;height:48px;border-radius:50%;background:var(--sprout);box-shadow:36px -8px 0 var(--green2),70px 10px 0 #5fb952}.glyph.forest:after{content:"";position:absolute;left:44px;bottom:7px;width:80px;height:12px;border-radius:999px;background:rgba(139,107,74,.28)}
        .question-card{position:absolute;left:112px;right:82px;bottom:42px;z-index:8;background:#fffef9;border:1px solid rgba(24,70,56,.12);border-radius:34px;padding:22px 24px;box-shadow:0 24px 64px rgba(24,70,56,.18)}.question-card .top{display:flex;justify-content:space-between;gap:12px;align-items:center}.tag{display:inline-flex;align-items:center;gap:8px;background:rgba(255,209,102,.38);border-radius:999px;padding:8px 12px;font-size:13px;font-weight:950;color:#674800}.interest{color:var(--muted);font-weight:900;font-size:13px}.question-card h3{font-size:23px;letter-spacing:-.035em;line-height:1.25;margin:13px 0 10px}.chips{display:flex;gap:8px;flex-wrap:wrap}.chips span{padding:7px 10px;border-radius:999px;background:#edf7e8;color:var(--green2);font-size:13px;font-weight:900}.warm-note{position:absolute;right:34px;bottom:150px;z-index:9;background:#fff7d6;border:1px solid rgba(139,107,74,.12);border-radius:20px 20px 20px 4px;padding:12px 14px;box-shadow:var(--soft);font-size:14px;font-weight:900;transform:rotate(2deg)}
        .scroll-cue{position:absolute;left:50%;bottom:18px;transform:translateX(-50%);font-size:14px;font-weight:900;color:rgba(24,70,56,.58)}.scroll-cue:after{content:"";display:block;width:2px;height:30px;margin:8px auto 0;background:linear-gradient(var(--green2),transparent);border-radius:2px}
        .section{padding:74px 56px}.section-title{display:flex;align-items:end;justify-content:space-between;gap:28px;margin-bottom:34px}.section h2,.warm-panel h2{font-size:clamp(34px,4vw,58px);line-height:1.12;letter-spacing:-.058em;margin:0;max-width:880px}.section .hint{max-width:330px;color:var(--muted);font-weight:800;line-height:1.7}.journey{position:relative;min-height:560px;border-radius:58px;background:#fffef8;border:1px solid rgba(24,70,56,.10);box-shadow:var(--shadow);overflow:hidden;padding:46px}.journey:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 20% 70%,rgba(255,209,102,.22),transparent 20%),radial-gradient(circle at 82% 34%,rgba(139,216,111,.22),transparent 22%)}
        .river{position:absolute;left:8%;right:8%;top:48%;height:190px;transform:translateY(-50%)}.river svg{width:100%;height:100%;overflow:visible}.river path{fill:none;stroke:rgba(47,143,103,.24);stroke-width:24;stroke-linecap:round}.river .thin{stroke:rgba(59,130,246,.42);stroke-width:4;stroke-dasharray:10 16;animation:dash 20s linear infinite}.scene{position:absolute;z-index:3;width:210px}.scene.one{left:7%;top:38%}.scene.two{left:40%;top:18%}.scene.three{right:7%;top:38%}.scene .pic{height:178px;border-radius:40px;background:#f3fbef;border:1px solid rgba(24,70,56,.10);box-shadow:var(--soft);position:relative;overflow:hidden}.scene h3{font-size:25px;margin:15px 0 4px;letter-spacing:-.04em}.scene p{margin:0;color:var(--muted);font-weight:800;line-height:1.55}.kid{position:absolute;bottom:24px;width:44px;height:62px;border-radius:22px 22px 16px 16px;background:#7ec85f}.kid:before{content:"";position:absolute;top:-24px;left:7px;width:30px;height:30px;border-radius:50%;background:#ffdca8}.kid.a{left:54px}.kid.b{right:50px;background:#3b82f6}.board{position:absolute;left:50%;top:42px;transform:translateX(-50%);width:96px;height:62px;border-radius:18px;background:#fff;border:2px solid rgba(24,70,56,.14)}.board:before{content:"?";position:absolute;inset:0;display:grid;place-items:center;color:var(--orange);font-size:35px;font-weight:950}.treepic:before{content:"";position:absolute;left:50%;bottom:32px;width:16px;height:76px;background:var(--soil);border-radius:10px;transform:translateX(-50%)}.treepic:after{content:"";position:absolute;left:50%;top:42px;width:110px;height:98px;border-radius:50%;background:var(--green2);transform:translateX(-50%);box-shadow:-42px 20px 0 var(--sprout),42px 22px 0 #65b955}.forestpic:before{content:"";position:absolute;inset:34px 28px;background:radial-gradient(circle at 20% 70%,#8bd86f 0 28px,transparent 29px),radial-gradient(circle at 46% 42%,#2f8f67 0 42px,transparent 43px),radial-gradient(circle at 74% 66%,#65b955 0 31px,transparent 32px)}.stamp{position:absolute;right:20px;top:18px;background:#fff7d6;border-radius:999px;padding:8px 10px;color:#806018;font-weight:950;font-size:13px}
        .growth-strip{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}.identity{min-height:340px;border-radius:48px;background:#fffef8;border:1px solid rgba(24,70,56,.10);box-shadow:var(--soft);padding:30px;position:relative;overflow:hidden}.identity:before{content:"";position:absolute;right:-40px;bottom:-50px;width:190px;height:190px;border-radius:50%;background:rgba(139,216,111,.16)}.identity .mini{height:112px;position:relative}.identity .badge{display:inline-flex;background:#edf7e8;border:1px solid rgba(47,143,103,.12);border-radius:999px;padding:8px 12px;font-weight:950;color:var(--green2)}.identity h3{font-size:31px;letter-spacing:-.045em;margin:18px 0 8px}.identity p{font-size:16px;line-height:1.65;color:var(--muted);margin:0}.identity .surprise{position:absolute;right:24px;top:24px;background:#fff7d6;border-radius:999px;padding:8px 11px;font-size:13px;font-weight:950;color:#806018}.mini.seedling:before{content:"";position:absolute;left:28px;bottom:10px;width:10px;height:54px;background:var(--green2);border-radius:999px}.mini.seedling:after{content:"";position:absolute;left:12px;top:26px;width:70px;height:42px;border-radius:80% 0 80% 0;background:var(--sprout);transform:rotate(14deg)}.mini.teacher:before{content:"";position:absolute;left:48px;bottom:8px;width:16px;height:70px;background:var(--soil);border-radius:999px}.mini.teacher:after{content:"";position:absolute;left:8px;top:8px;width:96px;height:88px;border-radius:50% 50% 46% 46%;background:var(--green2);box-shadow:0 0 0 14px rgba(139,216,111,.18) inset}.mini.explorer:before{content:"";position:absolute;left:0;right:0;bottom:10px;height:75px;background:radial-gradient(circle at 20% 70%,var(--sprout) 0 28px,transparent 29px),radial-gradient(circle at 50% 36%,var(--green2) 0 44px,transparent 45px),radial-gradient(circle at 78% 68%,#65b955 0 31px,transparent 32px)}
        .project-board{display:grid;grid-template-columns:1.04fr .96fr;gap:26px}.mission{position:relative;min-height:480px;border-radius:56px;background:linear-gradient(135deg,#174638,#2f8f67);color:white;box-shadow:var(--shadow);padding:34px;overflow:hidden}.mission:before{content:"∞";position:absolute;right:-54px;bottom:-122px;font:420px Georgia,serif;color:rgba(255,255,255,.07);transform:rotate(-7deg)}.mission .label{display:inline-flex;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.18);border-radius:999px;padding:9px 13px;font-weight:950}.mission h3{font-size:42px;line-height:1.16;letter-spacing:-.052em;margin:26px 0 14px;max-width:650px}.mission p{font-size:18px;line-height:1.65;color:rgba(255,255,255,.78);max-width:640px}.mission .slots{position:absolute;left:34px;right:34px;bottom:34px;display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.slots div{border-radius:22px;background:rgba(255,255,255,.13);border:1px solid rgba(255,255,255,.18);padding:16px}.slots b{display:block;font-size:22px}.slots small{color:rgba(255,255,255,.74);font-weight:800}.poster-wall{display:grid;gap:16px}.poster{position:relative;background:#fffef8;border:1px solid rgba(24,70,56,.10);border-radius:34px;padding:24px 24px 24px 92px;box-shadow:var(--soft);min-height:138px;overflow:hidden}.poster:before{content:"";position:absolute;left:24px;top:26px;width:48px;height:48px;border-radius:20px;background:var(--mint)}.poster:nth-child(1):before{background:radial-gradient(circle at 50% 65%,var(--sprout) 0 8px,transparent 9px),var(--mint)}.poster:nth-child(2):before{background:radial-gradient(circle at 50% 35%,var(--green2) 0 18px,transparent 19px),var(--mint)}.poster:nth-child(3):before{background:radial-gradient(circle at 30% 60%,var(--sprout) 0 15px,transparent 16px),radial-gradient(circle at 65% 45%,var(--green2) 0 18px,transparent 19px),var(--mint)}.poster b{display:block;font-size:24px;letter-spacing:-.035em}.poster span{display:inline-flex;margin-top:12px;color:var(--orange);font-weight:950}
        .warm{padding:80px 56px 108px}.warm-panel{position:relative;border-radius:60px;background:#fffef8;border:1px solid rgba(24,70,56,.10);box-shadow:var(--shadow);padding:54px;overflow:hidden;display:grid;grid-template-columns:1fr .86fr;gap:32px;align-items:center}.warm-panel:before{content:"";position:absolute;right:8%;top:18%;width:190px;height:190px;border-radius:50%;background:rgba(255,209,102,.22)}.warm-panel p{font-size:18px;line-height:1.7;color:var(--muted);max-width:680px}.note-stack{position:relative;min-height:280px}.note{position:absolute;background:#fff7d6;border:1px solid rgba(139,107,74,.13);border-radius:26px 26px 26px 6px;padding:18px 20px;font-weight:950;box-shadow:var(--soft)}.note.one{left:10px;top:14px;transform:rotate(-5deg)}.note.two{right:14px;top:96px;transform:rotate(4deg);background:#e9f8e4}.note.three{left:70px;bottom:18px;transform:rotate(-2deg);background:#eef5ff}.final-buttons{margin-top:28px}
        @media(max-width:1050px){.forest-nav{padding:0 22px}.navlinks a:not(.ask){display:none}.hero{padding:42px 22px 40px}.hero-grid,.project-board,.warm-panel{grid-template-columns:1fr}.world{height:620px}.section,.warm{padding-left:22px;padding-right:22px}.section-title{display:block}.section .hint{margin-top:12px}.growth-strip{grid-template-columns:1fr}.journey{padding:28px}.scene{position:relative!important;left:auto!important;right:auto!important;top:auto!important;width:auto;margin:18px 0}.river{display:none}.journey{min-height:auto}.project-board{gap:20px}.mission .slots{position:relative;left:auto;right:auto;bottom:auto;margin-top:28px}.warm-panel{padding:34px}.note-stack{min-height:250px}}
        @media(max-width:620px){.brand span{font-size:16px}.brand svg{width:46px}.navlinks .ask{display:none}.test-ribbon{align-items:flex-start;justify-content:flex-start;font-size:12px}.test-ribbon span{line-height:1.45}h1{font-size:43px}.lead{font-size:17px}.world{height:560px;border-radius:38px}.stage{transform:scale(.74);transform-origin:center}.stage.seed{left:4px;top:230px}.stage.teacher{left:30%;top:88px}.stage.forest{right:4px;top:230px}.question-card{left:18px;right:18px;bottom:34px;padding:18px}.question-card h3{font-size:18px}.warm-note{display:none}.section{padding-top:58px;padding-bottom:58px}.section h2,.warm-panel h2{font-size:34px}.project-board{display:block}.mission{min-height:auto;margin-bottom:18px}.mission h3{font-size:30px}.mission .slots{grid-template-columns:1fr}.poster{padding-left:78px}.forest-nav{height:68px}.hero{min-height:auto}.scroll-cue{display:none}.tiny-story{flex-wrap:wrap}.buttons .btn,.final-buttons .btn{width:100%}}
        @media(prefers-reduced-motion:reduce){*,*:before,*:after{animation:none!important;scroll-behavior:auto!important}}
      `}</style>
    </main>
  );
}

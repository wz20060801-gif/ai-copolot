"use client";

import { FormEvent, useMemo, useState } from "react";

type View = "workbench" | "patient" | "plan" | "mobile";
type RiskFilter = "全部" | "高风险" | "待审核" | "已逾期";

type PatientRow = {
  id: number;
  name: string;
  age: number;
  code: string;
  issue: string;
  evidence: string;
  risk: "高风险" | "中风险" | "待审核" | "已逾期";
  owner: string;
  waiting: string;
};

const patients: PatientRow[] = [
  {
    id: 1,
    name: "李建国",
    age: 58,
    code: "P-240071",
    issue: "家庭测量连续异常，伴近期头晕自述",
    evidence: "3条指标 · 1项症状 · 计划执行率67%",
    risk: "高风险",
    owner: "王医生",
    waiting: "等待 12 分钟",
  },
  {
    id: 2,
    name: "陈芳",
    age: 64,
    code: "P-240103",
    issue: "新增药物后等待复核不适反应",
    evidence: "2项患者反馈 · 用药第4天",
    risk: "待审核",
    owner: "赵医生",
    waiting: "等待 28 分钟",
  },
  {
    id: 3,
    name: "周明",
    age: 51,
    code: "P-240129",
    issue: "连续5天未完成家庭测量任务",
    evidence: "5项任务逾期 · 2次提醒未响应",
    risk: "已逾期",
    owner: "刘护士",
    waiting: "等待 46 分钟",
  },
  {
    id: 4,
    name: "王秀兰",
    age: 69,
    code: "P-240188",
    issue: "复诊前资料存在药物记录冲突",
    evidence: "患者自述与上次处方不一致",
    risk: "中风险",
    owner: "王医生",
    waiting: "今日 10:40",
  },
];

const taskDefinitions = [
  { id: "bp", title: "测量并上传血压", time: "07:00–09:00", meta: "坐位静息后测量，记录两次结果", action: "录入血压" },
  { id: "med-am", title: "早间用药打卡", time: "08:00", meta: "按医生已确认的用药计划执行", action: "完成打卡" },
  { id: "symptom", title: "填写今日症状反馈", time: "20:00前", meta: "约需1分钟，帮助医生了解变化", action: "开始填写" },
];

function Mark({ children, tone = "brand" }: { children: React.ReactNode; tone?: "brand" | "danger" | "warning" | "positive" | "neutral" }) {
  return <span className={`mark mark-${tone}`}>{children}</span>;
}

function MiniIcon({ children, tone = "soft" }: { children: React.ReactNode; tone?: "soft" | "brand" | "danger" | "positive" }) {
  return <span className={`mini-icon mini-icon-${tone}`} aria-hidden="true">{children}</span>;
}

function SideNav({ view, setView }: { view: View; setView: (view: View) => void }) {
  const items: { id: View; label: string; icon: string }[] = [
    { id: "workbench", label: "工作台", icon: "⌂" },
    { id: "patient", label: "患者档案", icon: "◎" },
    { id: "plan", label: "照护计划", icon: "◇" },
    { id: "mobile", label: "患者端", icon: "▣" },
  ];

  return (
    <aside className="sidebar">
      <button className="brand-lockup" onClick={() => setView("workbench")} aria-label="返回工作台">
        <span className="brand-symbol"><span /></span>
        <span><strong>CareLoop</strong><small>医生 AI Copilot</small></span>
      </button>

      <nav className="primary-nav" aria-label="主导航">
        <p className="nav-eyebrow">临床工作区</p>
        {items.map((item) => (
          <button key={item.id} className={view === item.id ? "nav-item active" : "nav-item"} onClick={() => setView(item.id)}>
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
            {item.id === "workbench" && <b>6</b>}
          </button>
        ))}
      </nav>

      <div className="sidebar-note">
        <div className="status-dot" />
        <div><strong>安全模式运行中</strong><span>所有AI内容需人工审核</span></div>
      </div>

      <div className="profile-chip">
        <span className="avatar">王</span>
        <span><strong>王医生</strong><small>心血管内科</small></span>
        <span className="more">•••</span>
      </div>
    </aside>
  );
}

function AppHeader({ title, subtitle, onPatientMode }: { title: string; subtitle: string; onPatientMode: () => void }) {
  return (
    <header className="app-header">
      <div><p>{subtitle}</p><h1>{title}</h1></div>
      <div className="header-actions">
        <span className="demo-pill">演示数据</span>
        <button className="icon-button" aria-label="通知">○<i>3</i></button>
        <button className="secondary-button" onClick={onPatientMode}>预览患者端 <span>↗</span></button>
      </div>
    </header>
  );
}

function StatCard({ label, value, delta, icon, tone }: { label: string; value: string; delta: string; icon: string; tone: "danger" | "warning" | "brand" | "positive" }) {
  return (
    <article className="stat-card">
      <div className="stat-top"><span>{label}</span><MiniIcon tone={tone === "warning" ? "soft" : tone}>{icon}</MiniIcon></div>
      <strong>{value}</strong>
      <p>{delta}</p>
    </article>
  );
}

function Workbench({ setView }: { setView: (view: View) => void }) {
  const [filter, setFilter] = useState<RiskFilter>("全部");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim();
    return patients.filter((patient) => {
      const matchesFilter = filter === "全部" || patient.risk === filter;
      const matchesSearch = !q || `${patient.name}${patient.code}${patient.issue}`.includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [filter, search]);

  return (
    <>
      <AppHeader title="早上好，王医生" subtitle="2026年7月17日 · 星期五" onPatientMode={() => setView("mobile")} />
      <div className="page-body">
        <section className="hero-strip">
          <div>
            <Mark tone="brand">AI 晨间简报</Mark>
            <h2>今天有 3 位患者需要优先关注</h2>
            <p>系统已整理昨晚至今的新增信息。所有风险提示均保留触发证据，需由您或护理团队确认。</p>
          </div>
          <button className="text-button" onClick={() => setFilter("高风险")}>查看高风险队列 <span>→</span></button>
        </section>

        <section className="stat-grid" aria-label="今日工作概览">
          <StatCard label="高风险待确认" value="3" delta="较昨日增加 1 项" icon="!" tone="danger" />
          <StatCard label="AI草稿待审核" value="8" delta="预计节省 42 分钟" icon="✦" tone="brand" />
          <StatCard label="逾期随访任务" value="5" delta="其中 2 人多次未响应" icon="↻" tone="warning" />
          <StatCard label="本周闭环率" value="92%" delta="目标 90% · 已达标" icon="✓" tone="positive" />
        </section>

        <section className="dashboard-grid">
          <div className="panel risk-panel">
            <div className="panel-head">
              <div><h2>需要处理</h2><p>按临床风险与等待时间排序</p></div>
              <div className="search-box"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索患者" aria-label="搜索患者" /></div>
            </div>
            <div className="filter-row" role="tablist" aria-label="风险筛选">
              {(["全部", "高风险", "待审核", "已逾期"] as RiskFilter[]).map((item) => (
                <button key={item} className={filter === item ? "filter active" : "filter"} onClick={() => setFilter(item)}>{item}</button>
              ))}
            </div>
            <div className="patient-list">
              {filtered.map((patient) => (
                <button className="patient-row" key={patient.id} onClick={() => setView("patient")}>
                  <span className="patient-avatar">{patient.name.slice(0, 1)}</span>
                  <span className="patient-main"><span className="patient-title"><strong>{patient.name}</strong><small>{patient.age}岁 · {patient.code}</small></span><b>{patient.issue}</b><small>{patient.evidence}</small></span>
                  <span className="patient-status"><Mark tone={patient.risk === "高风险" ? "danger" : patient.risk === "已逾期" ? "warning" : patient.risk === "中风险" ? "neutral" : "brand"}>{patient.risk}</Mark><small>{patient.owner}</small><em>{patient.waiting}</em></span>
                  <span className="row-arrow">›</span>
                </button>
              ))}
              {filtered.length === 0 && <div className="empty-state">没有匹配的患者事件</div>}
            </div>
            <button className="panel-footer">查看全部 18 项待办 <span>→</span></button>
          </div>

          <aside className="right-stack">
            <section className="panel schedule-card">
              <div className="panel-head compact"><div><h2>今日接诊</h2><p>6位患者 · 2位线上复诊</p></div><button className="plain-icon">•••</button></div>
              <div className="schedule-list">
                <div><time>09:30</time><span className="schedule-line brand" /><p><strong>陈芳</strong><small>线上复诊 · 待审核摘要</small></p><Mark tone="brand">即将开始</Mark></div>
                <div><time>10:40</time><span className="schedule-line" /><p><strong>王秀兰</strong><small>门诊复诊 · 资料待核实</small></p></div>
                <div><time>11:20</time><span className="schedule-line" /><p><strong>赵海</strong><small>线上复诊 · 资料已完成</small></p></div>
              </div>
            </section>
            <section className="panel ai-card">
              <div className="ai-orb">✦</div>
              <p className="eyebrow">COPILOT 建议</p>
              <h3>李建国的风险事件已持续12分钟</h3>
              <p>护士完成初步复核，建议您优先查看指标趋势和症状变化。</p>
              <button className="primary-button full" onClick={() => setView("patient")}>打开患者档案</button>
              <small>建议仅供医生审核，不替代临床判断</small>
            </section>
          </aside>
        </section>
      </div>
    </>
  );
}

const bpSeries = [
  { day: "7/11", sys: 139, dia: 86 },
  { day: "7/12", sys: 142, dia: 88 },
  { day: "7/13", sys: 138, dia: 85 },
  { day: "7/14", sys: 146, dia: 91 },
  { day: "7/15", sys: 149, dia: 94 },
  { day: "7/16", sys: 151, dia: 95 },
  { day: "今天", sys: 153, dia: 96 },
];

function PressureChart() {
  const x = (index: number) => 36 + index * 78;
  const y = (value: number) => 154 - (value - 70) * 1.25;
  const sysPoints = bpSeries.map((d, i) => `${x(i)},${y(d.sys)}`).join(" ");
  const diaPoints = bpSeries.map((d, i) => `${x(i)},${y(d.dia)}`).join(" ");

  return (
    <div className="chart-wrap">
      <svg viewBox="0 0 540 190" role="img" aria-label="过去七天家庭血压趋势，收缩压和舒张压近期呈上升趋势">
        {[50, 90, 130, 170].map((gy) => <line key={gy} x1="26" x2="514" y1={gy} y2={gy} className="chart-grid" />)}
        <polyline points={sysPoints} className="chart-line chart-sys" />
        <polyline points={diaPoints} className="chart-line chart-dia" />
        {bpSeries.map((d, i) => <g key={d.day}><circle cx={x(i)} cy={y(d.sys)} r="4" className="dot-sys" /><circle cx={x(i)} cy={y(d.dia)} r="4" className="dot-dia" /><text x={x(i)} y="182" textAnchor="middle">{d.day}</text></g>)}
      </svg>
      <div className="chart-legend"><span><i className="legend-sys" />收缩压</span><span><i className="legend-dia" />舒张压</span><small>家庭设备 · 演示数据</small></div>
    </div>
  );
}

function PatientProfile({ setView, showSource }: { setView: (view: View) => void; showSource: () => void }) {
  return (
    <>
      <AppHeader title="患者纵向档案" subtitle="患者管理 / P-240071" onPatientMode={() => setView("mobile")} />
      <div className="page-body patient-page">
        <section className="patient-hero panel">
          <div className="patient-identity">
            <span className="large-avatar">李</span>
            <div><div className="name-line"><h2>李建国</h2><Mark tone="danger">高风险待确认</Mark></div><p>男 · 58岁 · P-240071 · 已确诊高血压</p><span>责任医生：王医生　　随访护士：刘护士</span></div>
          </div>
          <div className="hero-facts"><div><small>最近一次复诊</small><strong>2026/06/20</strong></div><div><small>计划执行率</small><strong>67%</strong></div><div><small>当前未完成</small><strong>3项任务</strong></div></div>
          <div className="hero-actions"><button className="secondary-button">联系患者</button><button className="primary-button" onClick={() => setView("plan")}>调整照护计划</button></div>
        </section>

        <div className="detail-tabs"><button className="active">总览</button><button>诊疗记录</button><button>检验与指标</button><button onClick={() => setView("plan")}>照护计划</button><button>风险事件</button></div>

        <section className="patient-grid">
          <div className="main-column">
            <article className="panel summary-card">
              <div className="panel-head"><div><span className="ai-title"><MiniIcon tone="brand">✦</MiniIcon><h2>AI诊前摘要</h2><Mark tone="brand">待医生审核</Mark></span><p>基于本次问卷及授权范围内的历史资料整理</p></div><button className="source-button" onClick={showSource}>查看 8 条来源</button></div>
              <div className="summary-callout"><strong>本次主要变化</strong><p>患者近3日家庭测量值呈上升趋势，并报告偶发头晕；自述按计划服药，但近7日任务执行率为67%。</p></div>
              <div className="summary-grid">
                <div><h3>近期症状</h3><p><span className="fact-dot patient" />患者自述近两日晨起偶发头晕，每次约数分钟</p><p><span className="fact-dot neutral" />否认本次问卷列出的其他危险症状</p></div>
                <div><h3>用药与依从性</h3><p><span className="fact-dot doctor" />当前用药来自上次医生确认计划</p><p><span className="fact-dot warning" />有2次用药打卡缺失，真实执行情况待核实</p></div>
                <div><h3>需要医生确认</h3><p><span className="fact-dot danger" />头晕与指标变化是否需要进一步评估</p><p><span className="fact-dot warning" />患者自述用药名称与历史记录存在一处差异</p></div>
                <div><h3>尚未完成</h3><p><span className="fact-dot neutral" />本周家庭测量任务完成 4/7 次</p><p><span className="fact-dot neutral" />下次复诊预约尚未确认</p></div>
              </div>
              <div className="summary-foot"><span>AI生成于 08:42 · 模型与知识库版本已记录</span><span><i className="fact-dot patient" />患者自述 <i className="fact-dot doctor" />医生确认 <i className="fact-dot warning" />待核实</span></div>
            </article>

            <article className="panel trend-card">
              <div className="panel-head"><div><h2>家庭血压趋势</h2><p>过去7天 · 最近同步于今天 08:16</p></div><div className="trend-value"><strong>153/96</strong><span>mmHg</span><Mark tone="danger">触发测试规则</Mark></div></div>
              <PressureChart />
            </article>
          </div>

          <aside className="side-column">
            <article className="panel alert-detail">
              <div className="alert-heading"><MiniIcon tone="danger">!</MiniIcon><div><Mark tone="danger">高风险 · 待医生确认</Mark><h3>家庭测量连续异常</h3></div></div>
              <p>规则引擎于08:18触发，护士已完成数据真实性初步复核。</p>
              <dl><div><dt>触发依据</dt><dd>连续测量趋势 + 症状反馈</dd></div><div><dt>主责任人</dt><dd>王医生</dd></div><div><dt>已等待</dt><dd className="danger-text">12分钟</dd></div></dl>
              <button className="primary-button full" onClick={() => setView("plan")}>进入处置与计划调整</button>
              <button className="text-button full-link" onClick={showSource}>查看触发证据</button>
            </article>

            <article className="panel info-card">
              <div className="panel-head compact"><div><h2>当前用药</h2><p>来自医生确认计划</p></div><button className="text-button">查看详情</button></div>
              <div className="med-row"><span className="med-icon">Rx</span><div><strong>药物A</strong><p>每日一次 · 早间</p></div><Mark tone="positive">执行中</Mark></div>
              <div className="med-row"><span className="med-icon">Rx</span><div><strong>药物B</strong><p>每日一次 · 晚间</p></div><Mark tone="warning">待核实</Mark></div>
            </article>

            <article className="panel info-card task-mini">
              <div className="panel-head compact"><div><h2>近期任务</h2><p>过去7天</p></div><strong className="task-score">67%</strong></div>
              <div className="mini-progress"><span style={{ width: "67%" }} /></div>
              <p><span>已完成</span><b>8</b></p><p><span>逾期</span><b className="danger-text">3</b></p><p><span>需要帮助</span><b>1</b></p>
            </article>
          </aside>
        </section>
      </div>
    </>
  );
}

function CarePlan({ setView, published, onPublish }: { setView: (view: View) => void; published: boolean; onPublish: () => void }) {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({ bp: true, medication: true, symptoms: true, review: true });
  const toggle = (id: string) => setEnabled((current) => ({ ...current, [id]: !current[id] }));

  return (
    <>
      <AppHeader title="照护计划审核" subtitle="李建国 / 计划版本 V3 草稿" onPatientMode={() => setView("mobile")} />
      <div className="page-body plan-page">
        {published && <div className="success-banner"><span>✓</span><div><strong>照护计划已发布</strong><p>患者端已更新，后续任务和变更记录均已生成。</p></div><button onClick={() => setView("mobile")}>查看患者端 →</button></div>}
        <section className="plan-top panel">
          <div className="plan-person"><span className="patient-avatar">李</span><div><strong>李建国 · 58岁</strong><p>P-240071 · 高血压连续照护</p></div></div>
          <div className="plan-meta"><span><small>计划周期</small><b>2026/07/17—08/14</b></span><span><small>责任医生</small><b>王医生</b></span><span><small>草稿来源</small><b>AI基于模板生成</b></span></div>
          <Mark tone={published ? "positive" : "brand"}>{published ? "已发布" : "待医生审核"}</Mark>
        </section>

        <section className="plan-layout">
          <aside className="panel plan-steps">
            <p className="nav-eyebrow">审核步骤</p>
            <button className="active"><span>1</span><div><strong>确认照护目标</strong><small>1项建议</small></div><b>✓</b></button>
            <button><span>2</span><div><strong>配置患者任务</strong><small>4项任务</small></div><b>›</b></button>
            <button><span>3</span><div><strong>风险与升级规则</strong><small>2条规则</small></div><b>›</b></button>
            <button><span>4</span><div><strong>患者友好说明</strong><small>AI草稿</small></div><b>›</b></button>
            <div className="review-note"><MiniIcon tone="brand">✦</MiniIcon><p><strong>AI已完成一致性检查</strong><span>仍有1项信息需要医生确认，不影响保存草稿。</span></p></div>
          </aside>

          <main className="panel plan-editor">
            <div className="editor-head"><div><p className="eyebrow">步骤 2 / 4</p><h2>配置患者任务</h2><p>每项正式任务均包含责任人、频率、期限与完成证据。</p></div><button className="secondary-button">+ 添加任务</button></div>

            <div className="goal-card"><div><MiniIcon tone="brand">◎</MiniIcon><p><small>本阶段照护目标</small><strong>改善家庭监测连续性，完成症状与用药情况核实</strong></p></div><button className="text-button">编辑</button></div>

            <div className="editor-section-head"><div><h3>患者任务</h3><p>启用的任务会在患者端按时间显示</p></div><span>{Object.values(enabled).filter(Boolean).length}/4 已启用</span></div>

            <div className="plan-task-list">
              <PlanTask id="bp" enabled={enabled.bp} toggle={toggle} icon="⌁" title="家庭血压测量" tag="监测" description="每日早晚各1次，每次记录两次测量值" schedule="每日 · 07:00与20:00" evidence="患者录入数值与测量时间" />
              <PlanTask id="medication" enabled={enabled.medication} toggle={toggle} icon="Rx" title="用药执行记录" tag="用药" description="按医生确认的正式用药计划完成打卡" schedule="每日 · 随用药计划" evidence="打卡或填写无法完成原因" />
              <PlanTask id="symptoms" enabled={enabled.symptoms} toggle={toggle} icon="◇" title="症状反馈" tag="问卷" description="记录头晕及其他经临床审核的症状变化" schedule="每日 · 20:00前" evidence="完成1分钟结构化问卷" />
              <PlanTask id="review" enabled={enabled.review} toggle={toggle} icon="□" title="线上复诊确认" tag="复诊" description="在计划结束前完成医生复核" schedule="2026/08/14前" evidence="复诊状态及医生记录" />
            </div>

            <div className="safety-check"><span>!</span><p><strong>需要医生确认</strong><small>患者自述的“药物B”与历史计划名称存在差异。发布前请核对正式用药信息。</small></p><button>立即核对</button></div>

            <div className="editor-actions"><button className="text-button" onClick={() => setView("patient")}>← 返回患者档案</button><div><button className="secondary-button">保存草稿</button><button className="primary-button" onClick={onPublish} disabled={published}>{published ? "计划已发布" : "确认并发布计划"}</button></div></div>
          </main>

          <aside className="panel plan-preview">
            <div className="panel-head compact"><div><p className="eyebrow">患者端预览</p><h2>你的照护计划</h2></div><button className="plain-icon">↗</button></div>
            <div className="preview-progress"><div><span style={{ width: "42%" }} /></div><p><strong>第 1 天</strong><span>共 28 天</span></p></div>
            <p className="preview-intro">李先生，这是王医生为你确认的本阶段计划。如有不适，请通过“需要帮助”联系医护团队。</p>
            <div className="preview-tasks">
              {Object.entries(enabled).filter(([, value]) => value).map(([id], index) => <div key={id}><span>{index + 1}</span><p><strong>{id === "bp" ? "按时测量血压" : id === "medication" ? "按计划记录用药" : id === "symptoms" ? "反馈症状变化" : "完成线上复诊"}</strong><small>{id === "review" ? "8月14日前" : "每天完成"}</small></p></div>)}
            </div>
            <div className="preview-warning"><span>盾</span><p><strong>医生审核后才会生效</strong><small>AI不会自行修改你的诊疗计划</small></p></div>
          </aside>
        </section>
      </div>
    </>
  );
}

function PlanTask({ id, enabled, toggle, icon, title, tag, description, schedule, evidence }: { id: string; enabled: boolean; toggle: (id: string) => void; icon: string; title: string; tag: string; description: string; schedule: string; evidence: string }) {
  return (
    <article className={enabled ? "plan-task enabled" : "plan-task"}>
      <MiniIcon tone={enabled ? "brand" : "soft"}>{icon}</MiniIcon>
      <div className="plan-task-main"><div><h4>{title}</h4><Mark tone="neutral">{tag}</Mark></div><p>{description}</p><small><span>◷ {schedule}</span><span>✓ {evidence}</span></small></div>
      <button className={enabled ? "switch on" : "switch"} onClick={() => toggle(id)} role="switch" aria-checked={enabled} aria-label={`${enabled ? "停用" : "启用"}${title}`}><span /></button>
      <button className="plain-icon" aria-label={`编辑${title}`}>•••</button>
    </article>
  );
}

function PatientMobile({ setView, published }: { setView: (view: View) => void; published: boolean }) {
  const [completed, setCompleted] = useState<Set<string>>(new Set(["med-am"]));
  const [bpOpen, setBpOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const doneCount = completed.size;
  const progress = Math.round((doneCount / taskDefinitions.length) * 100);

  const complete = (id: string) => {
    if (id === "bp") return setBpOpen(true);
    if (id === "symptom") return setFeedbackOpen(true);
    setCompleted((current) => new Set([...current, id]));
  };

  const submitPressure = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCompleted((current) => new Set([...current, "bp"]));
    setSubmitted(true);
    setBpOpen(false);
  };

  return (
    <div className="mobile-stage">
      <div className="stage-toolbar"><div><p className="eyebrow">患者端交互原型</p><strong>模拟李建国完成今日任务</strong></div><button className="secondary-button" onClick={() => setView("workbench")}>返回医生端</button></div>
      <div className="phone-shell">
        <div className="phone-status"><span>9:41</span><span>● ◔ ▰</span></div>
        <div className="mobile-app">
          <header className="mobile-header"><div><p>早上好，李先生</p><h1>今天需要完成 {taskDefinitions.length - doneCount} 项任务</h1></div><button aria-label="消息">○<i>2</i></button></header>

          {published && <div className="mobile-new-plan"><span>✓</span><p><strong>王医生已更新照护计划</strong><small>任务与复诊安排已同步</small></p></div>}
          {submitted && <div className="mobile-alert-note"><span>!</span><p><strong>数据已上传并进入医护工作队列</strong><small>这是一条演示反馈，不用于真实诊疗</small></p></div>}

          <section className="mobile-progress-card">
            <div className="progress-ring" style={{ background: `conic-gradient(#0d6b68 ${progress}%, #dce9e7 ${progress}% 100%)` }}><span>{progress}%</span></div>
            <div><small>今日完成度</small><strong>{doneCount}/{taskDefinitions.length} 项已完成</strong><p>继续保持，每一条记录都会帮助医生了解你的变化。</p></div>
          </section>

          <section className="mobile-section">
            <div className="mobile-section-head"><div><p className="eyebrow">TODAY</p><h2>今日任务</h2></div><button>查看计划</button></div>
            <div className="mobile-task-list">
              {taskDefinitions.map((task) => {
                const isDone = completed.has(task.id);
                return <article className={isDone ? "mobile-task done" : "mobile-task"} key={task.id}><button className="check-button" onClick={() => complete(task.id)} aria-label={isDone ? `${task.title}已完成` : `完成${task.title}`}>{isDone ? "✓" : ""}</button><div><span>{task.time}</span><h3>{task.title}</h3><p>{task.meta}</p>{!isDone && <button className="mobile-action" onClick={() => complete(task.id)}>{task.action} →</button>}{isDone && <small className="done-label">已完成并同步给医护团队</small>}</div></article>;
              })}
            </div>
          </section>

          <section className="mobile-vitals">
            <div><span>最近一次家庭血压</span><strong>153<small>/96 mmHg</small></strong><p>今天 08:16 · 家庭设备</p></div><div className="spark"><i /><i /><i /><i /><i /><i /><i /></div>
          </section>

          <button className="help-card" onClick={() => setHelpOpen(true)}><MiniIcon tone="brand">+</MiniIcon><span><strong>感觉不舒服或无法完成任务？</strong><small>联系医护团队，我们会按风险进行处理</small></span><b>›</b></button>

          <nav className="mobile-nav"><button className="active"><span>⌂</span>首页</button><button><span>✓</span>任务</button><button><span>⌁</span>趋势</button><button><span>◎</span>我的</button></nav>
        </div>
      </div>

      {bpOpen && <div className="modal-backdrop" role="presentation"><form className="modal-card pressure-modal" onSubmit={submitPressure}><div className="modal-head"><div><p className="eyebrow">家庭测量</p><h2>录入本次血压</h2></div><button type="button" onClick={() => setBpOpen(false)}>×</button></div><p className="modal-intro">请按设备显示结果如实填写。系统会同时记录本次测量时间。</p><div className="pressure-fields"><label><span>收缩压</span><div><input type="number" defaultValue="153" required min="1" /><b>mmHg</b></div></label><span>/</span><label><span>舒张压</span><div><input type="number" defaultValue="96" required min="1" /><b>mmHg</b></div></label></div><label className="checkbox-row"><input type="checkbox" required />我确认以上数据来自本次实际测量</label><button className="primary-button full" type="submit">确认并上传</button><small>系统不会仅凭单次录入自动调整治疗方案</small></form></div>}
      {feedbackOpen && <div className="modal-backdrop" role="presentation"><div className="modal-card"><div className="modal-head"><div><p className="eyebrow">今日反馈</p><h2>今天是否出现不舒服？</h2></div><button onClick={() => setFeedbackOpen(false)}>×</button></div><div className="feedback-options"><button onClick={() => { setCompleted((current) => new Set([...current, "symptom"])); setFeedbackOpen(false); }}>今天没有明显不适 <span>→</span></button><button onClick={() => setHelpOpen(true)}>有不舒服，需要进一步说明 <span>→</span></button></div><small>如情况紧急，请立即寻求线下急救服务</small></div></div>}
      {helpOpen && <div className="modal-backdrop" role="presentation"><div className="modal-card"><div className="modal-head"><div><p className="eyebrow">需要帮助</p><h2>选择最符合的情况</h2></div><button onClick={() => setHelpOpen(false)}>×</button></div><div className="help-options"><button><span className="help-icon danger">!</span><p><strong>出现明显或紧急不适</strong><small>查看急诊提示并联系人工</small></p><b>›</b></button><button><span className="help-icon">?</span><p><strong>对医嘱或用药有疑问</strong><small>提交给医护团队后回复</small></p><b>›</b></button><button><span className="help-icon neutral">×</span><p><strong>暂时无法完成任务</strong><small>说明原因并进入随访队列</small></p><b>›</b></button></div><small>AI不会替代医生处理高风险医疗问题</small></div></div>}
    </div>
  );
}

function SourceModal({ close }: { close: () => void }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal-card source-modal" role="dialog" aria-modal="true" aria-labelledby="source-title">
        <div className="modal-head"><div><p className="eyebrow">证据追溯</p><h2 id="source-title">AI摘要引用来源</h2></div><button onClick={close} aria-label="关闭">×</button></div>
        <p className="modal-intro">摘要中的关键陈述与原始资料逐条关联。以下均为本原型使用的虚构演示数据。</p>
        <div className="source-list">
          <div><span className="source-index">01</span><p><Mark tone="neutral">患者自述</Mark><strong>“近两日晨起偶尔头晕，每次几分钟。”</strong><small>诊前问卷 · 今天 08:03</small></p><button>查看原文</button></div>
          <div><span className="source-index">02</span><p><Mark tone="brand">观测数据</Mark><strong>过去3日共上传6条家庭测量记录</strong><small>家庭设备 · 7月15日至17日</small></p><button>查看趋势</button></div>
          <div><span className="source-index">03</span><p><Mark tone="positive">医生确认</Mark><strong>当前正式用药计划 V2</strong><small>王医生 · 2026年6月20日</small></p><button>查看计划</button></div>
          <div><span className="source-index">04</span><p><Mark tone="warning">信息冲突</Mark><strong>本次自述药物名称与历史计划存在差异</strong><small>系统一致性检查 · 今天 08:42</small></p><button>查看对比</button></div>
        </div>
        <div className="source-footer"><span>AI仅负责整理；正式结论由医生确认</span><button className="primary-button" onClick={close}>我已了解</button></div>
      </div>
    </div>
  );
}

export default function Home() {
  const [view, setView] = useState<View>("workbench");
  const [sourceOpen, setSourceOpen] = useState(false);
  const [published, setPublished] = useState(false);

  return (
    <main className="app-shell">
      {view !== "mobile" && <SideNav view={view} setView={setView} />}
      <section className={view === "mobile" ? "app-content mobile-content" : "app-content"}>
        {view === "workbench" && <Workbench setView={setView} />}
        {view === "patient" && <PatientProfile setView={setView} showSource={() => setSourceOpen(true)} />}
        {view === "plan" && <CarePlan setView={setView} published={published} onPublish={() => setPublished(true)} />}
        {view === "mobile" && <PatientMobile setView={setView} published={published} />}
      </section>
      {sourceOpen && <SourceModal close={() => setSourceOpen(false)} />}
    </main>
  );
}

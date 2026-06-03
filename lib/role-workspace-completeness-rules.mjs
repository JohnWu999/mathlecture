export function getLearnerPersonalCenterSections() {
  return [
    {
      key: 'passportHeader',
      label: '成长护照头部',
      helper: '展示孩子姓名、年级、地区、一句话数学介绍和基础参与状态。',
    },
    {
      key: 'growthEnergy',
      label: '我的数学成长能量',
      helper: '私密展示成长能量来源、用途和最近记录；不公开排名，不说明谁更聪明。',
    },
    {
      key: 'identityTrees',
      label: '三棵成长小树',
      helper: '提问者 / 小讲师 / 探索家 1-3 星，来自有效行为和老师审核。',
    },
    {
      key: 'abilityBadges',
      label: '能力徽章',
      helper: '由老师观察标签慢慢点亮，不靠刷成长能量。',
    },
    {
      key: 'myQuestions',
      label: '我的提问数据库',
      helper: '孩子自己提出的问题、审核状态、是否被讲解。',
    },
    {
      key: 'myLectures',
      label: '我的小讲师视频',
      helper: '孩子提交的讲题视频、审核状态和关联题目。',
    },
    {
      key: 'myProjects',
      label: '我的项目与作品',
      helper: '报名项目、小组任务、项目作品和成果状态。',
    },
    {
      key: 'myProjectAccess',
      label: '我的项目权限',
      helper: '展示管理员开通的基础体验、5次项目包、20周项目包或指定项目权益。',
    },
  ];
}

export function getTeacherWorkspaceSections() {
  return [
    { key: 'dashboard', label: '数据看板', helper: '查看教学审核和学生参与概览。' },
    { key: 'questionReview', label: '提问审核数据库', helper: '审核孩子提交的问题，保护表达并确认数学边界。' },
    { key: 'lectureReview', label: '小讲师视频审核数据库', helper: '审核讲题视频、记录能力观察标签和数学小贴士。' },
    { key: 'outcomeReview', label: '成果审核与授权管理', helper: '审核公开成果、撤回授权，保留学习记录。' },
    { key: 'projectFollowUp', label: '项目跟进', helper: '查看负责项目、小组、过程记录和作品提交。' },
    { key: 'studentStatus', label: '学生状态', helper: '只处理基础参与状态；商业权益由管理员后台处理。' },
  ];
}

export function getAdminDataWorkbenchSections() {
  return [
    { key: 'overview', label: '运营总览', helper: '用户、问题、视频、项目、权益与审核数据概览。', adminOnly: true },
    { key: 'users', label: '用户与老师数据库', helper: '学习者、老师、管理员账号及基础参与状态。', adminOnly: true },
    { key: 'projectAccess', label: '项目权限与项目包', helper: '基础体验、5次项目包、20周项目包、指定项目和暂停记录。', adminOnly: true },
    { key: 'projectDatabase', label: '项目管理数据库', helper: '项目标题、类型、状态、知识标签、有效期、价格、项目小组。', adminOnly: true },
    { key: 'questionDatabase', label: '提问者问题数据库', helper: '题目照片/文本、知识点、困惑类型、审核状态、热度和认领状态。', adminOnly: true },
    { key: 'lectureVideoDatabase', label: '小讲师视频数据库', helper: '讲题视频、关联问题、讲师、审核状态、分享授权。', adminOnly: true },
    { key: 'projectArtifactDatabase', label: '项目作品数据库', helper: '项目作品、协作小组、审核状态、公开授权和撤回记录。', adminOnly: true },
    { key: 'paymentRecords', label: '付款/退费/延期/转期记录', helper: '管理员手工登记服务权益相关财务与运营动作。', adminOnly: true },
    { key: 'exportAuditLogs', label: '导出与审计日志', helper: '记录后台导出、下载、开通权益等敏感操作。', adminOnly: true },
  ];
}

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildAccessOpenAuditPayload,
  buildAccessTodoFromRegistration,
  buildConfirmedRegistrationAccessInput,
  getAccessStatusAfterRegistrationFollowUp,
  getLearnerProjectAccessCopy,
  normalizeAccessOpenRequest,
  shouldOpenAccessForRegistration,
} from '../lib/project-access-linkage-rules.mjs';

test('confirmed registration recommends opening a specific project access', () => {
  const registration = {
    id: 'reg_1',
    status: 'CONFIRMED',
    followUpStatus: 'CONFIRMED',
    packageName: '五次项目体验包',
    user: { id: 'user_1', name: '小树' },
    project: { id: 'project_1', title: '折纸里的几何' },
  };

  assert.equal(shouldOpenAccessForRegistration(registration), true);
  const input = buildConfirmedRegistrationAccessInput(registration, { operatorId: 'admin_1' });

  assert.equal(input.userId, 'user_1');
  assert.equal(input.projectId, 'project_1');
  assert.equal(input.openedById, 'admin_1');
  assert.equal(input.packageType, 'SPECIFIC_PROJECT');
  assert.equal(input.status, 'ACTIVE');
  assert.match(input.note, /报名已确认/);
  assert.match(input.note, /折纸里的几何/);
});

test('non-confirmed registration must not open project access', () => {
  assert.equal(shouldOpenAccessForRegistration({ status: 'PENDING', followUpStatus: 'CONTACTED' }), false);
  assert.equal(getAccessStatusAfterRegistrationFollowUp('CONFIRMED'), 'READY_TO_OPEN_ACCESS');
  assert.equal(getAccessStatusAfterRegistrationFollowUp('CONTACTED'), 'NOT_READY');
  assert.throws(() => buildConfirmedRegistrationAccessInput({ id: 'reg_2', status: 'PENDING', followUpStatus: 'PENDING' }, { operatorId: 'admin_1' }), /报名尚未确认/);
});

test('access open request is admin-operation input and prevents missing learner or project', () => {
  const normalized = normalizeAccessOpenRequest({
    userId: ' user_1 ',
    projectId: ' project_1 ',
    packageType: 'SPECIFIC_PROJECT',
    note: '  确认后开通  ',
  });

  assert.deepEqual(normalized, {
    userId: 'user_1',
    projectId: 'project_1',
    packageType: 'SPECIFIC_PROJECT',
    note: '确认后开通',
  });

  assert.throws(() => normalizeAccessOpenRequest({ packageType: 'SPECIFIC_PROJECT', projectId: 'p' }), /缺少学习者/);
  assert.throws(() => normalizeAccessOpenRequest({ userId: 'u', packageType: 'SPECIFIC_PROJECT' }), /指定项目权益必须选择项目/);
  assert.throws(() => normalizeAccessOpenRequest({ userId: 'u', packageType: 'UNKNOWN' }), /未知项目权益类型/);
});

test('confirmed registration todo highlights access not opened without payment-first language', () => {
  const todo = buildAccessTodoFromRegistration({
    id: 'reg_1',
    status: 'CONFIRMED',
    followUpStatus: 'CONFIRMED',
    user: { id: 'user_1', name: '小树' },
    project: { id: 'project_1', title: '折纸里的几何' },
    projectAccesses: [],
  });

  assert.equal(todo.needsAccessOpen, true);
  assert.match(todo.label, /已确认/);
  assert.match(todo.nextAction, /开通项目权益/);
  assert.doesNotMatch(`${todo.label}${todo.nextAction}`, /立即付款|扫码付款|自动成交/);
});

test('existing active project access prevents duplicate opening', () => {
  const todo = buildAccessTodoFromRegistration({
    id: 'reg_1',
    status: 'CONFIRMED',
    followUpStatus: 'CONFIRMED',
    user: { id: 'user_1', name: '小树' },
    project: { id: 'project_1', title: '折纸里的几何' },
    projectAccesses: [{ id: 'access_1', status: 'ACTIVE', projectId: 'project_1' }],
  });

  assert.equal(todo.needsAccessOpen, false);
  assert.match(todo.label, /权益已开通/);
});

test('learner project access copy is read-only and project-entry oriented', () => {
  const copy = getLearnerProjectAccessCopy({ packageType: 'SPECIFIC_PROJECT', status: 'ACTIVE', projectTitle: '折纸里的几何' });
  assert.match(copy.title, /折纸里的几何/);
  assert.match(copy.statusLabel, /已开通/);
  assert.match(copy.helper, /可以进入项目/);
  assert.doesNotMatch(`${copy.title}${copy.statusLabel}${copy.helper}`, /购买|付款|排行榜|超过/);
});

test('audit payload records registration to access linkage without exposing private contact', () => {
  const payload = buildAccessOpenAuditPayload({ registrationId: 'reg_1', accessId: 'access_1', userId: 'user_1', projectId: 'project_1', packageType: 'SPECIFIC_PROJECT', contact: 'secret-phone' });
  assert.deepEqual(payload, {
    registrationId: 'reg_1',
    accessId: 'access_1',
    userId: 'user_1',
    projectId: 'project_1',
    packageType: 'SPECIFIC_PROJECT',
  });
  assert.equal('contact' in payload, false);
});

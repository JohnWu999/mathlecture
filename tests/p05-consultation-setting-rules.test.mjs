import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeConsultationSettingInput,
  chooseEffectiveConsultationSetting,
  buildConsultationDisplay,
} from '../lib/consultation-setting-rules.mjs';

test('consultation setting requires a real uploaded qr image url under basePath uploads', () => {
  const setting = normalizeConsultationSettingInput({
    qrImageUrl: '/math-young-lecturer/uploads/consultation-qr/qr.png',
    contactName: '项目咨询老师',
    description: '提交报名后，请扫码添加企业微信确认项目节奏。',
  });
  assert.equal(setting.qrImageUrl, '/math-young-lecturer/uploads/consultation-qr/qr.png');
  assert.equal(setting.enabled, true);
  assert.throws(() => normalizeConsultationSettingInput({ qrImageUrl: 'https://example.com/qr.png' }), /二维码/);
});

test('project-level consultation setting overrides global fallback', () => {
  const globalSetting = { scope: 'GLOBAL', contactName: '全局老师', qrImageUrl: '/math-young-lecturer/uploads/consultation-qr/global.png', enabled: true };
  const projectSetting = { scope: 'PROJECT', projectId: 'p1', contactName: '项目老师', qrImageUrl: '/math-young-lecturer/uploads/consultation-qr/project.png', enabled: true };
  assert.equal(chooseEffectiveConsultationSetting({ projectSetting, globalSetting }).contactName, '项目老师');
  assert.equal(chooseEffectiveConsultationSetting({ projectSetting: null, globalSetting }).contactName, '全局老师');
});

test('disabled project-level consultation setting falls back to global setting', () => {
  const globalSetting = { scope: 'GLOBAL', contactName: '全局老师', qrImageUrl: '/math-young-lecturer/uploads/consultation-qr/global.png', enabled: true };
  const projectSetting = { scope: 'PROJECT', projectId: 'p1', contactName: '项目老师', qrImageUrl: '/math-young-lecturer/uploads/consultation-qr/project.png', enabled: false };
  assert.equal(chooseEffectiveConsultationSetting({ projectSetting, globalSetting }).contactName, '全局老师');
});

test('consultation display is enrollment follow-up copy, not payment-first copy', () => {
  const display = buildConsultationDisplay({
    contactName: '项目咨询老师',
    contactTitle: '数学小讲师联盟',
    qrImageUrl: '/math-young-lecturer/uploads/consultation-qr/qr.png',
    description: '扫码后老师会确认项目节奏、名额和适合度。',
  });
  assert.equal(display.title, '添加项目咨询老师');
  assert.match(display.description, /项目节奏/);
  assert.equal(/立即付款|扫码付款|付款成功/.test(`${display.title}${display.description}`), false);
});

#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';

const APPLY = process.argv.includes('--apply');
const prisma = new PrismaClient();

const CONFLICT_WHERE = {
  OR: [
    { status: 'APPROVED', reviewStatus: { not: 'APPROVED' } },
    { status: 'REJECTED', reviewStatus: { not: 'REJECTED' } },
    { status: 'PENDING', reviewStatus: { in: ['APPROVED', 'REJECTED'] } },
  ],
};

function plannedStatusFor(answer) {
  // ContentReviewStatus is the source of truth for public visibility.
  // Conservative rule: if teacher review is still PENDING/REJECTED, do not keep a public APPROVED business status.
  if (answer.reviewStatus === 'APPROVED') return 'APPROVED';
  if (answer.reviewStatus === 'REJECTED') return 'REJECTED';
  return 'PENDING';
}

async function main() {
  const conflicts = await prisma.answer.findMany({
    where: CONFLICT_WHERE,
    select: {
      id: true,
      status: true,
      reviewStatus: true,
      videoUrl: true,
      questionId: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: 'desc' },
  });

  const plan = conflicts.map((answer) => ({
    id: answer.id,
    fromStatus: answer.status,
    reviewStatus: answer.reviewStatus,
    toStatus: plannedStatusFor(answer),
    hasVideo: Boolean(answer.videoUrl),
    questionId: answer.questionId,
    updatedAt: answer.updatedAt,
  }));

  const byTransition = plan.reduce((acc, row) => {
    const key = `${row.fromStatus}/${row.reviewStatus}->${row.toStatus}/${row.reviewStatus}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  console.log(JSON.stringify({
    mode: APPLY ? 'apply' : 'dry-run',
    conflictCount: conflicts.length,
    byTransition,
    sample: plan.slice(0, 10),
  }, null, 2));

  if (!APPLY || conflicts.length === 0) return;

  const result = await prisma.$transaction(async (tx) => {
    const updates = [];
    for (const row of plan) {
      if (row.fromStatus === row.toStatus) continue;
      updates.push(tx.answer.update({
        where: { id: row.id },
        data: { status: row.toStatus },
        select: { id: true, status: true, reviewStatus: true },
      }));
    }
    return Promise.all(updates);
  });

  const remaining = await prisma.answer.count({ where: CONFLICT_WHERE });
  console.log(JSON.stringify({ updatedCount: result.length, remainingConflictCount: remaining }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

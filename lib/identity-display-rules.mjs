export const PUBLIC_ANONYMOUS_DISPLAY_COPY = "公开展示时隐藏孩子姓名（后台仍会记录账号，方便老师反馈）";
export const ANONYMOUS_QUESTION_AUTHOR_DISPLAY_NAME = "匿名小朋友";
export const DEFAULT_QUESTION_AUTHOR_DISPLAY_NAME = "小朋友";

export function canSeePrivateQuestionAuthor({ sessionUserId, sessionRole, authorId } = {}) {
  return Boolean(
    (sessionUserId && authorId && sessionUserId === authorId) ||
      sessionRole === "TEACHER" ||
      sessionRole === "ADMIN"
  );
}

export function getQuestionPublicAuthorDisplay(question = {}, viewer = {}) {
  const canSeePrivateAuthor = canSeePrivateQuestionAuthor({
    sessionUserId: viewer.sessionUserId,
    sessionRole: viewer.sessionRole,
    authorId: question.authorId,
  });

  if (question.isAnonymous && !canSeePrivateAuthor) {
    return ANONYMOUS_QUESTION_AUTHOR_DISPLAY_NAME;
  }

  return question.author?.name || DEFAULT_QUESTION_AUTHOR_DISPLAY_NAME;
}

export function maskQuestionAuthorForPublicDisplay(question = {}, viewer = {}) {
  const canSeePrivateAuthor = canSeePrivateQuestionAuthor({
    sessionUserId: viewer.sessionUserId,
    sessionRole: viewer.sessionRole,
    authorId: question.authorId,
  });

  const publicAuthorDisplayName = getQuestionPublicAuthorDisplay(question, viewer);

  return {
    ...question,
    publicAuthorDisplayName,
    author: question.author
      ? {
          ...question.author,
          name: question.isAnonymous && !canSeePrivateAuthor ? null : question.author.name,
        }
      : question.author,
  };
}

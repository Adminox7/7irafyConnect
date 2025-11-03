const toArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.messages)) return value.messages;
  if (Array.isArray(value?.items)) return value.items;
  return [];
};

const normalizeSender = (rawSender = {}, fallbackId) => {
  const id =
    rawSender.id ??
    rawSender.user_id ??
    rawSender.sender_id ??
    rawSender.uid ??
    fallbackId ??
    null;
  const name =
    rawSender.name ??
    rawSender.fullName ??
    rawSender.full_name ??
    rawSender.username ??
    rawSender.display_name ??
    null;
  return id || name
    ? {
        ...rawSender,
        id,
        name: name || "مستخدم",
      }
    : null;
};

export const normalizeMessage = (message) => {
  if (!message) return message;

  const id =
    message.id ??
    message.message_id ??
    message.uuid ??
    message._id ??
    `tmp-${Date.now()}`;

  const threadId =
    message.thread_id ??
    message.threadId ??
    message.thread ??
    message.conversation_id ??
    null;

  const body =
    message.body ??
    message.text ??
    message.message ??
    message.content ??
    "";

  const createdAt =
    message.created_at ??
    message.createdAt ??
    message.created_on ??
    message.created ??
    null;

  const readAt =
    message.read_at ??
    message.readAt ??
    message.read_on ??
    null;

  const fromUserId =
    message.sender_id ??
    message.senderId ??
    message.from_user_id ??
    message.fromUserId ??
    message.user_id ??
    null;

  const senderRaw =
    message.sender ??
    message.from ??
    message.author ??
    message.user ??
    null;

  const sender = normalizeSender(senderRaw || {}, fromUserId || undefined);

  return {
    ...message,
    id,
    threadId,
    text: body,
    createdAt,
    readAt,
    fromUserId: fromUserId ?? sender?.id ?? null,
    sender,
    senderName: sender?.name ?? null,
  };
};

export const normalizeMessages = (payload) =>
  toArray(payload).map((msg) => normalizeMessage(msg));

export const sortMessagesAsc = (messages) =>
  [...(messages || [])].sort((a, b) => {
    const timeA = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeA - timeB;
  });

export const filterUnread = (messages, meId) =>
  (messages || []).filter(
    (msg) => !msg.readAt && msg.fromUserId && meId && Number(msg.fromUserId) !== Number(meId)
  );

export const mergeUniqueMessages = (current, incoming) => {
  const map = new Map();
  [...(current || []), ...(incoming || [])].forEach((msg) => {
    if (!msg) return;
    map.set(String(msg.id), msg);
  });
  return sortMessagesAsc(Array.from(map.values()));
};


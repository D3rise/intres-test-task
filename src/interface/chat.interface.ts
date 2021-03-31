interface BaseMessageTarget {
  userId: number;
  roomId: number;
}

interface UserMessageTarget extends BaseMessageTarget {
  userId: number;
}

interface ChatMessageTarget extends BaseMessageTarget {
  roomId: number;
}

export type MessageTarget = UserMessageTarget | ChatMessageTarget;

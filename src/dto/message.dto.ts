// Can be used to send messages to a user OR a chat
export interface CreateMessageDTO {
  chatId: number;
  message: string;
}

export interface UpdateMessageDTO {
  chatId: number;
  messageId: string;
  newMessage: string;
}

export interface DeleteMessageDTO {
  chatId: number;
  messageId: string;
}

export interface GetMessagesDTO {
  chatId: number;
}

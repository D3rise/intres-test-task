// Can be used to send messages to a user OR a chat
export class CreateMessageDTO {
  chatId: number;
  message: string;
}

export class UpdateMessageDTO {
  chatId: number;
  messageId: string;
  newMessage: string;
}

export class DeleteMessageDTO {
  chatId: number;
  messageId: string;
}

export class GetMessagesDTO {
  chatId: number;
}

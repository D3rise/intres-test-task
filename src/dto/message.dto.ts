interface CreateMessageDTO {
  roomId: string;
  message: string;
}

interface UpdateMessageDTO {
  roomId: string;
  messageId: string;
  newMessage: string;
}

interface DeleteMessageDTO {
  roomId: string;
  messageId: string;
}

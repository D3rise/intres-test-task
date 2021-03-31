import { MessageTarget } from "../interface/chat.interface";

// Can be used to send messages to a user OR a chat
export interface CreateMessageDTO {
  target: MessageTarget;
  message: string;
}

export interface UpdateMessageDTO {
  target: MessageTarget;
  messageId: string;
  newMessage: string;
}

export interface DeleteMessageDTO {
  target: MessageTarget;
  messageId: string;
}

export interface IMessage {
  id: string;
  chatId: number;
  authorId: number;
  content: string;
  createdAt: number;
  updatedAt: number | null;
}

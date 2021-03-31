export interface IMessage {
  id: string;
  author: number;
  content: string;
  createdAt: number;
  updatedAt: number | null;
}

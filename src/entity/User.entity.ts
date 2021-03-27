import { Column, Entity, JoinTable, ManyToMany } from "typeorm";
import { Chat } from "./Chat.entity";
import { Default } from "./Default.entity";

@Entity()
export class User extends Default {
  @Column({ length: 33 })
  username: string;

  @Column()
  passwordHash: string;

  @ManyToMany((type) => Chat, (chat) => chat.members, {
    cascade: ["insert", "update"],
    onDelete: "SET NULL",
  })
  @JoinTable()
  chats: Chat[];
}

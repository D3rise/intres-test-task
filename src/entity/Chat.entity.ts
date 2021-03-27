import { Column, Entity, JoinTable, ManyToMany } from "typeorm";
import { Default } from "./Default.entity";
import { User } from "./User.entity";

@Entity()
export class Chat extends Default {
  @Column()
  title: string;

  @ManyToMany((type) => User, (user) => user.chats, {
    cascade: ["insert", "update"],
    onDelete: "SET NULL",
  })
  members: User[];
}

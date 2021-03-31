import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { User } from "../entity/User.entity";

export interface ISocket extends Socket<DefaultEventsMap, DefaultEventsMap> {
  userId?: number;
  user?: User;
}

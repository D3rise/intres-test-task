import { AfterUpdate, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ synchronize: false })
export class Default {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ default: null })
  updatedAt: Date;

  @AfterUpdate()
  updateUpdatedAt() {
    this.updatedAt = new Date();
  }
}

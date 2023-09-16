import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class DirectMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ length: 100 })
  content: string;
  @Column({ nullable: true })
  fileUrl?: string;
  @Column()
  senderId: string;
  @Column()
  receiverId: string;
  @Column({ default: new Date() })
  createdAt: Date;
  @Column({ nullable: true })
  updatedAt: Date;
}

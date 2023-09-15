import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';
@Entity()
export class CommunityMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ length: 100 })
  content: string;
  @Column({ nullable: true })
  fileUrl: string;
  @Column()
  userId: string;
  @Column()
  communityId: string;
  @Column({ default: new Date() })
  createdAt: Date;
  @Column({ nullable: true })
  updatedAt: Date;
}
@Entity()
export class DirectMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ length: 100 })
  content: string;
  @Column()
  fileUrl?: string;
  @Column()
  senderId: string;
  @Column()
  receiverId: string;
  @Column({ default: new Date() })
  createdAt: Date;
  @Column()
  updatedAt: Date;
}

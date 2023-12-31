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

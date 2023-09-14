import { Column, PrimaryGeneratedColumn, Entity, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Community } from './community.enity';
@Entity()
export class CommunityMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ length: 100 })
  content: string;
  @Column()
  fileUrl?: string;
  @Column()
  userId: string;
  @Column()
  communityId: string;
  @Column({ default: new Date() })
  createdAt: Date;
  @Column()
  updatedAt: Date;
}

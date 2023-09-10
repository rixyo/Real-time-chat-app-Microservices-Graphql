import {
  Column,
  PrimaryGeneratedColumn,
  Entity,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from './user.entity';
import { CommunityMessage } from './message.entity';
@Entity()
export class Community {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ length: 100 })
  name: string;
  @Column()
  avatalUrl?: string;
  @Column({ length: 100 })
  description: string;
  @Column()
  creatorId: string;
  @Column({ default: new Date() })
  createdAt: Date;
  @Column()
  updatedAt: Date;
  @ManyToMany(() => User, (user) => user.communities)
  @JoinTable()
  users: User[];
  @OneToMany(() => CommunityMessage, (message) => message.community)
  messages: CommunityMessage[];
}

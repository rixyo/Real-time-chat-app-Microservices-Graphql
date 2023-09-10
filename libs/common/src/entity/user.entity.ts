import {
  Column,
  PrimaryGeneratedColumn,
  Entity,
  ManyToMany,
  Unique,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Community } from './community.enity';
import { CommunityMessage } from './message.entity';
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ length: 100 })
  fullName: string;
  @Column({ length: 100 })
  @Unique(['email'])
  email: string;
  @Column()
  password: string;
  @Column({ default: new Date() })
  createdAt: Date;
  @Column()
  updatedAt: Date;
  @ManyToMany(() => Community, (community) => community.users)
  @JoinTable()
  communities: Community[];
  @OneToMany(() => CommunityMessage, (message) => message.user)
  messages: CommunityMessage[];
}

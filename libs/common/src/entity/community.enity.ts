import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';
@Entity()
export class Community {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ length: 100 })
  name: string;
  @Column({ nullable: true })
  avatalUrl: string;
  @Column({ length: 100 })
  description: string;
  @Column()
  creatorId: string;
  @Column({ default: new Date() })
  createdAt: Date;
  @Column({ nullable: true })
  updatedAt: Date;
  @Column('uuid', { array: true, default: [] })
  userIds: string[];
  @Column('uuid', { array: true, default: [] })
  messageIds: string[];
}

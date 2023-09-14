import { Column, PrimaryGeneratedColumn, Entity, Unique } from 'typeorm';

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
  @Column({ nullable: true })
  updatedAt: Date;
  @Column('uuid', { array: true, default: [] })
  communityIds: string[];
}

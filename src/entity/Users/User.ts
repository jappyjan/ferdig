import {Column, CreateDateColumn, Entity, ManyToOne, OneToOne, PrimaryColumn, Unique, UpdateDateColumn} from 'typeorm';
import Application from '../Applications/Application';
import UserNotificationSettings from './UserNotificationSettings';
import UserAuth from './UserAuth';

@Entity()
@Unique(['email', 'application'])
export default class User implements Express.User {
    @PrimaryColumn({generated: 'uuid', type: 'uuid'})
    public id: string;

    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;

    @Column()
    public email: string;

    @ManyToOne(() => Application, (application) => application.users, {nullable: true})
    public application: Application | null;

    @OneToOne(() => UserAuth, (auth) => auth.user)
    public auth: UserAuth;

    @OneToOne(() => UserNotificationSettings, (settings) => settings.user)
    public notificationSettings: UserNotificationSettings | null;
}

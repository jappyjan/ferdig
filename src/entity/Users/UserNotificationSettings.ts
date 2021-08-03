import {Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn, UpdateDateColumn} from 'typeorm';
import User from './User';

@Entity()
export default class UserNotificationSettings {
    @PrimaryColumn({generated: 'uuid', type: 'uuid'})
    public id: string;

    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;

    @OneToOne(() => User, (user) => user.notificationSettings, {nullable: false})
    @JoinColumn()
    public user: User;

    @Column({default: false})
    public wantsPushNotifications: boolean;
}

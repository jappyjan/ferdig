import {Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn, UpdateDateColumn} from 'typeorm';
import User from './User';

@Entity()
export default class UserAuth implements Express.User {
    @PrimaryColumn({generated: 'uuid', type: 'uuid'})
    public id: string;

    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;

    @OneToOne(() => User, (user) => user.auth, {nullable: false})
    @JoinColumn()
    public user: User;

    @Column()
    public passwordHash: string;

    @Column({default: false})
    public emailVerified: boolean;

    @Column({default: false})
    public hasConsoleAccess: boolean;

    @Column({default: false})
    public isDisabled: boolean;

    @Column({nullable: true})
    public emailValidationToken: string | null;
}

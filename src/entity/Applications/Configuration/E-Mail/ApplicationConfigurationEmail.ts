import {Column} from 'typeorm';
import {EmailClientType} from '../../../../services/Applications/Notifications/Handler/Email/EmailClient';

export default class ApplicationConfigurationEmail {
    @Column({nullable: false, enum: EmailClientType, type: 'enum'})
    public clientType: EmailClientType;

    @Column({nullable: true, type: 'varchar'})
    public host: string | null;

    @Column({nullable: true, type: 'int'})
    public port: number | null;

    @Column({nullable: true, type: 'boolean'})
    public ssl: boolean | null;

    @Column({nullable: true, type: 'varchar'})
    public authUser: string | null;

    @Column({nullable: true, type: 'varchar'})
    public authPassword: string | null;

    @Column({nullable: true, type: 'varchar'})
    public fromName: string | null;

    @Column({nullable: false})
    public fromAddress: string;

    @Column({nullable: true, type: 'varchar'})
    public replyToName: string | null;

    @Column({nullable: false, type: 'varchar'})
    public replyToAddress: string;

    @Column({nullable: true, type: 'varchar'})
    public region: string | null;
}

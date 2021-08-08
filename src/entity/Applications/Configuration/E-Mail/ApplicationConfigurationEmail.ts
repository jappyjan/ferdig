import {Column} from 'typeorm';

export default class ApplicationConfigurationEmail {
    @Column({nullable: false})
    public host: string;

    @Column({nullable: false})
    public port: number;

    @Column({nullable: false})
    public ssl: boolean;

    @Column({nullable: false})
    public authUser: string;

    @Column({nullable: false})
    public authPassword: string;

    @Column({nullable: false})
    public fromName: string;

    @Column({nullable: false})
    public fromAddress: string;
}

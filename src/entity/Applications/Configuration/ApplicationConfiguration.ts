import {Column, CreateDateColumn, Entity, OneToOne, PrimaryColumn, UpdateDateColumn} from 'typeorm';
import Application from '../Application';
import ApplicationConfigurationEmail from './E-Mail/ApplicationConfigurationEmail';

@Entity()
export default class ApplicationConfiguration {
    @PrimaryColumn({generated: 'uuid', type: 'uuid'})
    public id: string;

    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;

    @OneToOne(() => Application, (app) => app.configuration, {nullable: false})
    public application!: Application;

    @Column({default: true})
    public loginRequiresValidEmail: boolean;

    @Column(() => ApplicationConfigurationEmail)
    public email: ApplicationConfigurationEmail;
}

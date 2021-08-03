import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    OneToMany,
    OneToOne,
    PrimaryColumn,
    Unique,
    UpdateDateColumn,
} from 'typeorm';
import ApplicationCollection from './Collections/ApplicationCollection';
import User from '../Users/User';
import ApplicationAutomation from './Automations/ApplicationAutomation';
import ApplicationNotificationTemplate from './Notifications/Templates/ApplicationNotificationTemplate';
import ApplicationConfiguration from './Configuration/ApplicationConfiguration';

@Entity()
@Unique(['internalName'])
export default class Application {
    @PrimaryColumn({generated: 'uuid', type: 'uuid'})
    public id: string;

    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;

    @Column()
    public internalName: string;

    @OneToMany(() => ApplicationCollection, (collection) => collection.application)
    public collections: ApplicationCollection[];

    @OneToMany(() => User, (user) => user.application)
    public users: User[];

    @OneToMany(() => ApplicationAutomation, (automation) => automation.application)
    public automations: ApplicationAutomation[];

    @OneToMany(() => ApplicationNotificationTemplate, (template) => template.application)
    public notificationTemplates: ApplicationNotificationTemplate[];

    @OneToOne(() => ApplicationConfiguration, (config) => config.application, {nullable: false})
    @JoinColumn()
    public configuration!: ApplicationConfiguration;
}

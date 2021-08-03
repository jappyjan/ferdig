import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, Unique, UpdateDateColumn} from 'typeorm';
import Application from '../../Application';

@Entity()
@Unique(['internalName', 'application'])
export default class ApplicationNotificationTemplate {
    @PrimaryColumn({generated: 'uuid', type: 'uuid'})
    public id: string;

    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;

    @Column()
    public internalName: string;

    @ManyToOne(() => Application, (app) => app.notificationTemplates, {nullable: false})
    public application: Application;

    @Column({nullable: false})
    public subject: string;

    @Column({nullable: false})
    public body: string;
}

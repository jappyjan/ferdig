import {Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryColumn, Unique, UpdateDateColumn} from 'typeorm';
import Application from '../Application';
import ApplicationAutomationFlowNode from './ApplicationAutomationFlowNode';

@Entity()
@Unique(['internalName', 'application'])
export default class ApplicationAutomation {
    @PrimaryColumn({generated: 'uuid', type: 'uuid'})
    public id: string;

    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;

    @Column()
    public internalName: string;

    @ManyToOne(() => Application, (application) => application.automations, {nullable: false})
    public application: Application;

    @OneToMany(() => ApplicationAutomationFlowNode, (node) => node.automation)
    public flowNodes: ApplicationAutomationFlowNode[];
}

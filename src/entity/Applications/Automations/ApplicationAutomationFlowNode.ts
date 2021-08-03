import {Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryColumn, UpdateDateColumn} from 'typeorm';
import ApplicationAutomation from './ApplicationAutomation';
import ApplicationAutomationFlowNodeConfigValue from './ApplicationAutomationFlowNodeConfigValue';
import ApplicationAutomationFlowNodeLog from './ApplicationAutomationFlowNodeLog';

export enum ApplicationAutomationFlowNodeType {
    User_Created = 'user::created',
    Auth_Login = 'auth::login',
    NotificationTemplate_Load = 'notification_template::load',
    Notifications_Send = 'notifications::send',
    Automation_ChangePayload = 'automation::change_payload',
    Automation_MapPayload = 'automation::map_payload',
}

@Entity()
export default class ApplicationAutomationFlowNode {
    @PrimaryColumn({generated: 'uuid', type: 'uuid'})
    public id: string;

    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;

    @ManyToOne(() => ApplicationAutomation, (automation) => automation.flowNodes, {nullable: false})
    public automation: ApplicationAutomation;

    @ManyToOne(() => ApplicationAutomationFlowNode, (parent) => parent.children, {nullable: true})
    public parent: ApplicationAutomationFlowNode | null;

    @Column({nullable: true})
    public parentId: string | null;

    @OneToMany(() => ApplicationAutomationFlowNode, (child) => child.parent)
    public children: ApplicationAutomationFlowNode[];

    @Column({enum: ApplicationAutomationFlowNodeType, type: 'enum'})
    public type: ApplicationAutomationFlowNodeType;

    @OneToMany(() => ApplicationAutomationFlowNodeConfigValue, (value) => value.node)
    public configValues: ApplicationAutomationFlowNodeConfigValue[];

    @OneToMany(() => ApplicationAutomationFlowNodeLog, (log) => log.node)
    public logs: ApplicationAutomationFlowNodeLog[];
}

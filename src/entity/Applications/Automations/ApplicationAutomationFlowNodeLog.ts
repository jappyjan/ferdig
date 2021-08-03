import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, UpdateDateColumn} from 'typeorm';
import ApplicationAutomationFlowNode from './ApplicationAutomationFlowNode';

export enum ApplicationAutomationFlowNodeLogLevel {
    Info = 'info',
    Error = 'error',
}

@Entity()
export default class ApplicationAutomationFlowNodeLog {
    @PrimaryColumn({generated: 'uuid', type: 'uuid'})
    public id: string;

    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;

    @ManyToOne(() => ApplicationAutomationFlowNode, (node) => node.logs, {nullable: false})
    public node: ApplicationAutomationFlowNode;

    @Column({enum: ApplicationAutomationFlowNodeLogLevel, type: 'enum'})
    public level: ApplicationAutomationFlowNodeLogLevel;

    @Column()
    public message: string;

    @Column()
    public receivedPayload: string;
}

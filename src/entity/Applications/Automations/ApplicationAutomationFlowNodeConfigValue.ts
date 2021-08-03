import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, UpdateDateColumn} from 'typeorm';
import ApplicationAutomationFlowNode from './ApplicationAutomationFlowNode';

@Entity()
export default class ApplicationAutomationFlowNodeConfigValue {
    @PrimaryColumn({generated: 'uuid', type: 'uuid'})
    public id: string;

    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;

    @ManyToOne(() => ApplicationAutomationFlowNode, (node) => node.configValues, {nullable: false})
    public node: ApplicationAutomationFlowNode;

    @Column({nullable: false})
    public key: string;

    @Column({nullable: false})
    public value: string;
}

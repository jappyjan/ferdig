import {Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryColumn, UpdateDateColumn} from 'typeorm';

export enum CollectionDocumentsAccessRuleComparisonOperator {
    EQUAL = 'EQUAL',
    LESS = 'LESS',
    LESS_OR_EQUAL = 'LESS_OR_EQUAL',
    GREATER = 'GREATER',
    GREATER_OR_EQUAL = 'GREATER_OR_EQUAL',
    NOT_EQUAL = 'NOT_EQUAL',
    TRUE = 'TRUE',
    FALSE = 'FALSE',
}

@Entity()
export default class ApplicationCollectionDocumentAccessRule {
    @PrimaryColumn({generated: 'uuid', type: 'uuid'})
    public id: string;

    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;

    @Column({nullable: true})
    public leftSide: string | null;

    @Column({enum: CollectionDocumentsAccessRuleComparisonOperator, nullable: true, type: 'enum'})
    public operator: CollectionDocumentsAccessRuleComparisonOperator | null;

    @Column({nullable: true})
    public rightSide: string | null;

    @OneToMany(() => ApplicationCollectionDocumentAccessRule, (andRule) => andRule.parentAndRule)
    public and: ApplicationCollectionDocumentAccessRule[];

    @OneToMany(() => ApplicationCollectionDocumentAccessRule, (orRule) => orRule.parentOrRule)
    public or: ApplicationCollectionDocumentAccessRule[];

    @ManyToOne(() => ApplicationCollectionDocumentAccessRule, (parentAndRule) => parentAndRule.and)
    public parentAndRule: ApplicationCollectionDocumentAccessRule;

    @ManyToOne(() => ApplicationCollectionDocumentAccessRule, (parentOrRule) => parentOrRule.or)
    public parentOrRule: ApplicationCollectionDocumentAccessRule;
}

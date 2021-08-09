import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryColumn,
    Unique,
    UpdateDateColumn,
} from 'typeorm';
import ApplicationCollection from './ApplicationCollection';
import ApplicationCollectionDocumentProperty from './ApplicationCollectionDocumentProperty';
import ApplicationCollectionDocumentAccessRule from './ApplicationCollectionDocumentAccessRule';

export enum ApplicationCollectionColumnValueType {
    String = 'string',
    Number = 'number',
    Date = 'date',
    Boolean = 'boolean',
    File = 'file'
}

@Entity()
@Unique(['internalName', 'collection'])
export default class ApplicationCollectionColumn {
    @PrimaryColumn({generated: 'uuid', type: 'uuid'})
    public id: string;

    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;

    @OneToOne(() => ApplicationCollectionDocumentAccessRule)
    @JoinColumn()
    public writeAccessRule: ApplicationCollectionDocumentAccessRule;

    @OneToOne(() => ApplicationCollectionDocumentAccessRule)
    @JoinColumn()
    public readAccessRule: ApplicationCollectionDocumentAccessRule;

    @Column()
    public internalName: string;

    @ManyToOne(() => ApplicationCollection, (collection) => collection.columns, {nullable: false})
    public collection: ApplicationCollection;

    @Column({enum: ApplicationCollectionColumnValueType, type: 'enum'})
    public valueType: ApplicationCollectionColumnValueType;

    @Column()
    public isArray: boolean;

    @OneToMany(() => ApplicationCollectionDocumentProperty, (property) => property.column)
    public documentProperties: ApplicationCollectionDocumentProperty[];
}

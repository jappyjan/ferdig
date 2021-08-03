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
import ApplicationCollectionColumn from './ApplicationCollectionColumn';
import ApplicationCollectionDocument from './ApplicationCollectionDocument';
import Application from '../Application';
import ApplicationCollectionDocumentAccessRule from './ApplicationCollectionDocumentAccessRule';

@Entity()
@Unique(['internalName', 'application'])
export default class ApplicationCollection {
    @PrimaryColumn({generated: 'uuid', type: 'uuid'})
    public id: string;

    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;

    @OneToOne(() => ApplicationCollectionDocumentAccessRule)
    @JoinColumn()
    public readAccessRule: ApplicationCollectionDocumentAccessRule;

    @OneToOne(() => ApplicationCollectionDocumentAccessRule)
    @JoinColumn()
    public writeAccessRule: ApplicationCollectionDocumentAccessRule;

    @Column()
    public internalName: string;

    @ManyToOne(() => Application, (app) => app.collections, {nullable: false})
    public application: Application;

    @OneToMany(() => ApplicationCollectionColumn, (column) => column.collection)
    public columns: ApplicationCollectionColumn[];

    @OneToMany(() => ApplicationCollectionDocument, (document) => document.collection)
    public documents: ApplicationCollectionDocument[];
}

import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, UpdateDateColumn} from 'typeorm';
import ApplicationCollectionDocument from './ApplicationCollectionDocument';
import ApplicationCollectionColumn from './ApplicationCollectionColumn';

@Entity()
export default class ApplicationCollectionDocumentProperty {
    @PrimaryColumn({generated: 'uuid', type: 'uuid'})
    public id: string;

    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;

    @ManyToOne(() => ApplicationCollectionDocument, (document) => document.properties, {nullable: false})
    public document: ApplicationCollectionDocument;

    @ManyToOne(() => ApplicationCollectionColumn, (column) => column.documentProperties, {nullable: false})
    public column: ApplicationCollectionColumn;

    @Column()
    public value: string;
}

import {CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryColumn, UpdateDateColumn} from 'typeorm';
import ApplicationCollection from './ApplicationCollection';
import ApplicationCollectionDocumentProperty from './ApplicationCollectionDocumentProperty';

export type DocumentAsObjectValueType = Date | number | string | boolean;
export type DocumentAsObjectType = Record<string, DocumentAsObjectValueType | DocumentAsObjectValueType[]>;

@Entity()
export default class ApplicationCollectionDocument {
    @PrimaryColumn({generated: 'uuid', type: 'uuid'})
    public id: string;

    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;

    @ManyToOne(() => ApplicationCollection, (collection) => collection.documents, {nullable: false})
    public collection: ApplicationCollection;

    @OneToMany(() => ApplicationCollectionDocumentProperty, (property) => property.document)
    public properties: ApplicationCollectionDocumentProperty[];
}

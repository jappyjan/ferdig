import {Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn} from 'typeorm';

@Entity()
export default class CronJob {
    @PrimaryColumn({generated: 'uuid', type: 'uuid'})
    public id: string;

    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;

    @Column({nullable: false})
    public jobId: string;

    @Column({nullable: true, type: 'integer'})
    public interval: number | null;

    @Column({nullable: false})
    public nextRun: Date;

    @Column({type: 'varchar', nullable: true})
    public payload: string | null;

    @Column({type: 'timestamp', nullable: true})
    public lockedAt: Date | null;
}

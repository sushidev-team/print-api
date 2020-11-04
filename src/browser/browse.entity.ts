import { Entity, Column, PrimaryGeneratedColumn, Generated, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Browse {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    filename: string;

    @Column()
    filename_return: string;

    @CreateDateColumn({type: "date"})
    created_at: Date;

    @UpdateDateColumn({type: "date"})
    updated_at: Date;

    @Column({ default: false })
    autodelete: boolean

    @Column({ default: 0 })
    downloads: number;

    @Column({ default: false })
    printed: boolean

}
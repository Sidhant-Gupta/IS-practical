import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class questions_table {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    question: string;

    @Column()
    answer: string;

    @Column()
    level:string;

}

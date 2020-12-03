import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class contest_question {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    contest_id: number;

    @Column()
    question_id: number;


}

import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class question_input_output {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    input: string;

    @Column()
    output: string;

    @Column()
    question_id: number;

}

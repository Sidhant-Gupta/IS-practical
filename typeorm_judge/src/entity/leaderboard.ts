import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class leaderboard {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id:number;

    @Column()
    contest_id:number;

    @Column()
    question_id:number;

    @Column()
    score:string;

}

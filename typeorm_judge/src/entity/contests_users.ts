import {Entity, PrimaryGeneratedColumn, Column, Timestamp} from "typeorm";

@Entity()
export class contests_users {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: number;

    @Column()
    contest_id: number;

    // @Column()
    // enter_time: Timestamp;

}

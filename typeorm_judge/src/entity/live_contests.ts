import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class live_contests {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    duration: number;


}

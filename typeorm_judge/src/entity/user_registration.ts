import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class user_registration {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    password: string;
}

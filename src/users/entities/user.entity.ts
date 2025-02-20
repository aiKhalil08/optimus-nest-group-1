import { Exclude } from "class-transformer";
import { AfterLoad, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({unique: true})
    email: string;

    @CreateDateColumn({nullable: true})
    createdAt: Date;

    @Column({nullable: true})
    imageUrl: string;

    @Exclude()
    status: string;

    @AfterLoad()
    computeStatus() {
        this.status = this.isActive ? 'Active' : 'Inactive';
    }

    @Column({default: false, nullable: true})
    isActive: boolean;
}

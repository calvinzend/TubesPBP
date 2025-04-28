import { UUID } from "sequelize";
import { Table, Column, Model, DataType} from "sequelize-typescript";

@Table({
    tableName: "users",
    timestamps: true,
})

export class User extends Model {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    user_id!: string;
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    name!: string;
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    username!: string;
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    password!: string;
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    email!: string;
    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    bio?: string;
    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    profilePicture?: string;
    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    createdAt!: Date;
}
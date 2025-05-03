import { UUID } from 'sequelize';
import { Table, Column, Model, DataType, PrimaryKey, AllowNull } from 'sequelize-typescript';

@Table({
    tableName: "users",
    timestamps: true,
})

export class User extends Model {
    @Column({
        primaryKey: true,
        allowNull: false,
        type: DataType.UUID
    })
    declare user_id: string;
    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare password: string;
    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare username: string;
    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare name: string;
    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true
    })
    declare email: string;
    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    declare bio: string;
    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    declare profilePicture: string;
    @Column({
        type: DataType.DATE,
        allowNull: false,
        defaultValue: DataType.NOW
    })
    declare createdAt: Date;
    @Column({
        type: DataType.DATE,
        allowNull: false,
        defaultValue: DataType.NOW
    })
    declare updatedAt: Date;
    @Column({
        type: DataType.DATE,
        allowNull: true
    })
    declare deletedAt: Date;
    
}
import { UUID } from "sequelize";
import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
    tableName: "likes",
    timestamps: true,
})

export class Likes extends Model {
    @Column({
        type: DataType.UUID,
        allowNull: false,
        primaryKey: true
    })
    declare like_id: string;
    @Column({
        type: DataType.UUID,
        allowNull: false,
        references: {
            model: 'tweets',
            key: 'tweet_id',
        },
        onDelete: 'CASCADE'
    })
    declare tweet_id: string;
    @Column({
        type: DataType.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'user_id',
        },
        onDelete: 'CASCADE'
    })
    declare user_id: string;
    @Column({
        type: DataType.DATE,
        allowNull: false,
        defaultValue: DataType.NOW
    })
    declare createdAt: Date;
}
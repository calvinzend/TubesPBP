import { UUID } from "sequelize";
import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
    tableName: "replies",
    timestamps: true,
})

export class Reply extends Model {
    @Column({
        primaryKey: true,
        allowNull: false,
        type: DataType.UUID
    })
    declare reply_id: string;
    @Column({
        type: DataType.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'user_id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    declare user_id: string;
    @Column({
        type: DataType.UUID,
        allowNull: false,
        references: {
            model: 'tweets',
            key: 'tweet_id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    declare tweet_id: string;
    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare content: string;
    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    declare image_path: string;
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
}
import { UUID } from "sequelize";
import { Table, Column, Model, DataType, ForeignKey } from "sequelize-typescript";
import { User } from "./User";
import { Tweet } from "./Tweet";

@Table({
    tableName: "replies",
    timestamps: true,
})

export class Reply extends Model {
    @Column({
        primaryKey: true,
        allowNull: false,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4
    })
    declare reply_id: string;
    @ForeignKey(() => User)
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
    @ForeignKey(() => Tweet)
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
        type: DataType.TEXT,
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
    declare created_at: Date;
    @Column({
        type: DataType.DATE,
        allowNull: false,
        defaultValue: DataType.NOW
    })
    declare updated_at: Date;
    @Column({
        type: DataType.DATE,
        allowNull: true
    })
    declare deleted_at: Date;
}
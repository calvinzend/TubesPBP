import { UUID } from "sequelize";
import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript";
import { User } from "./User"; 
import { Tweet } from "./Tweet";

@Table({
    tableName: "replies",
    timestamps: true,
    paranoid: true
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
    })
    declare user_id: string;

    @ForeignKey(() => Tweet)
    @Column({
        type: DataType.UUID,
        allowNull: false,
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

    @BelongsTo(() => User)
    user!: User;

    @BelongsTo(() => Tweet)
    tweet!: Tweet;
}
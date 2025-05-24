import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { User } from './User'; // jika ada
import { Likes } from './Likes';

@Table({
    tableName: "tweets",
    timestamps: true,
})
export class Tweet extends Model {
    @Column({
        primaryKey: true,
        allowNull: false,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4
    })
    declare tweet_id: string;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    declare user_id: string;

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
        type: DataType.UUID,
        allowNull: true,
        references: {
            model: 'tweets',
            key: 'tweet_id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    declare reply_id: string;
    
    @Column({
        type: DataType.UUID,
        references: {
          model: 'tweets',
          key: 'tweet_id'
        },

        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        allowNull: true
    })
    declare root_id: string;

    @BelongsTo(() => User)
    user!: User;

    @BelongsTo(() => Tweet, { foreignKey: "reply_id", as: "ParentTweet" })
    declare parentTweet: Tweet;

    @HasMany(() => Tweet, { foreignKey: "reply_id", as: "Replies" })
    declare replies: Tweet[];

    @HasMany(() => Likes, 'tweet_id')
    likes!: Likes[];
}

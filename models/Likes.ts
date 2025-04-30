import { UUID } from "sequelize";
import { v4 as uuidv4 } from "uuid";
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

    static async toggleLike(user_id: string, tweet_id: string): Promise<{ liked: boolean }> {
        // Check if a like already exists
        const existingLike = await Likes.findOne({ where: { user_id, tweet_id } });

        if (existingLike) {
            // If it exists, unlike (delete the record)
            await existingLike.destroy();
            return { liked: false }; // Indicate the tweet was unliked
        } else {
            // If it doesn't exist, create a like
            await Likes.create({
                like_id: uuidv4(), // Generate a unique ID for the like
                user_id,
                tweet_id,
            });
            return { liked: true }; // Indicate the tweet was liked
        }
    }
}

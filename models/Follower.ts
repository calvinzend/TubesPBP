import { UUID } from 'sequelize';
import { Table, Column, Model, DataType, AllowNull } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';

@Table({
    tableName: "followers",
    timestamps: true,
})

export class Follower extends Model {
    @Column({
        type: DataType.UUID,
        allowNull: false,
        primaryKey: true
    })
    declare follow_id: string;
    @Column({
        type: DataType.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'user_id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    declare userId: string;
    @Column({
        type: DataType.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'user_id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    declare followerId: string;
    @Column({
        type: DataType.DATE,
        allowNull: false,
        defaultValue: DataType.NOW,
    })
    declare followedAt: Date;
    @Column({
        type: DataType.DATE,
        allowNull: false,
        defaultValue: DataType.NOW,
    })
    declare updatedAt: Date;

    static async toggleLike(user_id: string, followerId: string): Promise<{ followed: boolean }> {
        // followerId is the user who want follows
        // user_id is the user who is being followed

        // Prevent a user from following themselves
        if (user_id === followerId) {
            throw new Error("A user cannot follow themselves.");
        }

        // Check if a like already exists
        const existingFollower = await Follower.findOne({ where: { user_id, followerId } });

        if (existingFollower) {
            // If it exists, unlike (delete the record)
            await existingFollower.destroy();
            return { followed: false }; // Indicate the tweet was unliked
        } else {
            await Follower.create({
                follow_id: uuidv4(), // Generate a unique ID for the follow
                user_id,
                followerId,
            });
            return { followed: true }; // Indicate the tweet was liked
        }
    }
}

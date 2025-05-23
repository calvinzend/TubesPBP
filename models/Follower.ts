import { Table, Column, Model, DataType, AllowNull } from 'sequelize-typescript';

@Table({
    tableName: "followers",
    timestamps: false,
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
    declare user_id: string; // User that follow
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
    declare following_id: string; // User that get Followed
    @Column({
        type: DataType.DATE,
        allowNull: false,
        defaultValue: DataType.NOW,
    })
    declare followedAt: Date;
}

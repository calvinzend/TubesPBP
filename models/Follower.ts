import { UUID } from 'sequelize';
import { Table, Column, Model, DataType, AllowNull } from 'sequelize-typescript';

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
}
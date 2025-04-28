import { al } from 'react-router/dist/development/route-data-C12CLHiN';
import { UUID } from 'sequelize';
import { Table, Column, Model, DataType, PrimaryKey } from 'sequelize-typescript';

@Table({
    tableName: "tweets",
    timestamps: true,
})

export class Tweet extends Model {
    @Column({
        primaryKey: true,
        allowNull: false,
        type: DataType.UUID
    })
    declare tweet_id: string;
    @Column({
        type: DataType.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'user_id'
        },
        onDelete: 'CASCADE'
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
        onDelete: 'CASCADE'
    })
    declare reply_id: string;
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
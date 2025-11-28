import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database'; // adjust path if needed

class Shift extends Model {
  public id!: number;
  public shiftType!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Shift.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    shiftType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'shifts',
    timestamps: true, // automatically adds createdAt and updatedAt
  }
);

export default Shift;

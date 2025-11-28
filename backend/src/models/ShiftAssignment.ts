import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface ShiftAssignmentAttributes {
  id: number;
  staffId: number;
  shiftId: number;
  entryTime: string;
  exitTime: string;
}

interface ShiftAssignmentCreation
  extends Optional<ShiftAssignmentAttributes, "id"> {}

export class ShiftAssignment
  extends Model<ShiftAssignmentAttributes, ShiftAssignmentCreation>
  implements ShiftAssignmentAttributes
{
  public id!: number;
  public staffId!: number;
  public shiftId!: number;
  public entryTime!: string;
  public exitTime!: string;
}

ShiftAssignment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement:true
    },
    staffId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    shiftId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    entryTime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    exitTime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "shift_assignments",
    timestamps: false,
  }
);


export default ShiftAssignment;
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface StaffAttributes {
  id: number;
  staffName: string;
  contactNumber: string;
  email?: string | null;
  preferredShift: string;
}

// For creation: id is auto-generated, email is optional
interface StaffCreationAttributes extends Optional<StaffAttributes, "id" | "email"> {}

export class Staff
  extends Model<StaffAttributes, StaffCreationAttributes>
  implements StaffAttributes
{
  public id!: number;
  public staffName!: string;
  public contactNumber!: string;
  public email!: string | null;
  public preferredShift!: string;
}

Staff.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    staffName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contactNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true, // optional
    },
    preferredShift: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "morning | evening | night | flexible",
    },
  },
  {
    sequelize,
    tableName: "staff",
    timestamps: false,
  }
);

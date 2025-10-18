import { DataTypes } from "sequelize";

import bcrypt from "bcryptjs";

const User = sequelize.define("User", {
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  email: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: true,
    set(value) { this.setDataValue('email', value.toLowerCase()); }
  },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { 
    type: DataTypes.ENUM("student", "institute", "company", "admin"),
    defaultValue: "student",
  },
}, { timestamps: true });

// Hash password before saving
User.beforeCreate(async (user) => {
  user.password = await bcrypt.hash(user.password, 12);
});

User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    user.password = await bcrypt.hash(user.password, 12);
  }
});

// Method for password comparison
User.prototype.correctPassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default User;
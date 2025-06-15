const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const G5Group = sequelize.define('G5Group', {
    gr_id: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: '',
      primaryKey: true,
    },
    gr_subject: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
    },
    gr_device: {
      type: DataTypes.ENUM('both', 'pc', 'mobile'),
      allowNull: false,
      defaultValue: 'both',
    },
    gr_admin: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
    },
    gr_use_access: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
    },
    gr_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    // Extended fields gr_1_subj to gr_10_subj and gr_1 to gr_10 are omitted for brevity
    // Add them if they are essential for your application logic involving groups
  }, {
    tableName: 'g5_group',
    timestamps: false,
    underscored: true,
  });

  // Define associations if needed, for example, a group has many boards
  G5Group.associate = (models) => {
    if (models.G5Board) { // Check if G5Board model is available
        G5Group.hasMany(models.G5Board, { foreignKey: 'gr_id', sourceKey: 'gr_id' });
    }
  };

  return G5Group;
};

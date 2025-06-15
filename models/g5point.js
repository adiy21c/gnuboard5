const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const G5Point = sequelize.define('G5Point', {
    po_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    mb_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: '',
    },
    po_datetime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW, // Or '0000-00-00 00:00:00' if strictly following SQL
    },
    po_content: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
    },
    po_point: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    po_use_point: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    po_expired: {
      type: DataTypes.TINYINT, // Boolean in Sequelize might map to TINYINT(1)
      allowNull: false,
      defaultValue: 0,
    },
    po_expire_date: {
      type: DataTypes.DATEONLY, // DATE type in SQL
      allowNull: false,
      defaultValue: '0000-00-00',
    },
    po_mb_point: { // Member's total points at the time of this record
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    po_rel_table: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: '',
    },
    po_rel_id: {
      type: DataTypes.STRING(20), // Can be board name, member_id for recommendation, etc.
      allowNull: false,
      defaultValue: '',
    },
    po_rel_action: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: '',
    },
  }, {
    tableName: 'g5_point',
    timestamps: false,
    underscored: true,
    indexes: [
      {
        name: 'index1',
        fields: ['mb_id', 'po_rel_table', 'po_rel_id', 'po_rel_action'],
      },
      {
        name: 'index2',
        fields: ['po_expire_date'],
      },
    ],
  });

  G5Point.associate = (models) => {
    if (models.G5Member) {
      G5Point.belongsTo(models.G5Member, { foreignKey: 'mb_id', targetKey: 'mb_id' });
    }
  };

  return G5Point;
};

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const G5NewWin = sequelize.define('G5NewWin', {
    nw_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nw_division: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'both',
    },
    nw_device: {
      type: DataTypes.STRING(10), // ENUM in DB ('both', 'pc', 'mobile') but string is safer for model
      allowNull: false,
      defaultValue: 'both',
    },
    nw_begin_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: '0000-00-00 00:00:00',
    },
    nw_end_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: '0000-00-00 00:00:00',
    },
    nw_disable_hours: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    nw_left: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    nw_top: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    nw_height: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    nw_width: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    nw_subject: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    nw_content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    nw_content_html: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
    },
  }, {
    tableName: 'g5_new_win',
    timestamps: false,
    underscored: true,
  });

  return G5NewWin;
};

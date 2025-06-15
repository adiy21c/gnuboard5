const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const G5WriteNotice = sequelize.define('G5WriteNotice', {
    wr_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    wr_num: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    wr_reply: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: '',
    },
    wr_parent: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    wr_is_comment: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
    },
    wr_comment: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    wr_subject: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
    },
    wr_content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    wr_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
    },
    mb_id: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    wr_datetime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    wr_hit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    ca_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
  }, {
    tableName: 'g5_write_notice',
    timestamps: false,
    underscored: true,
  });

  return G5WriteNotice;
};

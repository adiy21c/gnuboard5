const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const G5WriteFree = sequelize.define('G5WriteFree', {
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
    wr_name: { // Author's name if not a member
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
    },
    mb_id: { // Member's ID if a member
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
    ca_name: { // Category
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    // Add other fields if needed for display, like wr_option for secret posts, etc.
  }, {
    tableName: 'g5_write_free',
    timestamps: false,
    underscored: true, // This will map field names like wr_subject to wrSubject by default if not specified
    // If you want to keep the underscore names in JS objects too, you might not need underscored: true,
    // or ensure your queries and results handle it. For Sequelize, `underscored: true` is mostly for auto-mapping.
    // Let's be explicit with field names in define to avoid issues or rely on underscored: true
    // and ensure attribute names in `fetchLatest` match the JS object keys (e.g. post.wr_subject).
  });

  return G5WriteFree;
};

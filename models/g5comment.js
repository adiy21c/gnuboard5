const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const G5Comment = sequelize.define('G5Comment', {
    co_id: { // Comment ID
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    bo_table: { // Board table name this comment belongs to
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    wr_id: { // Parent write ID (the post this comment is for)
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    co_parent: { // Parent comment ID (if it's a reply to another comment)
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    co_is_reply: { // Indicates if this comment is a reply to another comment
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
    },
    co_depth: { // Depth of the comment reply (0 for top-level, 1 for first reply, etc.)
      type: DataTypes.INTEGER, // Or STRING if GNUBoard uses string representation like 'A', 'AA'
      allowNull: false,
      defaultValue: 0,
    },
    mb_id: {
      type: DataTypes.STRING(20),
      allowNull: true, // Can be null for guest comments
    },
    co_name: { // Guest commenter name
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    co_password: { // Guest commenter password (hashed)
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    co_content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    co_html: { // Whether content is HTML (1) or TEXT (0) or BBCode etc.
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
    },
    co_option: { // Secret comment, etc.
        type: DataTypes.STRING(255), // ENUM or SET in DB
        allowNull: true,
    },
    co_datetime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    co_ip: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
    },
    // Standard G5 fields like co_1, co_2 ... co_10 can be added if needed
  }, {
    tableName: 'g5_comment', // Default table name, can be overridden if comments are per-board
    timestamps: false,
    underscored: true,
  });

  G5Comment.associate = (models) => {
    // A comment belongs to a member (author)
    if (models.G5Member) {
        G5Comment.belongsTo(models.G5Member, { foreignKey: 'mb_id', targetKey: 'mb_id' });
    }
    // Potentially, a comment belongs to a specific G5Write post.
    // However, since G5Write models are dynamic (G5WriteFree, G5WriteNotice),
    // a direct Sequelize association here is tricky.
    // It's often handled at query time by matching wr_id and bo_table.
  };

  return G5Comment;
};

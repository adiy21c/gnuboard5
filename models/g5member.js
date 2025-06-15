const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const G5Member = sequelize.define('G5Member', {
    mb_no: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    mb_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    mb_password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    mb_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    mb_nick: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    mb_nick_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: '0000-00-00',
    },
    mb_email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    mb_homepage: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
    },
    mb_level: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
    },
    mb_sex: {
      type: DataTypes.CHAR(1),
      allowNull: false,
      defaultValue: '',
    },
    mb_birth: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
    },
    mb_tel: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
    },
    mb_hp: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
    },
    mb_certify: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: '',
    },
    mb_adult: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
    },
    mb_dupinfo: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
    },
    mb_zip1: {
      type: DataTypes.CHAR(3),
      allowNull: false,
      defaultValue: '',
    },
    mb_zip2: {
      type: DataTypes.CHAR(3),
      allowNull: false,
      defaultValue: '',
    },
    mb_addr1: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
    },
    mb_addr2: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
    },
    mb_addr3: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
    },
    mb_addr_jibeon: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
    },
    mb_signature: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    mb_recommend: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
    },
    mb_point: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    mb_today_login: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: '0000-00-00 00:00:00',
    },
    mb_login_ip: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
    },
    mb_datetime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: '0000-00-00 00:00:00',
    },
    mb_ip: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
    },
    mb_leave_date: {
      type: DataTypes.STRING(8),
      allowNull: false,
      defaultValue: '',
    },
    mb_intercept_date: {
      type: DataTypes.STRING(8),
      allowNull: false,
      defaultValue: '',
    },
    mb_email_certify: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: '0000-00-00 00:00:00',
    },
    mb_email_certify2: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
    },
    mb_memo: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    mb_lost_certify: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    mb_mailling: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
    },
    mb_sms: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
    },
    mb_open: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
    },
    mb_open_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: '0000-00-00',
    },
    mb_profile: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    mb_memo_call: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
    },
    mb_memo_cnt: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    mb_scrap_cnt: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    mb_1: { type: DataTypes.STRING(255), allowNull: false, defaultValue: '' },
    mb_2: { type: DataTypes.STRING(255), allowNull: false, defaultValue: '' },
    mb_3: { type: DataTypes.STRING(255), allowNull: false, defaultValue: '' },
    mb_4: { type: DataTypes.STRING(255), allowNull: false, defaultValue: '' },
    mb_5: { type: DataTypes.STRING(255), allowNull: false, defaultValue: '' },
    mb_6: { type: DataTypes.STRING(255), allowNull: false, defaultValue: '' },
    mb_7: { type: DataTypes.STRING(255), allowNull: false, defaultValue: '' },
    mb_8: { type: DataTypes.STRING(255), allowNull: false, defaultValue: '' },
    mb_9: { type: DataTypes.STRING(255), allowNull: false, defaultValue: '' },
    mb_10: { type: DataTypes.STRING(255), allowNull: false, defaultValue: '' },
  }, {
    tableName: 'g5_member',
    timestamps: false,
    underscored: true,
  });

  return G5Member;
};

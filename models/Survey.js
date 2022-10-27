const { Model, DataTypes } = require('sequelize');

const sequelize = require('../config/connection.js');

class Survey extends Model {}

Survey.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      survey_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          isNumeric: true
        }
      },
      company_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'company',
          key: 'id',
          unique: false
        }
      }
    },
    {
      sequelize,
      timestamps: false,
      freezeTableName: true,
      underscored: true,
      modelName: 'survey',
    }
  );

  module.exports = Survey;
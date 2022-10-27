// import models
const Survey = require('./Survey');
const Company = require('./Company');



// Survey belongsTo Company
Survey.belongsTo(Company, {
    foreignKey: 'company_id',
    onDelete: 'CASCADE',
  })

// Company have many Surveys
Company.hasMany(Survey, {
    foreignKey: 'company_id',
    onDelete: 'CASCADE',
  })


module.exports = { Survey, Company };
const router = require('express').Router();
const surveyRoutes = require('./survey-routes');
const companyRoutes = require('./company-routes');

router.use('/surveys', surveyRoutes);
router.use('/companies', companyRoutes);

module.exports = router;
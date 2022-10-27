const router = require('express').Router();
const { Survey } = require('../../models');

// The `/api/surveys` endpoint

router.post('/', async(req, res) => {
    // create a new survey
    try {
        const surveyData = await Survey.create(req.body);
        res.status(200).json(surveyData);
    } catch (err) {
        res.status(400).json(err);
    }
});

router.get('/', async(req, res) => { 
    // find all surveys
    try {
    const surveyData = await Survey.findAll({
    });
    res.status(200).json(surveyData);
    } catch (err) {
    res.status(500).json.apply(err);
    }
  
});

router.get('/:id', async(req, res) => {
    // find one survey by its `id` value
    try {
      const surveyData = await Survey.findByPk(req.params.id, {
      });
  
      if (!surveyData) {
        res.status(404).json({ message: 'No survey found with this id!' });
        return;
      }
  
      res.status(200).json(surveyData);
    } catch (err) {
      res.status(500).json(err);
    }
  });


router.delete('/:id', async(req, res) => {
    // delete a survey by its `id` value
    try {
        const surveyData = await Survey.destroy({
            where: {
             id: req.params.id
            }
        });
        if (!surveyData) {
            res.status(404).json({ message: 'No survey found with this id!' });
            return;
        }
        res.status(200).json(surveyData);
        } catch (err) {
            res.status(400).json(err);
        }
});



module.exports = router;
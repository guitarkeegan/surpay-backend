  //set up post route for company
router.post('/', async(req, res) => {
  // create a new company
  try {
      const companyData = await Company.create(req.body);
      res.status(200).json(companyData);
  } catch (err) {
      res.status(400).json(err);
  }
});

router.get('/', async(req, res) => { 
    // find all companies
    // be sure to include its associated surveys
    try {
    const companyData = await Company.findAll({
      include: [{ model: Survey }]
    });
    res.status(200).json(companyData);
  } catch (err) {
    res.status(500).json.apply(err);
  }
  
  });
  
  router.get('/:id', async(req, res) => {
    // find one company by its `id` value
    // be sure to include its associated Surveys
  
    try {
      const companyData = await Company.findByPk(req.params.id, {
        include: [{ model: Survey}]
      });
  
      if (!companyData) {
        res.status(404).json({ message: 'No company found with this id!' });
        return;
      }
  
      res.status(200).json(companyData);
    } catch (err) {
      res.status(500).json(err);
    }
  });
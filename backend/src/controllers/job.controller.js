const jobService = require('../services/job.service');

const createJob = async (req, res) => {
  try {
    const {
      title,
      company,
      location,
      description,
      requirements,
      salary
    } = req.body;

    const job = await jobService.createJob({
      title,
      company,
      location,
      description,
      requirements,
      salary,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: job
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Failed to create job'
    });
  }
};

const getAllJobs = async (req, res) => {
  try {
    const jobs = await jobService.getAllJobs();

    res.json({
      success: true,
      data: jobs
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs'
    });
  }
};

module.exports = {
  createJob,
  getAllJobs
};
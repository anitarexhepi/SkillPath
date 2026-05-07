const jobRepository = require('../repositories/job.repository');

const createJob = async (jobData) => {
  const jobId = await jobRepository.createJob(jobData);

  return {
    id: jobId,
    ...jobData
  };
};

const getAllJobs = async () => {
  return await jobRepository.getAllJobs();
};

module.exports = {
  createJob,
  getAllJobs
};
import fetch from 'node-fetch';
import * as action from '@actions/core';
import dotenv from 'dotenv';
import * as github from '@actions/github';

dotenv.config();

const headers: any = {
  'Content-Type': 'application/json',
  'X-Holistics-Key': process.env.HOLISTICS_API_KEY,
}

const HOLISTICS_HOST = process.env.HOLISTICS_HOST ?? 'https://secure.holistics.io';
const HOLISTICS_API_HOST = `${HOLISTICS_HOST}/api/v2`;

async function submitValidate (commitOid: string, branchName: string) {
  const url = `${HOLISTICS_API_HOST}/aml_studio/projects/submit_validate`;
  const result = await fetch(url, {
    method: 'post',
    headers,
    body: JSON.stringify({
      commit_oid: commitOid,
      branch_name: branchName,
    }),
  });
  const status = result.status;
  const respond = await result.json();
  console.log(JSON.stringify(respond, null, 2));
  if (status === 200) {
    return respond.job;
  }
  process.exit(1);
}

async function getJobResut (jobId: number) {
  const url = `${HOLISTICS_API_HOST}/jobs/${jobId}/result`;
  const result = await fetch(url, {
    method: 'get',
    headers,
  });
  return await result.json();
}

async function polling(jobId: number) {
  return new Promise((resolve, reject) => {
    const i = setInterval(async () => {
      console.log('Polling validation result ...');
      const result = await getJobResut(jobId);
      console.log(`Status: ${result.status}`);
      if (result.status === 'success' || result.status === 'failure') {
        clearInterval(i);
        resolve(result);
      }
    }, 2000);
  });
}

async function run () {
  try {
    const ref = github.context.ref;
    const headRef = github.context.payload.pull_request?.head.ref;
    const branchName = headRef ?? ref.replace('refs/heads/', '');
    console.log(`Branch name: ${branchName}`);
    const sha = github.context.sha;
    const headSha = github.context.payload.pull_request?.head.sha;
    const commitOid = headSha ?? sha;
    console.log(`Commit OID: ${commitOid}`);
    const job = await submitValidate(commitOid, branchName);
    const result = await polling(job.id) as any;
    console.log(JSON.stringify(result, null, 2));
    if (result.status === 'failure') {
      action.error(result);
      process.exit(1);
    }
    const jobResult = result.result;
    if (jobResult.data.status !== 'success') {
      action.error(result);
      process.exit(1);
    }
    action.setOutput('result', result);
  } catch (error: any) {
    action.error(error);
    process.exit(1);
  }
}
run();

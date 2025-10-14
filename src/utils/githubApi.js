/**
 * GitHub API utilities for updating family data
 */

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Get the current file content and SHA from GitHub
 */
export const getFileFromGitHub = async (owner, repo, path, token) => {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Update a file in GitHub repository
 */
export const updateFileInGitHub = async (owner, repo, path, content, message, token, sha) => {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`;

  // Encode content to base64
  const encodedContent = btoa(unescape(encodeURIComponent(content)));

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      content: encodedContent,
      sha, // Required to update existing file
      branch: 'main',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to update file: ${error.message || response.statusText}`);
  }

  return await response.json();
};

/**
 * Save family data to GitHub repository
 */
export const saveFamilyDataToGitHub = async (familyMembers, config) => {
  const { owner, repo, token } = config;
  const filePath = 'src/data/familyData.json';

  try {
    // Step 1: Get current file to obtain SHA
    console.log('Fetching current file from GitHub...');
    const currentFile = await getFileFromGitHub(owner, repo, filePath, token);

    // Step 2: Prepare new content
    const newContent = JSON.stringify({ familyMembers }, null, 2);

    // Step 3: Update file in GitHub
    console.log('Updating file in GitHub...');
    const commitMessage = `Update family data via web interface

Updated by: Family Tree Web App
Date: ${new Date().toISOString()}

🤖 Auto-commit via GitHub API`;

    const result = await updateFileInGitHub(
      owner,
      repo,
      filePath,
      newContent,
      commitMessage,
      token,
      currentFile.sha
    );

    console.log('Successfully updated GitHub repository:', result.commit.html_url);
    return {
      success: true,
      commitUrl: result.commit.html_url,
      message: 'Changes saved to GitHub! Netlify will deploy updates in 2-3 minutes.',
    };
  } catch (error) {
    console.error('Error saving to GitHub:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to save to GitHub. See console for details.',
    };
  }
};

/**
 * Validate GitHub configuration
 */
export const validateGitHubConfig = (config) => {
  const { owner, repo, token } = config;

  if (!owner || !repo || !token) {
    return {
      valid: false,
      message: 'GitHub configuration is incomplete. Please check your environment variables.',
    };
  }

  return { valid: true };
};

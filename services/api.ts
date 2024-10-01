const apiUrl = process.env.EXPO_PUBLIC_API_URL;

export const getRepositories = async () => {
  const url = `${apiUrl}/search/repositories?q=Q`;
  const headers = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};
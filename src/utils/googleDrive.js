const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';
const DRIVE_FILE_NAME = 'habitos-backup.json';

let tokenClient = null;
let accessToken = localStorage.getItem('habitos_google_token') || null;
let gapiInitialized = false;
let gisInitialized = false;

export const initGoogleApi = () => {
  return new Promise((resolve) => {
    if (gapiInitialized && gisInitialized) {
      resolve();
      return;
    }

    const script1 = document.createElement('script');
    script1.src = 'https://apis.google.com/js/api.js';
    script1.onload = () => {
      window.gapi.load('client', async () => {
        try {
          await window.gapi.client.init({
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
          });
          gapiInitialized = true;
          checkReady();
        } catch (err) {
          console.error('GAPI init error:', err);
          gapiInitialized = true;
          checkReady();
        }
      });
    };
    script1.onerror = () => {
      gapiInitialized = true;
      checkReady();
    };
    document.body.appendChild(script1);

    const script2 = document.createElement('script');
    script2.src = 'https://accounts.google.com/gsi/client';
    script2.onload = () => {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/drive.file',
        callback: (response) => {
          if (response.access_token) {
            accessToken = response.access_token;
            localStorage.setItem('habitos_google_token', accessToken);
          }
        },
      });
      gisInitialized = true;
      checkReady();
    };
    script2.onerror = () => {
      gisInitialized = true;
      checkReady();
    };
    document.body.appendChild(script2);

    const checkReady = () => {
      if (gapiInitialized && gisInitialized) {
        resolve();
      }
    };
  });
};

export const signInWithGoogle = () => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error('Google API not initialized. Please refresh the page.'));
      return;
    }

    tokenClient.callback = async (response) => {
      if (response.access_token) {
        accessToken = response.access_token;
        localStorage.setItem('habitos_google_token', accessToken);
        resolve({ access_token: response.access_token });
      } else if (response.error) {
        reject(new Error(response.error_description || 'Failed to sign in with Google'));
      } else {
        reject(new Error('Failed to get access token'));
      }
    };

    try {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (error) {
      reject(error);
    }
  });
};

export const signOutGoogle = () => {
  if (accessToken) {
    try {
      window.google.accounts.oauth2.revoke(accessToken, () => {});
    } catch (e) {
      console.warn('Could not revoke token:', e);
    }
  }
  accessToken = null;
  localStorage.removeItem('habitos_google_token');
  localStorage.removeItem('habitos_google_user');
  localStorage.removeItem('habitos_last_sync');
};

export const isSignedIn = () => {
  return !!accessToken;
};

export const saveToGoogleDrive = async (data) => {
  if (!accessToken) {
    throw new Error('Not signed in to Google. Please sign in first.');
  }

  const jsonContent = JSON.stringify(data, null, 2);

  try {
    let existingFileId = null;
    
    try {
      const searchResponse = await window.gapi.client.drive.files.list({
        q: `name = '${DRIVE_FILE_NAME}' and trashed = false`,
        fields: 'files(id, name)',
      });
      
      if (searchResponse.result.files && searchResponse.result.files.length > 0) {
        existingFileId = searchResponse.result.files[0].id;
      }
    } catch (searchErr) {
      console.warn('Could not search for existing file:', searchErr);
    }

    if (existingFileId) {
      const response = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=media`,
        {
          method: 'PUT',
          headers: { 
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: jsonContent,
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update file: ${response.status} - ${errorText}`);
      }
      
      return existingFileId;
    } else {
      const metadataObj = {
        name: DRIVE_FILE_NAME,
        mimeType: 'application/json',
      };
      
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadataObj)], { type: 'application/json' }));
      form.append('file', new Blob([jsonContent], { type: 'application/json' }));

      const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` },
          body: form,
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create file: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      return result.id;
    }
  } catch (error) {
    console.error('Error saving to Google Drive:', error);
    
    if (error.message && (error.message.includes('401') || error.message.includes('Token expired'))) {
      accessToken = null;
      localStorage.removeItem('habitos_google_token');
      throw new Error('Session expired. Please sign in again.');
    }
    
    throw new Error(getReadableError(error));
  }
};

export const loadFromGoogleDrive = async () => {
  if (!accessToken) {
    throw new Error('Not signed in to Google. Please sign in first.');
  }

  try {
    const searchResponse = await window.gapi.client.drive.files.list({
      q: `name = '${DRIVE_FILE_NAME}' and trashed = false`,
      fields: 'files(id, name)',
    });

    if (!searchResponse.result.files || searchResponse.result.files.length === 0) {
      return null;
    }

    const fileId = searchResponse.result.files[0].id;

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      if (response.status === 401) {
        accessToken = null;
        localStorage.removeItem('habitos_google_token');
        throw new Error('Session expired. Please sign in again.');
      }
      throw new Error(`Failed to load file: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading from Google Drive:', error);
    
    if (error.message && error.message.includes('401')) {
      accessToken = null;
      localStorage.removeItem('habitos_google_token');
    }
    
    throw new Error(getReadableError(error));
  }
};

export const getUserInfo = async () => {
  if (!accessToken) {
    const stored = localStorage.getItem('habitos_google_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {}
    }
    return null;
  }
  
  try {
    const response = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    
    if (!response.ok) {
      return null;
    }
    
    const userInfo = await response.json();
    localStorage.setItem('habitos_google_user', JSON.stringify(userInfo));
    return userInfo;
  } catch (error) {
    console.error('Error getting user info:', error);
    return null;
  }
};

function getReadableError(error) {
  if (error.message && error.message.includes('403')) {
    return 'Access denied. Please check that Google Drive API is enabled in Google Cloud Console.';
  }
  if (error.message && error.message.includes('401')) {
    return 'Session expired. Please sign in again.';
  }
  if (error.message) {
    return error.message;
  }
  return 'An error occurred. Please try again.';
}

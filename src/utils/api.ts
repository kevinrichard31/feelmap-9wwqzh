// utils/api.ts
const API_URL = import.meta.env.VITE_API_URL;

// Define the TimeRangeKey type
export type TimeRangeKey = 'last_7_days' | 'this_month' | 'last_month' | 'last_3_months' | 'today' | 'all';

export const saveEmotion = async (
  userId: string,
  userPassword: string,
  emotionDetails: {
    latitude: number,
    longitude: number,
    emotionName: string,
    description: string,
    city?: string,
    amenity?: string,
    type?: string
  }
) => {
  console.log(userId + ' sent');
  try {
    const response = await fetch(API_URL + '/emotions/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        userId,
        userPassword,
        ...emotionDetails // Inclut city et amenity dans le corps de la requête
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save emotion');
    }

    return await response.json(); // Retourne les données de réponse
  } catch (error) {
    console.error('Error saving emotion:', error);
    return null; // Retourne null en cas d'erreur
  }
};


export const createUser = async (locale: string | null) => {
  try {
    const response = await fetch(API_URL + '/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',  // Ajout de l'en-tête Content-Type pour indiquer que les données sont au format JSON
      },
      credentials: 'include',
      body: JSON.stringify({
        'lang_id': locale
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create user');
    }

    const data = await response.json();
    return data; // Retourne l'ID de l'utilisateur
  } catch (error) {
    console.error('Error creating user:', error);
    return null; // Retourne null en cas d'erreur
  }
};

// Fonction pour récupérer les émotions du mois en cours
export const getMonthlyEmotions = async (userId: string, month: number, year: number) => {
  try {
    const response = await fetch(API_URL + `/emotions?userId=${userId}&month=${month}&year=${year}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch emotions');
    }

    return await response.json(); // Retourne les émotions du mois
  } catch (error) {
    console.error('Error fetching emotions:', error);
    return [];
  }
};

export const getDailyEmotions = async (userId: string, date: string) => {
  try {
    const response = await fetch(API_URL + `/emotions/day?userId=${userId}&date=${date}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch emotions');
    }

    return await response.json(); // Retourne les émotions du jour
  } catch (error) {
    console.error('Error fetching emotions:', error);
    return [];
  }
};

export async function checkUserExists(userId: string) {
  try {
    const response = await fetch(API_URL + `/users/${userId}`);
    const data = await response.json();
    return data.exists; // Supposons que l'API renvoie un objet { exists: true/false }
  } catch (error) {
    console.error('Error checking user existence:', error);
    return false; // En cas d'erreur, considérons que l'utilisateur n'existe pas
  }
}

// Récupérer toutes les émotions d'un utilisateur avec id et password
export const getAllEmotionsWithAuth = async (id: string, password: string) => {
  try {
    const response = await fetch(API_URL + `/emotions/all?id=${id}&password=${password}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch all emotions');
    }

    return await response.json(); // Retourne toutes les émotions
  } catch (error) {
    console.error('Error fetching all emotions:', error);
    return []; // Retourne un tableau vide en cas d'erreur
  }
};

export const verifyPassword = async (password: string) => {
  try {
    const response = await fetch(API_URL + '/verify-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ password })
    });

    if (!response.ok) {
      throw new Error('Failed to verify password');
    }

    const data = await response.json();
    return data.userId; // Retourne l'identifiant de l'utilisateur si le mot de passe est valide
  } catch (error) {
    console.error('Error verifying password:', error);
    return null; // Retourne null en cas d'erreur
  }
};

export const deleteUserData = async (password: string) => {
  try {
    const response = await fetch(API_URL + '/users/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete user data');
    }

    return await response.json(); // Retourne la réponse du serveur, par exemple, un message de succès
  } catch (error) {
    console.error('Error deleting user data:', error);
    return null; // Retourne null en cas d'erreur
  }
};

// Fonction pour récupérer la ville depuis l'API api-bdc.net
export const getCityFromBDC = async (latitude: number, longitude: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://api-bdc.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch city from BDC');
    }

    const data = await response.json();
    return data.city || 'Lieu inconnu'; // Retourne la ville ou "Lieu inconnu" si non disponible
  } catch (error) {
    console.error('Error fetching city from BDC:', error);
    return 'Erreur lors de la récupération de la ville';
  }
};

// Fonction pour récupérer l'amenity et le type depuis l'API Nominatim
export const getAmenityFromNominatim = async (latitude: number, longitude: number): Promise<{ amenity: string, type: string }> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch amenity from Nominatim');
    }

    const data = await response.json();

    // Récupérer l'amenity et le type
    const amenity = data.address?.amenity || ''; // Nom du magasin ou de l'endroit
    const type = data.type || ''; // type, fast_food, restaurant...

    return { amenity, type }; // Retourne un objet avec les deux valeurs
  } catch (error) {
    console.error('Error fetching amenity and type from Nominatim:', error);
    return { amenity: '', type: '' }; // Retourne un objet avec des chaînes vides en cas d'erreur
  }
};

export const getPlaceTypes = async (): Promise<Array<{ id: number, name: string }>> => {
  try {
    const response = await fetch(API_URL + '/place-types', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch place types');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching place types:', error);
    return [];
  }
};

export const updatePlaceType = async (
  emotionId: string,
  userId: string,
  userPassword: string,
  placeTypeId: number
) => {
  try {
    console.log('ON LANCE LE PATCH')
    const response = await fetch(`${API_URL}/emotions/${emotionId}/place-type`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        userId,
        userPassword,
        placeTypeId, // Le type de lieu à mettre à jour
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update place type');
    }

    return await response.json(); // Retourne les données mises à jour
  } catch (error) {
    console.error('Error updating place type:', error);
    return null; // Retourne null en cas d'erreur
  }
};


export const getLastEmotion = async (userId: string, userPassword: string) => {
  try {
    console.log(userId);
    console.log(userPassword);
    const response = await fetch(`${API_URL}/emotions/last?userId=${userId}&userPassword=${userPassword}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch last emotion');
    }

    return await response.json(); // Retourne la dernière émotion
  } catch (error) {
    console.error('Error fetching last emotion:', error);
    return null; // Retourne null en cas d'erreur
  }
};


export const getAggregatedScores = async (userId: string, timeRange: TimeRangeKey) => {
  try {
    let apiUrl = `${API_URL}/users/${userId}/aggregated-scores`;

    switch (timeRange) {
      case 'last_7_days':
        apiUrl += '/last_7_days';
        break;
      case 'this_month':
        apiUrl += '/this_month';
        break;
      case 'last_month':
        apiUrl += '/last_month';
        break;
      case 'last_3_months':
        apiUrl += '/last_3_months';
        break;
      case 'today':
        apiUrl += '/today';
        break;
      case 'all':
        apiUrl += '/all'; // You might need to adjust the backend to handle 'all' appropriately.  If it defaults to all, this case might not be necessary.
        break;
      default:
        console.warn(`Invalid timeRange: ${timeRange}.  Fetching last 7 days by default.`);
        apiUrl += '/last_7_days'; // Default to last 7 days if timeRange is invalid
        break;
    }

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch aggregated scores. Status: ${response.status}`);
    }

    return await response.json(); // Retourne les scores agrégés
  } catch (error) {
    console.error('Error fetching aggregated scores:', error);
    return null; // Retourne null en cas d'erreur
  }
};

export const getUserTraits = async (userId: string, timeRange?: TimeRangeKey) => {
  try {
    let apiUrl = `${API_URL}/users/${userId}/traits`;
    if (timeRange) {
      // Append timeRange as a query parameter
      apiUrl += `?timeRange=${timeRange}`;
    }

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user traits. Status: ${response.status}`);
    }

    return await response.json(); // Retourne les traits de l'utilisateur
  } catch (error) {
    console.error('Error fetching user traits:', error);
    return null; // Retourne null en cas d'erreur
  }
};
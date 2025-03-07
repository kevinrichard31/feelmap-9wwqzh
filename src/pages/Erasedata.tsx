'use client';
import React, { useEffect, useState } from 'react';

import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonText,
  IonAlert,
  useIonRouter
} from '@ionic/react';
import { arrowBackOutline, warningOutline } from 'ionicons/icons';
import { deleteUserData } from '../utils/api'; // Adjust the path as needed

const Erasedata: React.FC = () => {
  const router = useIonRouter();
  const [feelmapId, setFeelmapId] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false); // Control the alert

  useEffect(() => {
    // Retrieve credentials from localStorage
    const storedPassword = localStorage.getItem('password');
    const userId = localStorage.getItem('userId');
    setPassword(storedPassword);
    setFeelmapId(userId);
  }, []);

  const handleDelete = async () => {
    setShowAlert(false); // Close the alert

    if (password) {
      try {
        const result = await deleteUserData(password); // Call the API to delete data
        if (result) {
          setMessage('Vos données ont été supprimées avec succès.');
          setError(null); // Clear any previous errors
          localStorage.removeItem('password'); // Optionally clear localStorage
          localStorage.removeItem('userId');
        } else {
          setError('Erreur lors de la suppression des données.');
          setMessage(null); // Clear any previous messages
        }
      } catch (err) {
        setError('Erreur lors de la suppression des données.');
        setMessage(null); // Clear any previous messages
        console.error("Error during data deletion:", err);
      }
    } else {
      setError('Aucun mot de passe trouvé.');
      setMessage(null);
    }
  };

  const handleCancel = () => {
    router.push('/params'); // Redirect to /params
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButton slot="start" fill="clear" onClick={() => router.goBack()}>
            <IonIcon icon={arrowBackOutline} />
          </IonButton>
          <IonTitle>Effacer mes données</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div style={{ padding: '15px' }}>
          <IonText>
            <p>Si vous procédez, vos données seront supprimées instantanément. Êtes-vous sûr de vouloir continuer ?</p>
          </IonText>

          {error && <IonText color="danger"><p>{error}</p></IonText>}
          {message && <IonText color="success"><p>{message}</p></IonText>}

          <IonButton expand="full" color="danger" onClick={() => setShowAlert(true)}>
            Oui, supprimer mes données
          </IonButton>

          <IonButton expand="full" onClick={handleCancel}>
            Non, annuler
          </IonButton>

          <IonText>
            <p className='info'>Si vous avez un autre identifiant et que vous souhaitez supprimer vos données, restaurez les données avec votre autre identifiant puis supprimez vos données.</p>
          </IonText>

          <IonAlert
            isOpen={showAlert}
            onDidDismiss={() => setShowAlert(false)}
            header={'Confirmation de suppression'}
            message={'Êtes-vous sûr de vouloir supprimer vos données ? Cette action est irréversible.'}
            buttons={[
              {
                text: 'Annuler',
                role: 'cancel',
                cssClass: 'secondary',
                handler: () => {
                  console.log('Suppression annulée');
                }
              }, {
                text: 'Supprimer',
                handler: () => {
                  handleDelete();
                }
              }
            ]}
          />

        </div>
      </IonContent>
    </IonPage>
  );
};

export default Erasedata;
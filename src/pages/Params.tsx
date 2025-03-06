import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonItem, IonLabel, IonButton, IonIcon, IonText } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import { FirebaseAnalytics } from '@capacitor-community/firebase-analytics';
import { useEffect, useState } from 'react';
import { arrowBackOutline, copyOutline } from 'ionicons/icons';
import { Link, useHistory } from 'react-router-dom';
import styles from './Params.module.css';

const Params: React.FC = () => {
  const [feelmapId, setFeelmapId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const history = useHistory();

  useEffect(() => {
    FirebaseAnalytics.setScreenName({
      screenName: 'params',
      nameOverride: 'paramsView',
    });

    const id = localStorage.getItem('password');
    setFeelmapId(id);

  }, []);

  const handleCopy = () => {
    if (feelmapId) {
      navigator.clipboard.writeText(feelmapId)
        .then(() => {
          setCopyMessage('Identifiant copié !');
          setTimeout(() => setCopyMessage(null), 2000);
        })
        .catch(err => {
          setError('Erreur lors de la copie');
        });
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButton slot="start" fill="clear" onClick={() => history.goBack()}>
            <IonIcon icon={arrowBackOutline} />
          </IonButton>
          <IonTitle>Paramètres</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>

        <div style={{ padding: '15px' }}>
          <div className={styles['describe-title']}>Paramètres :</div>

          <div className={styles['container-id-copy']}>
            <div className={styles['container-id']}>
              <div className={styles['describe-title2']}>Mon identifiant Feelmap</div>
              <div className={styles['feelmap-id']}>{feelmapId ? feelmapId : 'Non disponible'}</div>
            </div>
            <IonButton className={styles['button-copy'] } onClick={handleCopy}>
              Copier
              <IonIcon icon={copyOutline} slot="end" />
            </IonButton>
          </div>

          {copyMessage && <div className={styles['copy-message']}>{copyMessage}</div>}
          {error && <div className={styles['error-message']}>{error}</div>}

          <IonText>
            <p>Cet identifiant est votre clé d'accès à vos données. Notez-le quelque part pour les retrouver, les modifier ou les supprimer à tout moment.</p>
          </IonText>


          <IonItem button onClick={() => history.push('/restoredata')}>
            <IonLabel className={styles['describe-title']}>Récupérer mes données</IonLabel>
          </IonItem>

          <IonItem button onClick={() => history.push('/erasedata')}>
            <IonLabel className={styles['describe-title']}>Effacer mes données</IonLabel>
          </IonItem>
        </div>
        <hr />

        <IonText style={{ padding: '15px' }}>
          <p>Les données sont stockées dans les cookies de votre navigateur principal. Si vous les supprimez, vous devrez restaurer vos données à l’aide de votre identifiant.</p>
        </IonText>
        <hr />

        <div style={{ padding: '15px' }}>
          <IonItem button onClick={() => history.push('/params/confidentialite')}>
            <IonLabel className={styles['describe-title']}>Politique de confidentialité</IonLabel>
          </IonItem>
          <IonItem button onClick={() => history.push('/params/utilisation')}>
            <IonLabel className={styles['describe-title']}>Conditions d’utilisation</IonLabel>
          </IonItem>
          <IonItem button onClick={() => history.push('/params/permission')}>
            <IonLabel className={styles['describe-title']}>Permissions</IonLabel>
          </IonItem>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Params;
import React, { useEffect, useState } from 'react';
import './restoredata.css'; // Ensure this CSS file is in your project

import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonText,
    useIonRouter
} from '@ionic/react';
import { arrowBackOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom'; // Correct import for Ionic

// Assuming verifyPassword is in a separate file (adjust the path)
import { verifyPassword } from '../utils/api'; // Adjust path as needed


const Restoredata: React.FC = () => {
    // const history = useHistory();  // Access to Ionic's router
    const router = useIonRouter();
    const [feelmapId, setFeelmapId] = useState<string | null>(null);
    const [password, setPassword] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [copyMessage, setCopyMessage] = useState<string | null>(null);
    const history = useHistory();

    useEffect(() => {
        // Retrieve ID from localStorage on component mount
        const id = localStorage.getItem('userId');
        setFeelmapId(id);
    }, []);

    const handlePasswordSubmit = async () => {
        if (!password) {
            setError('Un identifiant est requis.');
            return;
        }

        try {
            const userId = await verifyPassword(password); // Assuming this returns a user ID
            if (userId) {
                localStorage.setItem('userId', userId);
                localStorage.setItem('password', password);  // Store password *after* successful validation

                setMessage('Compte restauré.');
                setError(null);
                setFeelmapId(userId);
            } else {
                setError('Identifiant invalide.');
                setMessage(null);
            }
        } catch (err) {
            setError('Une erreur est survenue. Veuillez réessayer.');
            setMessage(null);
            console.error("Error during password verification:", err);  // Log the error for debugging
        }
    };

    const handleCopy = () => {
        if (feelmapId) {
            navigator.clipboard.writeText(feelmapId)
                .then(() => {
                    setCopyMessage('Identifiant copié !');
                    setTimeout(() => setCopyMessage(null), 2000);
                })
                .catch(err => {
                    setError('Erreur lors de la copie');
                    console.error("Error copying to clipboard:", err); // Log clipboard errors
                });
        }
    };



    return (
        <IonPage>

            <IonContent fullscreen>
            
                <div style={{ padding: '15px' }}>
                <img src="/images/back.svg" alt="Retour" onClick={() => history.goBack()} />
                <div className='describe-title'>Récupérer mes données</div><br />
                    <IonText>
                        <p>Entrez votre identifiant pour restaurer vos données. Une fois validé, vous retrouverez toutes vos informations sauvegardées.</p>
                    </IonText>

                    <IonItem>
                        <IonLabel>Identifiant</IonLabel>
                        <IonInput
                            type="text"  // Or "password" if appropriate
                            placeholder="Saisissez votre identifiant"
                            value={password}
                            onIonChange={(e) => setPassword(e.detail.value!)}
                        />
                    </IonItem>

                    <IonButton expand="full" onClick={handlePasswordSubmit}>
                        Valider
                    </IonButton>

                    {message && <IonText color="success"><p>{message}</p></IonText>}
                    {error && <IonText color="danger"><p>{error}</p></IonText>}
                    {copyMessage && <IonText color="primary"><p>{copyMessage}</p></IonText>}
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Restoredata;
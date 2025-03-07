'use client';
import React, { useEffect, useState } from 'react';
// import './permission.css';
import { IonContent, IonPage } from '@ionic/react';
import { Link, useHistory } from 'react-router-dom';


const Permission: React.FC = () => {
  const history = useHistory();
  return (
    <IonPage>
      <IonContent className="ion-padding">
      <img src="/images/back.svg" alt="Retour"onClick={() => history.goBack()}/>
        <div style={{ padding: '15px' }}>
          <div className='describe-title'>Permissions</div>
          <div>Pour vous offrir la meilleure expérience possible, Feelmap requiert certaines permissions sur votre appareil. Vous pouvez consulter et modifier ces autorisations à tout moment.</div>
          <div className='describe-title'>1. Localisation</div>

          <ul>
            <li><strong>Pourquoi ?</strong> : Feelmap utilise votre localisation pour cartographier vos émotions en fonction des lieux où vous les avez exprimées.</li>
            <li><strong>Comment ?</strong> : Votre position est anonymisée et utilisée uniquement pour afficher vos émotions sur la carte. Ces informations ne sont pas partagées avec des tiers.</li>
            <li>Gérer cette permission : Vous pouvez activer ou désactiver cette permission via les paramètres de votre navigateur.</li>
          </ul>

          <div className='describe-title'>2. Stockage local (Local Storage)</div>
          <ul>
            <li><strong>Pourquoi ?</strong> : Nous stockons vos données d'émotions et de localisation dans le local storage pour vous permettre de consulter votre historique émotionnel dans un calendrier.</li>
            <li><strong>Comment ?</strong> : Ces données sont enregistrées localement et transmises à nos serveurs pour permettre de vous authentifier, ce sont des données obligatoires.</li>
          </ul>

          <div><strong>Note</strong> : La désactivation de certaines permissions peut limiter les fonctionnalités de l'application, comme la possibilité de visualiser vos émotions sur la carte ou de consulter votre historique.</div>
        </div>
      </IonContent>
    </IonPage>

  );
};

export default Permission;

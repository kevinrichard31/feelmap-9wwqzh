'use client';
import React, { useEffect, useState } from 'react';
import './utilisation.css';
import { Link, useHistory } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';

const Utilisation: React.FC = () => {
    const history = useHistory();

    return (
        <IonPage>
            <IonContent>
            <div style={{ padding: '15px' }}>
            <img src="/images/back.svg" alt="Retour" onClick={() => history.goBack()} />
            <div className='describe-title'>Conditions d’utilisation</div><br />
            <div>Dernière mise à jour : 17/09/2024</div><br />

            <div>Bienvenue sur Feelmap ! Avant de commencer à utiliser notre application, nous vous invitons à lire attentivement ces conditions d’utilisation. En accédant à l’application et en l’utilisant, vous acceptez les présentes conditions.</div>

            <div className='describe-title'>1. Objectif de l’application</div>
            <div>Feelmap vous permet de suivre et de cartographier vos émotions au fil de la journée. Grâce à cette application, vous pouvez :</div>
            <ul>
                <li>Sélectionner et enregistrer l’émotion que vous ressentez à un moment donné.</li>
                <li>Décrire ces émotions pour les garder en mémoire.</li>
                <li>Visualiser vos émotions dans un calendrier interactif pour suivre votre historique émotionnel jour après jour.</li>
                <li>Consulter une carte qui affiche la localisation des émotions que vous avez ressenties dans la journée.</li>
            </ul>

            <div className='describe-title'>2. Utilisation de l’application</div>
            <div>Lors de chaque session, l’application vous invite à :</div>
            <ol>
                <li>Sélectionner une émotion parmi plusieurs propositions pour indiquer comment vous vous sentez.</li>
                <li>Décrire votre émotion de manière libre si vous le souhaitez, afin de préciser ce que vous ressentez.</li>
                <li>Les émotions que vous enregistrez sont stockées et associées à un emplacement géographique (si la localisation est activée), de manière anonymisée, et apparaissent sur une carte de vos émotions.</li>
                <li>Votre historique émotionnel est enregistré dans un calendrier, vous permettant de consulter vos émotions et leur localisation au fil du temps.</li>
            </ol>

            <div className='describe-title'>3. Collecte et stockage des données</div>
            <div>L’utilisation de l’application implique la collecte des données suivantes :</div>

            <div>
                <ul>
                    <li>Données de localisation anonymisées  : Lorsque vous postez une émotion, l’emplacement est associé de façon anonymisée à votre téléphone, mais ne permet pas de vous identifier personnellement.</li>
                    <li>Contenu des émotions : Les émotions que vous sélectionnez et les descriptions que vous rédigez sont enregistrées dans un calendrier et reliées à une adresse IP et un mot de passe anonymisés.</li>
                </ul>
            </div>

            <div>Les données collectées sont stockées dans les cookies de votre navigateur principal. Pour plus d’informations sur la manière dont nous traitons vos données, veuillez consulter notre politique de confidentialité.</div>

            <div className='describe-title'>4. Responsabilité de l’utilisateur</div>
            <div>En utilisant Feelmap, vous vous engagez à :</div>
            <ul>
                <li>Utiliser l’application de manière conforme aux présentes conditions.</li>
                <li>Fournir des informations sincères concernant vos émotions, sans y inclure de contenu offensant, illégal ou nuisible pour autrui.</li>
                <li>Ne pas tenter de contourner les mécanismes de sécurité de l’application ou d’accéder aux données d’autres utilisateurs.</li>
            </ul>

            <div className='describe-title'>5. Suppression de vos données</div>
            <div>À tout moment, vous pouvez choisir de supprimer vos données émotionnelles en accédant aux paramètres de l’application. Une fois la suppression demandée, vos données seront effacées dans un délai de 30 jours. Pour plus de détails, consultez notre politique de confidentialité.</div>

            <div className='describe-title'>6. Propriété intellectuelle</div>
            <div>Tout le contenu et les fonctionnalités disponibles dans Feelmap (y compris les graphiques, textes, fonctionnalités et interfaces) sont protégés par des droits d’auteur et ne peuvent être utilisés sans notre autorisation préalable.</div>

            <div className='describe-title'>7. Limitation de responsabilité</div>
            <div>Feelmap est fourni à titre informatif et ne remplace en aucun cas un suivi médical ou psychologique. Nous ne garantissons pas que l’utilisation de l’application sera ininterrompue ou exempte d’erreurs. Nous déclinons toute responsabilité en cas de perte de données ou de tout dommage lié à l’utilisation de l’application.</div>

            <div className='describe-title'>8. Modifications des conditions d’utilisation</div>
            <div>Nous nous réservons le droit de modifier ces conditions d’utilisation à tout moment. Si des changements significatifs sont apportés, nous vous en informerons via l’application. En continuant à utiliser l’application après de telles modifications, vous acceptez les nouvelles conditions.</div>

            <div className='describe-title'>9. Contact</div>
            <div>Pour toute question relative à ces conditions d’utilisation, vous pouvez nous contacter à l’adresse suivante : contact@feelmap-app.com</div>
        </div>
            </IonContent>
        </IonPage>

    );
};

export default Utilisation;

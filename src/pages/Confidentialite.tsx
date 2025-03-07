import React from 'react';
import { IonContent, IonHeader, IonPage, IonToolbar, IonTitle, IonBackButton, IonButtons } from '@ionic/react';
import { arrowBackOutline } from 'ionicons/icons';
import { IonIcon } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import styles from './Confidentialite.module.css';

const Confidentialite: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      <IonContent className="ion-padding">
      <img src="/images/back.svg" alt="Retour" onClick={() => history.goBack()} />
        <div className={styles['describe-title']}>
          Politique de Confidentialité
        </div>
        <div className={styles['describe-title']}>Dernière mise à jour : 07/03/2025</div>
        <div>
          Chez Feelmap, nous respectons votre vie privée et nous nous engageons à protéger vos données personnelles. Cette politique de confidentialité explique comment nous collectons, utilisons et stockons vos informations dans le cadre de l'utilisation de notre application.
        </div>

        <div className={styles['describe-title']}>1. Collecte des données</div>
        <div>Lorsque vous utilisez Feelmap, nous collectons et traitons les types de données suivants :</div>
        <div>
          Données de localisation anonymisées : Nous collectons des informations sur l'endroit où vous publiez vos émotions. Ces données de localisation sont anonymisées et ne sont pas directement liées à votre identité. Elles sont stockées en fonction du téléphone, mais ne peuvent pas être reliées personnellement à vous.
        </div>
        <div>
          Contenu rédigé et publié : Lorsque vous écrivez et postez vos émotions sur Feelmap, le contenu de vos publications est collecté. Ce contenu est anonymisé et relié à une adresse IP ainsi qu'à un mot de passe pour vous permettre de retrouver vos publications. Aucun identifiant personnel direct (comme nom ou email) n'est associé à ces données.
        </div>

        {/* Le reste du contenu reste inchangé */}
        <div className={styles['describe-title']}>2. Stockage des données</div>
        <div>
          Les données collectées sont stockées dans les cookies du navigateur principal de votre appareil. Cela signifie que vos données sont conservées localement et que vous êtes le seul à avoir accès à celles-ci depuis votre appareil. Les cookies stockent également les adresses IP et mots de passe anonymisés qui permettent de relier vos publications sans divulguer votre identité.
        </div>
        <div>Durée de conservation des cookies : Les cookies utilisés pour stocker vos données sur votre appareil sont conservés aussi longtemps que vous n'effacez pas manuellement les cookies de votre navigateur ou que ceux-ci ne sont pas automatiquement effacés par le navigateur lui-même. Cette durée dépend des paramètres de votre navigateur, que vous pouvez consulter et modifier à tout moment.</div>

        <div className={styles['describe-title']}>3. Utilisation des données</div>
        <div>Les données collectées sont utilisées pour :</div>
        <div>Localiser vos publications d'émotions sur la carte afin que vous et les autres utilisateurs puissiez visualiser les émotions en fonction des lieux, tout en respectant l'anonymat.</div>
        <div>Permettre la consultation et la gestion de vos publications via l'adresse IP et le mot de passe anonymisés.</div>
        <div>Consulter l'historique de vos émotions dans un calendrier : Vos émotions sont enregistrées jour après jour, ce qui vous permet de les consulter dans un calendrier interactif retraçant votre historique émotionnel.</div>
        <div>Nous ne partageons pas vos données personnelles avec des tiers, et celles-ci ne sont pas utilisées à des fins commerciales ou publicitaires.</div>

        <div className={styles['describe-title']}>4. Accès à vos données</div>
        <div>Vous avez le droit de consulter les données que nous avons collectées. Si vous souhaitez obtenir une copie complète de vos données (émotions, descriptions, et localisations), vous pouvez en faire la demande par email à l'adresse suivante : contact@feelmap-app.com</div>
        <div>Nous vous fournirons un fichier lisible par machine (par exemple, un fichier CSV ou JSON) contenant vos données dans un délai raisonnable après réception de votre demande.</div>

        <div className={styles['describe-title']}>5. Durée de conservation des données</div>
        <div>Les données anonymisées (émotions, descriptions et localisations) sont conservées tant que vous utilisez l'application. les données sont conservées tant que l'utilisateur n'a pas demandé leur suppression</div>

        <div className={styles['describe-title']}>6. Suppression des données</div>
        <div>Vous pouvez également à tout moment demander la suppression de vos données via les paramètres de l'application. Une fois la suppression demandée, vos données seront définitivement effacées dans un délai de 30 jours.</div>

        <div className={styles['describe-title']}>Pour supprimer des données associées à un autre compte, veuillez nous contacter à l'adresse suivante : contact@feelmap-app.com</div>

        <div className={styles['describe-title']}>7. Sécurité des données</div>
        <div>Nous prenons des mesures de sécurité raisonnables pour protéger vos informations contre tout accès non autorisé ou toute altération. Cependant, puisque les données sont stockées dans les cookies de votre navigateur, la sécurité de ces données dépend également de la sécurité de votre appareil.</div>

        <div className={styles['describe-title']}>8. Modifications de la politique de confidentialité</div>
        <div>Nous pouvons mettre à jour cette politique de confidentialité de temps à autre. Si des modifications sont apportées, nous vous en informerons via l'application ou par tout autre moyen approprié.</div>

        <div className={styles['describe-title']}>9. Nous contacter</div>
        <div>Pour toute question ou préoccupation concernant cette politique de confidentialité, vous pouvez nous contacter à l'adresse suivante : contact@feelmap-app.com</div>
      </IonContent>
    </IonPage>
  );
};

export default Confidentialite;
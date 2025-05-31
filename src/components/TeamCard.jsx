import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone, faCity, faUser, faPaperPlane, faMessage } from '@fortawesome/free-solid-svg-icons';
import styles from '../css/TeamCard.module.css';

function TeamCard({ team, userId, teamId, showProfile, showRequestForm }) {
  const chatLink = userId ? `/ChatPage/${userId}/${team.id}` : `/ChatPage/${teamId}/${team.id}`;

  return (
    <div className={styles.userCard}>
      <div className={styles.cardBg}></div>
      <div className={styles.cardContent}>
        <div className={styles.userHeader}>
          <div className={styles.userAvatar}>
            <img src={team.logo} alt={team.leader} />
          </div>
          <div className={styles.userInfo}>
            <h3>{team.name}</h3>
            <p>Team</p>
          </div>
        </div>
       
        <br />
        <div className={styles.userDetails}>
           <div className={styles.detailItem}>
           <i className="fa-solid fa-envelope"></i>
          <span>{team.email}</span>
        </div>
          <div className={styles.detailItem}>
             <i className="fa-solid fa-phone"></i>
            <span>{team.phone}</span>
          </div>
          <div className={styles.detailItem}>
            <i className="fa-solid fa-city"></i>
            <span>{team.city}</span>
          </div>
        </div>
        <div className={styles.cardActions}>
          <div className={styles.actionRow}>
            <button
              className={`${styles.actionBtn} ${styles.btnProfile}`}
              onClick={() => showProfile(team.email)}
            >
              <i className="fa-solid fa-user"></i>  See Full Profile
            </button>
            <button
              className={`${styles.actionBtn} ${styles.btnRequest}`}
              onClick={() => showRequestForm(team.email)}
            >
              <i className="fa-solid fa-paper-plane"></i> Send Request
            </button>
          </div>
          <div className={styles.actionCentered}>
            <Link to={chatLink} className={`${styles.actionBtn} ${styles.btnChat}`}>
              <i className="fa-solid fa-message"></i> Start Chat
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeamCard;
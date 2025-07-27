import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useDateTime } from '../../hooks/useDateTime';
import { selectCurrentUser, updateUserStatus } from '../../store/slices/userSlice';
import styles from './UserStatus.module.css';

const UserStatus = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const currentDateTime = useDateTime();

  return (
    <div className={styles.userStatus}>
      <div className={styles.userInfo}>
        <h3>{currentUser.username}</h3>
        <p className={styles.datetime}>{currentDateTime}</p>
        <p className={styles.status}>
          Status: <span className={styles[currentUser.status]}>{currentUser.status}</span>
        </p>
      </div>
      <div className={styles.actions}>
        <button 
          onClick={() => dispatch(updateUserStatus('away'))}
          className={styles.statusButton}
        >
          Set Away
        </button>
        <button 
          onClick={() => dispatch(updateUserStatus('online'))}
          className={styles.statusButton}
        >
          Set Online
        </button>
      </div>
    </div>
  );
};

export default UserStatus;
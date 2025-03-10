import { useState } from 'react';
import React from 'react';
import Modal from 'react-modal';
import { ParallaxSimulation } from '../parallaxSimulation/ParallaxSimulation';
import styles from './StarDetailsModal.module.scss';

export const StarDetailsModal = ({ star, modalIsOpen, setIsOpen }) => {

    const closeModal = () => {
        setIsOpen(false);
    }

    const getMagDescr = (mag) => {
        if (mag <= 3) {
            return "One of the brightest stars in your sky! You can see it easily, even with some city lights.";
        } else if (mag <=4) {
            return "Bright and visible to the naked eye, but easier to see in a darker area.";
        } else if (mag <= 5) {
            return "You can see it without a telescope, but you'll need a dark sky away from city lights.";
        } else  {
            return "Visible only on a really dark night—you may even need binoculars!";
        }
    }

    const distanceToLY = (dist) => {
        return dist * 3.262;
    }
    
    return (
        <Modal isOpen={modalIsOpen} 
            onRequestClose={closeModal} contentLabel="Star details" 
            onCloseModal={closeModal} appElement={document.getElementById('root')}
            className={styles.modalContent} overlayClassName={styles.modalOverlay}
        >
            <div className={styles.modalHeader}>
                <button onClick={closeModal}>Close</button>
                <h2>{star.name || star.hip_id}</h2>
            </div>
            <p>Magnitude: {star.mag}, {getMagDescr(star.mag)}</p>
            <p>Distance: {distanceToLY(star.dist).toFixed(2)} Light Years</p>
            <ParallaxSimulation distance_pc={star.dist} px={star.plx} color={star.color} />
        </Modal>
    );
};
import React from 'react';
import "../modals.css";
import "./tryAgainModal.css";

const TryAgainModal = ({isLoading, onStart}) => {

    const onStartLocal = () => {
        if(onStart) {
            onStart();
        }
    }


    return (
        <div className='modal-outer-container'>
            <div className="modal-inner-container">
                <div className="modal-title">Try Again!</div>
                <button className='primary-btn-modal' onClick={onStartLocal}>{isLoading ? "Starting..." : "Start Game"}</button>
            </div>
        </div>
    )
}

export default TryAgainModal
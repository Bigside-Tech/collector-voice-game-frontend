import {useState} from 'react';
import "../modals.css";
import "./gameSettingsModal.css";

const GameSettingsModal = ({onStart, initialGridLines, initialSpeed, isLoading}) => {
    const [gridLines, setGridLines] = useState(initialGridLines);
    const [speed, setSpeed] = useState(initialSpeed);

    const onChangeGridLines = (event) => {
        setGridLines(event.target.value ? Math.floor(parseInt(event.target.value)) : null);
    }

    const onChangeSpeed = (event) => {
        setSpeed(event.target.value ? Math.floor(parseInt(event.target.value)) : null);
    }

    const onStartLocal = () => {
        if(onStart) {
            onStart(gridLines, speed);
        }
    }

    return (
    <div className='modal-outer-container'>
        <div className="modal-inner-container">
            <div className="modal-title">Game Settings</div>
            <form className='modal-form-container' onSubmit={onStartLocal}>
                <div className="each-field-container">
                    <div className="field-label">Grid Lines* :</div>
                    <div className="field-input">
                        <input type='number'value={gridLines ? gridLines : ''} placeholder='20' onChange={onChangeGridLines}/>
                    </div>
                </div>
                <div className="each-field-container">
                    <div className="field-label">Speed* (in ms) :</div>
                    <div className="field-input">
                        <input type='number' value={speed ? speed : ''} placeholder='500' onChange={onChangeSpeed}/>
                    </div>
                </div>
            </form>
            <button className='primary-btn-modal' disabled={!gridLines || !speed} onClick={onStartLocal}>{isLoading ? "Starting..." : "Start Game"}</button>
        </div>
    </div>
    )
}

export default GameSettingsModal
import { useState, useEffect } from "react";
import { getAllHighScores } from "../../utils/localStorage.util";
import { getMilliSeconds, getSeconds, getMinutes } from "../../utils/timer.util";
import "../modals.css";
import "./highScoresModal.css";

const HighScoresModal = ({isLoading, onStart}) => {
    const [highScores, setHighScores] = useState({});

    useEffect(() => {
        let highScoresFromStorage = getAllHighScores();
        if(highScoresFromStorage){
            setHighScores(highScoresFromStorage);
        }
        // console.log("all high scores: ", getAllHighScores());
    }, []);

    const onStartLocal = () => {
        if(onStart) {
            onStart();
        }
    }

    return (
    <div className='modal-outer-container'>
        <div className="modal-inner-container">
            <div className="modal-title">High Scores</div>
            <div className="high-scores-container">
                <div className="each-high-score-row header">
                    <div className="high-score-field">Sn.</div>
                    <div className="high-score-field">Grid Lines</div>
                    <div className="high-score-field">Best Time</div>
                </div>
                {Object.keys(highScores).map((key, index) => (
                    <div className="each-high-score-row">
                        <div className="high-score-field">{ index + 1 }</div>
                        <div className="high-score-field">{ key }</div>
                        <div className="high-score-field">
                            <span>
                                {getMinutes(highScores[key])}:
                            </span>
                            <span>
                                {getSeconds(highScores[key])}.
                            </span>
                            <span>
                                {getMilliSeconds(highScores[key])}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            <button className='primary-btn-modal' onClick={onStartLocal}>{isLoading ? "Re-Starting..." : "Re-Start Game"}</button>
        </div>
    </div>
    )
}

export default HighScoresModal
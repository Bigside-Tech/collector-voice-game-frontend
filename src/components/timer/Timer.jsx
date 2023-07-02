import { useState, useEffect } from 'react';
import "./timer.css";
import { getMilliSeconds, getSeconds, getMinutes } from '../../utils/timer.util';

const Timer = ({isActive, isPaused, onPause, onTime}) => {
  const [time, setTime] = useState(0);

    useEffect(() => {
        let interval = null;

        if (isActive && isPaused === false) {
            interval = setInterval(() => {
                setTime((time) => time + 10);
            }, 10);
        } else {
            if(!isActive) {
                setTime(0);
            }
            if(isPaused && onPause) {
                onPause(time);
            }
            clearInterval(interval);
        }
        return () => {
            clearInterval(interval);
        };
    }, [isActive, isPaused]);

    useEffect(() => {
        if(onTime) {
            onTime(time);
        }
    }, [time]);

  return (
    <span className="timer">
        <span>
            {getMinutes(time)}:
        </span>
        <span>
            {getSeconds(time)}.
        </span>
        <span>
            {getMilliSeconds(time)}
        </span>
    </span>
  )
}

export default Timer;
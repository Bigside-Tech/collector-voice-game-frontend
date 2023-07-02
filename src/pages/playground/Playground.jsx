import { useState, useEffect, useCallback, useRef } from 'react';
import './playground.css';
import { generateRandomInts } from '../../utils/randomNumbers.util';
import Timer from '../../components/timer/Timer';
import { saveHighScore } from '../../utils/localStorage.util';
import { connectWebsocket, stopMicrophoneCapture } from '../../services/microphone-capture';
import GameSettingsModal from '../../modals/gameSettingsModal/GameSettingsModal';
import TryAgainModal from '../../modals/tryAgainModal/TryAgainModal';
import HighScoresModal from '../../modals/highScoresModal/HighScoresModal';

const DEFAULT_LAST_COMMMAND = "---";

const STATES = {
    DEFAULT: 'default',
    COLLECTOR: 'collector',
    FLOWER: 'flower'
}

const MODALS = {
    SETTINGS: "settings",
    TRY_AGAIN: "tryAgain",
    HIGH_SCORES: "highScores"
}

const Playground = () => {
  const [collector, setCollector] = useState({x: 0, y: 0}); // x-rows, y-columns
  const [cells, setCells] = useState({});
  const [isGameOver, setIsGameOver] = useState(false);
  const [flowersCount, setFlowersCount] = useState({total: 0, collected: 0});
  const [lastCommand, setLastCommand] = useState(DEFAULT_LAST_COMMMAND);
  const [columnsCount, setColumnsCount] = useState(null);

  const [isListening, setIsListening] = useState(false);
  const [isLoadingListening, setIsLoadingListening] = useState(false);
  const moveInterval = useRef(null);
  const directionRef = useRef(null);
  const isGameActiveRef = useRef(false);
  const isGoRef = useRef(false);
  const collectorRef = useRef({x: 0, y: 0});
  const columnsCountRef = useRef(null);
  const intervalMiliSeconds = useRef(null);
  const timeRef = useRef(0);

  const [showModal, setShowModal] = useState(MODALS.SETTINGS);

  // collector useEffect and collecting the flowers logic.
  useEffect(() => {
    let collectorKey = `${collector.x}-${collector.y}`;
    console.log("collectorKey: ", collectorKey);
    if(cells[collectorKey] === STATES.FLOWER) {
        setFlowersCount((prev) => ({...prev, collected: ++prev.collected}));
        setCells((prev) => ({...prev, [collectorKey]: STATES.DEFAULT}));
    }
  }, [collector]);

  useEffect(() => {
    collectorRef.current = collector;
  }, [collector]);

  useEffect(() => {
    columnsCountRef.current = columnsCount;
  }, [columnsCount]);

  const onStopCapture = useCallback((isStopCapturing) => {
    console.log("isStopCapturing: ", isStopCapturing);
  }, []);

  // game over handling
  const gameOverHandling = useCallback((isWon) => {
    isGoRef.current = false;
        clearInterval(moveInterval.current);
        moveInterval.current = null;
    console.log("isWon: ", isWon);
    setIsGameOver(true);
    stopMicrophoneCapture(onStopCapture);
    if(isWon) {
        saveHighScore({[columnsCountRef.current]: timeRef.current});
        setShowModal(MODALS.HIGH_SCORES);
    }else{
        setShowModal(MODALS.TRY_AGAIN);
    }
  }, []);

  // check game over
  useEffect(() => {
    if(flowersCount.total && (flowersCount.collected === flowersCount.total)) {
        gameOverHandling(true);
    }
  }, [flowersCount]);


  // TODO: can move it to a util file
  const isValidMessage = useCallback((message) => {
    return message && (message === 'go' || message === 'stop' || message === 'up' || message === 'down' || message === 'left' || message === 'right');
  }, []);

  const onShowLoader = useCallback((isLoading) => {
    console.log("isLoading: ", isLoading);
  }, []);

  const onStartCapture = useCallback((isCapturing) => {
    console.log("isCapturing: ", isCapturing);
    setIsListening(isCapturing);
    if(isCapturing) {
        setIsLoadingListening(false);
    }
  }, []);

  const onMessage = (message) => {
    //console.log("message: ", message);
    handleOnMessage(message);
  };

  const isCollided = () => {
    let isCollided = false;
    switch(directionRef.current) {
        case 'right':
            if(collectorRef.current.y + 1 >= columnsCountRef.current) {
                isCollided = true;
            }
            break;
        case 'left':
            if(collectorRef.current.y - 1 < 0) {
                isCollided = true;
            }
            break;
        case 'up':
            if(collectorRef.current.x - 1 < 0) {
                isCollided = true;
            }
            break;
        case 'down':
            if(collectorRef.current.x + 1 >= columnsCountRef.current) {
                isCollided = true;
            }
            break;
    }
    return isCollided;
  };

  const moveInDirection = useCallback(() => {
    if(isCollided()){
        gameOverHandling(false);
        return;
    }
    switch(directionRef.current) {
        case 'right':
            setCollector((prev) => ({...prev, y: ++prev.y}));
            break;
        case 'left':
            setCollector((prev) => ({...prev, y: --prev.y}));
            break;
        case 'up':
            setCollector((prev) => ({...prev, x: --prev.x}));
            break;
        case 'down':
            setCollector((prev) => ({...prev, x: ++prev.x}));
            break;
    }
  }, [directionRef.current, collector]);

  const handleOnMessage = (message) => {
    console.log("message: ", message);
    // when game started with first click
    if(isValidMessage(message)) {
        if(!isGameActiveRef.current) {
            isGameActiveRef.current = true;
        }
        setLastCommand(message);
        if(message === 'up' || message === 'down' || message === 'left' || message === 'right') {
            directionRef.current = message;
        }
    }

    if(message === 'stop') {
        isGoRef.current = false;
        clearInterval(moveInterval.current);
        moveInterval.current = null;
    }else if(message === 'go' || isGoRef.current) {
        isGoRef.current = true;
        if(directionRef.current) {
            if(!moveInterval.current) {
                moveInDirection();
                moveInterval.current = setInterval(() => {
                    moveInDirection();
                }, intervalMiliSeconds.current);
            }
        }
    }
  }

  const tryAgain = () => {
    restartGame(null, true);
  }

  const restartGame = (event, isTryGainLocal = false) => {
    if(!isTryGainLocal) {
        setShowModal(MODALS.SETTINGS);
    }

    // Reset Game flags
    isGameActiveRef.current = false;
    directionRef.current = null;
    isGoRef.current = false;
    stopMicrophoneCapture(onStopCapture);
    setIsLoadingListening(false);
    setIsListening(false);
    setIsGameOver(false);

    // Reset Last Command
    setLastCommand(DEFAULT_LAST_COMMMAND);

    // start listening
    if(isTryGainLocal) {
        startListening();
    }
  }

  const startGame = () => {
    // Logic for random flowers and collector positions
    const flowersCount = Math.floor((1 / 8) * (columnsCount * columnsCount));
    setFlowersCount({total: flowersCount, collected: 0});
    let randomInts = generateRandomInts(flowersCount + 1, (columnsCount * columnsCount));
    //console.log("randomInts: ", randomInts);

    // Logic for setting initial cell states
    const cellObj = {};
    let currentIndex = 0;
    for(var i = 0; i < columnsCount; i++) {
        for(var j = 0; j < columnsCount; j++) {
            if(randomInts.size > 0 && randomInts.has(currentIndex)){
                if(randomInts.size === Math.ceil(flowersCount / 2)){
                    setCollector({x: i, y: j});
                    cellObj[`${i}-${j}`] = STATES.DEFAULT;    
                }else{
                    cellObj[`${i}-${j}`] = STATES.FLOWER;
                }
                randomInts.delete(currentIndex);
            }else{
                cellObj[`${i}-${j}`] = STATES.DEFAULT;
            }
            ++currentIndex;
        }
    }
    //console.log("cellObj: ", cellObj);
    setCells(cellObj);
  }

  useEffect(() => {
    if(columnsCount && isListening) {
        setShowModal(null);
        startGame();
    }
  }, [columnsCount, isListening]);

  const onGameStart = (gridLinesLocal, speedLocal) => {
    //console.log("girdLinesLocal: ", gridLinesLocal);
    //console.log("speedLocal: ", speedLocal);
    setColumnsCount(gridLinesLocal);
    intervalMiliSeconds.current = speedLocal;
    startListening();
  }

  const onGameOver = (time) => {
    console.log("on game over: ", time);
  }

  const onTimeHandler = (time) => {
    timeRef.current = time;
  }

  const startListening = useCallback(() => {
    setIsLoadingListening(true);
    connectWebsocket(onShowLoader, onStartCapture, onMessage);
  }, []);

  return (
    <>
        {showModal ? (
            <>
                {showModal === MODALS.SETTINGS && (<GameSettingsModal onStart={onGameStart} initialGridLines={columnsCount} initialSpeed={intervalMiliSeconds.current} isLoading={isLoadingListening}/>)}
                {showModal === MODALS.TRY_AGAIN && (<TryAgainModal onStart={tryAgain} isLoading={isLoadingListening}/>)}
                {showModal === MODALS.HIGH_SCORES && (<HighScoresModal onStart={tryAgain} isLoading={isLoadingListening}/>)}
            </>
        ) : (
            <div className='playground-outer-container' tabIndex="0">
                <div className="playground-inner-container">
                    <div className="game-info-container">
                        <div className="elapsed-time-container">
                            Time: <Timer isActive={isGameActiveRef.current} isPaused={isGameOver} onPause={onGameOver} onTime={onTimeHandler} />
                        </div>
                        <div className="last-command-container">
                            {isListening ? (<>Last Command: <span className='last-command'>{lastCommand}</span></>) : (<button className="start-listening-button" onClick={startListening}>{isLoadingListening ? "Loading..." : "Start Listening"}</button>)}
                        </div>
                    </div>
                    <div className='playground-grid' style={{gridTemplateColumns: `repeat(${columnsCount}, 1fr)`, gridTemplateRows: `repeat(${columnsCount}, 1fr)`}}>
                        {Object.keys(cells).map((key, index) => {
                            let isFlowerItem = (cells[key] === STATES.FLOWER) ? true : false;
                            let collectorKey = `${collector.x}-${collector.y}`;
                            let isCollectorItem = (collectorKey === key) ? true : false;
                            return (
                                <div className={`grid-item ${isFlowerItem ? 'flower-item' : 'default-item'} ${isCollectorItem ? 'collector-item' : ''} ${(isCollectorItem && directionRef.current) ? directionRef.current : ''}`} key={index}></div>
                            )
                        }
                        )}
                    </div>
                    <div className="game-reset-container">
                        <button onClick={restartGame}>Reset</button>
                    </div>
                </div>
            </div>
        )}
    </>
  )
}

export default Playground;
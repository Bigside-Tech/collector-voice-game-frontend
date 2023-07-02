const HIGH_SCORE_KEY = "collectorGameHighScore";

const saveHighScore = (highScore) => {
    let highScores = JSON.parse(localStorage.getItem(HIGH_SCORE_KEY));
    if(highScores) {
        let highScoreGridLines = Object.keys(highScore)[0];
        if(highScores[highScoreGridLines]){
            if(highScore[highScoreGridLines] < highScores[highScoreGridLines]){
                highScores = {...highScores, ...highScore};        
            }
        }else{
            highScores = {...highScores, ...highScore};
        }
    }else{
        highScores = highScore;
    }
    localStorage.setItem(HIGH_SCORE_KEY, JSON.stringify(highScores));
}

const getAllHighScores = () => {
    let highScores = JSON.parse(localStorage.getItem(HIGH_SCORE_KEY));
    return highScores ? highScores : null;
}

export {
    saveHighScore,
    getAllHighScores
}
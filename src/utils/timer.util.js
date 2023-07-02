const getMinutes = (time) => ("0" + Math.floor((time / 60000) % 60)).slice(-2);

const getSeconds = (time) => ("0" + Math.floor((time / 1000) % 60)).slice(-2);

const getMilliSeconds = (time) => ("0" + ((time / 10) % 100)).slice(-2);

export {
    getMinutes,
    getSeconds,
    getMilliSeconds,
}
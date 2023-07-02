const generateRandomInts = (quantity, max) => {
    const set = new Set()
    while(set.size < quantity) {
      set.add(Math.floor(Math.random() * (max)))
    }
    return set;
}

export {
    generateRandomInts
}
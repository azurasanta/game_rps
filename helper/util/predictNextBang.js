const ntpClient = require('ntp-client');
const BangBetItem = require('../../model/BangBetItem');

const roomBets = new Map();
let timeoutIds = new Map();

const emitBangGuesses = (socket, room_Id) => {
  if (socket) {
    const roomBetsForRoom = roomBets.get(room_Id) || [];
    const bangs = roomBetsForRoom.map(bet => bet.bang);
    const socketName = `BANG_GUESSES_${room_Id}`;
    const elapsedTime = '';
    socket.emit(socketName, { bangs: bangs, elapsedTime });
    // console.log(`Sent data to socket ${socketName}:`, { bangs, elapsedTime });
  }
};

const predictAndEmit = async (bang_list, room, socket, room_Id) => {
  const nextBangPrediction = await predictNextBang(bang_list);
  const currentTime = await getCurrentTime();
  const newBet = new BangBetItem({
    room: room,
    bang: nextBangPrediction,
    created_at: currentTime
  });
  await newBet.save();

  const roomBetsForRoom = roomBets.get(room_Id) || [];

  // remove oldest item if max limit reached
  if (roomBetsForRoom.length >= 100) {
    roomBetsForRoom.shift();
  }

  roomBetsForRoom.push(newBet);
  roomBets.set(room_Id, roomBetsForRoom);

  emitBangGuesses(socket, room_Id);

  const timeoutId = setTimeout(
    () => predictAndEmit(bang_list, room, socket, room_Id),
    nextBangPrediction * 1000 + 7000
  );
  const timeoutIdsForRoom = timeoutIds.get(room_Id) || [];
  timeoutIdsForRoom.push(timeoutId);
  timeoutIds.set(room_Id, timeoutIdsForRoom);
};


const initializeRound = async (bang_list, room, socket, room_Id) => {
  // console.log("di")
  const nextBangPrediction = await predictNextBang(bang_list);

  const currentTime = await getCurrentTime();
  const newBet = new BangBetItem({
    room: room,
    bang: nextBangPrediction,
    created_at: currentTime
  });
  await newBet.save();

  const roomBetsForRoom = roomBets.get(room_Id) || [];
  roomBetsForRoom.push(newBet);
  roomBets.set(room_Id, roomBetsForRoom);

  emitBangGuesses(socket, room_Id);

  const timeoutId = setTimeout(
    () => predictAndEmit(bang_list, room, socket, room_Id),
    nextBangPrediction * 1000 + 7000
  );
  const timeoutIdsForRoom = timeoutIds.get(room_Id) || [];
  timeoutIdsForRoom.push(timeoutId);
  timeoutIds.set(room_Id, timeoutIdsForRoom);
};

const closeRoomSocket = (socket, room_Id) => {
  if (socket) {
    const socketName = `BANG_GUESSES_${room_Id}`;
    // socket.emit(socketName, { bangs: [], elapsedTime: '' });
    socket.disconnect(true);
    // console.log(`Closed socket ${socketName}`);
  }
};

const stopBangGame = (room_Id, socket) => {
  const timeoutIdsForRoom = timeoutIds.get(room_Id) || [];
  timeoutIdsForRoom.forEach(timeoutId => clearTimeout(timeoutId));
  timeoutIds.set(room_Id, []);
  roomBets.delete(room_Id);
  closeRoomSocket(socket, room_Id);
};


const predictNextBang = bangAmounts => {
  const uniqueValues = [...new Set(bangAmounts.map(bang => bang.bang))];

  if (uniqueValues.length === 1) {
    return uniqueValues[0];
  } else {
    const minValue = Math.min(...uniqueValues);
    const maxValue = Math.max(...uniqueValues);
    const rangeSize = Math.ceil((maxValue - minValue) / 200);

    const rangeCounts = {};
    bangAmounts.forEach((bang) => {
      const range = Math.floor((bang.bang - minValue) / rangeSize);
      rangeCounts[range] = rangeCounts[range] ? rangeCounts[range] + 1 : 1;
    });

    const totalCounts = bangAmounts.length;
    const rangeProbabilities = {};
    Object.keys(rangeCounts).forEach((range) => {
      const rangeProbability = rangeCounts[range] / totalCounts;
      rangeProbabilities[range] = rangeProbability;
    });

    let randomValue = Math.random();
    let chosenRange = null;
    Object.entries(rangeProbabilities).some(([range, probability]) => {
      randomValue -= probability;
      if (randomValue <= 0) {
        chosenRange = range;
        return true;
      }
      return false;
    });

    const rangeMinValue = parseInt(chosenRange) * rangeSize + minValue;
    const rangeMaxValue = Math.min(rangeMinValue + rangeSize, maxValue);

    const getRandomNumberInRange = (min, max) => {
      return Math.random() * (max - min) + min;
    };

    const randomChance = Math.random();
    const newValue = parseFloat(getRandomNumberInRange(1, 1.06).toFixed(2));
    const isChanged = randomChance <= 0.41;

    if (isChanged) {
      return newValue;
    } else {
      return parseFloat(getRandomNumberInRange(rangeMinValue, rangeMaxValue).toFixed(2));
    }
  }
};

const getCurrentTime = async () => {
  return new Promise((resolve, reject) => {
    ntpClient.getNetworkTime('time.google.com', 123, function(err, date) {
      if (err) {
        reject(err);
      } else {
        resolve(date);
      }
    });
  });
};

module.exports = {
  predictNextBang,
  getCurrentTime,
  emitBangGuesses,
  initializeRound,
  predictAndEmit,
  stopBangGame
};

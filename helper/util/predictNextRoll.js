const ntpClient = require('ntp-client');
const RollBetItem = require('../../model/RollBetItem');

const roomBets = new Map();
const timeoutIds = new Map();

const emitRollGuesses = (socket, room_Id) => {
  if (socket) {
    const roomBetsForRoom = roomBets.get(room_Id) || [];
    const rolls = roomBetsForRoom.map((bet) => bet.roll);
    const faces = roomBetsForRoom.map((bet) => bet.face);
    const socketName = `ROLL_GUESSES_${room_Id}`;
    const elapsedTime = '';
    socket.emit(socketName, { rolls, faces, elapsedTime });
  }
};

const predictAndEmit = async (roll_list, room, socket, room_Id, numRolls) => {
  const rolls = [];

  for (let i = 0; i < numRolls; i++) {
    const { roll: rollNumber, face: nextStateFace } = await predictNextRoll(roll_list);
    const currentTime = await getCurrentRollTime();
    const newBet = new RollBetItem({
      room,
      roll: rollNumber,
      face: nextStateFace,
      created_at: currentTime
    });
    await newBet.save();

    const roomBetsForRoom = roomBets.get(room_Id) || [];

    if (roomBetsForRoom.length >= 100) {
      roomBetsForRoom.shift();
    }

    roomBetsForRoom.push(newBet);
    roomBets.set(room_Id, roomBetsForRoom);

    rolls.push(rollNumber);
  }

  emitRollGuesses(socket, room_Id);

  const timeoutId = setTimeout(
    () => predictAndEmit(roll_list, room, socket, room_Id, numRolls),
    15000
  );
  const timeoutIdsForRoom = timeoutIds.get(room_Id) || [];
  timeoutIdsForRoom.push(timeoutId);
  timeoutIds.set(room_Id, timeoutIdsForRoom);
};

const initializeRollRound = async (roll_list, room, socket, room_Id) => {
  const numRolls = 20;
  const timeoutIdsForRoom = timeoutIds.get(room_Id) || [];
  timeoutIdsForRoom.forEach((timeoutId) => {
    clearTimeout(timeoutId);
  });
  timeoutIdsForRoom.length = 0;

  predictAndEmit(roll_list, room, socket, room_Id, numRolls);

  const timeoutId = setTimeout(
    () => initializeRollRound(roll_list, room, socket, room_Id),
    15000
  );
  timeoutIdsForRoom.push(timeoutId);
  timeoutIds.set(room_Id, timeoutIdsForRoom);
};

const closeRoomSocket = (socket, room_Id) => {
  if (socket) {
    const socketName = `ROLL_GUESSES_${room_Id}`;
    socket.disconnect(true);
  }
};

const stopRollGame = (room_Id, socket) => {
  const timeoutIdsForRoom = timeoutIds.get(room_Id) || [];
  timeoutIdsForRoom.forEach((timeoutId) => clearTimeout(timeoutId));
  timeoutIds.set(room_Id, []);
  roomBets.delete(room_Id);
  closeRoomSocket(socket, room_Id);
};

const predictNextRoll = (roll_list) => {
  const faces = ['R', 'P', 'S', 'W', 'B', 'Bu'];
  const sequence = roll_list.map((roll) => roll.face);
  const nextStates = {};

  faces.forEach((face) => {
    const count = sequence.filter((f, i) => i > 0 && sequence[i - 1] === face).length;
    nextStates[face] = count / Math.max(1, sequence.length - 1);
  });

  const allProbabilitiesOneOrZero = Object.values(nextStates).every((probability) => probability === 0 || probability === 1);

  if (allProbabilitiesOneOrZero) {
    const occurrences = {};
    roll_list.forEach((roll) => {
      occurrences[roll.face] = (occurrences[roll.face] || 0) + 1;
    });
    const randomIndex = Math.floor(Math.random() * roll_list.length);
    const nextState = roll_list[randomIndex];
    return { roll: nextState.roll, face: nextState.face };
  }

  let nextStateFace = '';
  const randomNum = Math.random();
  let cumulativeProbability = 0;

  for (const face in nextStates) {
    cumulativeProbability += nextStates[face];
    if (randomNum <= cumulativeProbability) {
      nextStateFace = face;
      break;
    }
  }

  let rollNumber;
  switch (nextStateFace) {
    case 'R':
    case 'P':
    case 'S':
      rollNumber = '2';
      break;
    case 'W':
      rollNumber = '14';
      break;
    case 'B':
      rollNumber = '1.5';
      break;
    case 'Bu':
      rollNumber = '7';
      break;
    default:
      rollNumber = '2';
  }

  return { roll: rollNumber, face: nextStateFace };
};

const getCurrentRollTime = async () => {
  return new Promise((resolve, reject) => {
    ntpClient.getNetworkTime('time.google.com', 123, function (err, date) {
      if (err) {
        reject(err);
      } else {
        resolve(date);
      }
    });
  })
  .catch((error) => {
    // Handle the error here
    console.error('Error retrieving network time:', error);
    throw error; // Rethrow the error to propagate it further if needed
  });
};


module.exports = {
  predictNextRoll,
  getCurrentRollTime,
  emitRollGuesses,
  initializeRollRound,
  predictAndEmit,
  stopRollGame
};

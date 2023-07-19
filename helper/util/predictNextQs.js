const calcWinChanceQs = (gameType, rounds) => {
  let probWin = (100 / gameType).toFixed(2);
  let probLose = (100 - probWin).toFixed(2);

  const freq = {};
  for (let i = 0; i < gameType; i++) {
    freq[i] = 0;
  }

  rounds.forEach((round) => {
    freq[round.qs]++;
  });

  const freqValues = Object.values(freq);
  const range = Math.max(...freqValues) - Math.min(...freqValues);

  const sensitivityFactor = (range / 100) * gameType;
  const adjustmentFactor = (range / gameType) * sensitivityFactor;
  probWin = (+probWin - adjustmentFactor).toFixed(2);
  probLose = (+probLose + adjustmentFactor).toFixed(2);

  return `${probWin}% - ${probLose}%`;
};

const predictNextQs = (qs_list, gameType) => {
  const options = [...Array(gameType).keys()];
  const transitionMatrix = {};
  const randomnessFactor = 0.15;

  options.forEach((option1) => {
    transitionMatrix[option1] = {};
    options.forEach((option2) => {
      transitionMatrix[option1][option2] = {};
      options.forEach((option3) => {
        transitionMatrix[option1][option2][option3] = {};
        options.forEach((option4) => {
          transitionMatrix[option1][option2][option3][option4] = 0;
        });
      });
    });
  });

  for (let i = 0; i < qs_list.length - 3; i++) {
    transitionMatrix[qs_list[i].qs][qs_list[i + 1].qs][qs_list[i + 2].qs][qs_list[i + 3].qs]++;
  }

  Object.keys(transitionMatrix).forEach((fromState1) => {
    Object.keys(transitionMatrix[fromState1]).forEach((fromState2) => {
      Object.keys(transitionMatrix[fromState1][fromState2]).forEach((fromState3) => {
        const totalTransitions = Object.values(transitionMatrix[fromState1][fromState2][fromState3]).reduce((a, b) => a + b);
        Object.keys(transitionMatrix[fromState1][fromState2][fromState3]).forEach((toState) => {
          transitionMatrix[fromState1][fromState2][fromState3][toState] /= totalTransitions;
        });
      });
    });
  });

  const winChance = calcWinChanceQs(gameType, qs_list);
  const targetProbability = 100 / gameType;
  const deviation = Math.abs(winChance - targetProbability);

  let currentState1 = qs_list[qs_list.length - 3].qs;
  let currentState2 = qs_list[qs_list.length - 2].qs;
  let currentState3 = qs_list[qs_list.length - 1].qs;

  const weightedOptions = [];
  Object.entries(transitionMatrix[currentState1][currentState2][currentState3]).forEach(([state, prob]) => {
    for (let i = 0; i < Math.floor(prob * 100); i++) {
      weightedOptions.push(state);
    }
  });

  let nextState;
  if (weightedOptions.length > 0) {
    nextState = weightedOptions[Math.floor(Math.random() * weightedOptions.length)];
  } else {
    nextState = options[Math.floor(Math.random() * options.length)];
  }

  if (Math.random() < randomnessFactor) {
    nextState = options[Math.floor(Math.random() * options.length)];
  }

  return nextState;
};

module.exports = {
  predictNextQs,
  calcWinChanceQs
};

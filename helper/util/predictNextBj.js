const predictNextBj = (bj_list, score) => {
    // Count the occurrences of each state transition
    const transitions = {
      stand: { stand: 0, hit: 0 },
      hit: { stand: 0, hit: 0 }
    };
  
    // Iterate over bj_list to count state transitions
    for (let i = 0; i < bj_list.length - 1; i++) {
      const currentState = bj_list[i].bj;
      const nextState = bj_list[i + 1].bj;
      transitions[currentState][nextState]++;
    }
  
    // Calculate transition probabilities
    const transitionProbabilities = {
      stand: {
        stand: transitions.stand.stand / (transitions.stand.stand + transitions.stand.hit),
        hit: transitions.stand.hit / (transitions.stand.stand + transitions.stand.hit)
      },
      hit: {
        stand: transitions.hit.stand / (transitions.hit.stand + transitions.hit.hit),
        hit: transitions.hit.hit / (transitions.hit.stand + transitions.hit.hit)
      }
    };
  
    // Calculate the average scores for "stand" and "hit" actions
    let standCount = 0;
    let standScoreSum = 0;
    let hitCount = 0;
    let hitScoreSum = 0;
  
    for (let i = 0; i < bj_list.length; i++) {
      if (bj_list[i].bj === 'stand') {
        standCount++;
        standScoreSum += bj_list[i].score;
      } else if (bj_list[i].bj === 'hit') {
        hitCount++;
        hitScoreSum += bj_list[i].score;
      }
    }
  
    const averageStandScore = standCount > 0 ? standScoreSum / standCount : 0;
    const averageHitScore = hitCount > 0 ? hitScoreSum / hitCount : 0;
  
    // Predict the next state based on the score, average scores, and transition probabilities
    const probabilityOfStand = transitionProbabilities.hit.stand;
    const probabilityOfHit = transitionProbabilities.stand.hit;
  
    const threshold = Math.random();
  
    if (score < averageStandScore * probabilityOfStand + averageHitScore * probabilityOfHit) {
      return 'hit';
    } else if (score > averageStandScore * (1 - probabilityOfStand) + averageHitScore * (1 - probabilityOfHit)) {
      return 'stand';
    } else if (threshold < probabilityOfHit) {
      return 'hit';
    } else {
      return 'stand';
    }
  };
  
  
  module.exports = {
    predictNextBj
  }
  
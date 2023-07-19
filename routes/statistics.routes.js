const express = require('express');

const router = express.Router();
const auth = require('../middleware/auth');

// User Model
const User = require('../model/User');
const Receipt = require('../model/Receipt');
const Transaction = require('../model/Transaction');
const GameLog = require('../model/GameLog');
const Room = require('../model/Room');
const GameType = require('../model/GameType');
const SystemSetting = require('../model/SystemSetting');
const RoomBoxPrize = require('../model/RoomBoxPrize');

getCommission = async () => {
  const commission = await SystemSetting.findOne({ name: 'commission' });
  if (commission?.value) {
    return parseFloat(commission.value);
  }

  return 0;
};

router.get('/get-customer-statistics', auth, async (req, res) => {
  try {
    const _id = req.query._id;

    // console.log('Fetching receipts...');
    const [receipts, transactions, gameLogs] = await Promise.all([
      Receipt.find({ user_id: _id }).select('payment_type amount'),
      Transaction.find({ user: _id }),
      GameLog.find({
        $or: [{ creator: _id }, { joined_user: _id }],
        room: { $ne: null } // Exclude gameLogs with null room property
      })
        .sort({ created_at: 'asc' })
        .populate([
          { path: 'creator', model: User },
          { path: 'joined_user', model: User },
          { path: 'room', model: Room },
          { path: 'game_type', model: GameType }
        ])
    ]);

    // console.log('Calculating statistics...');
    let statistics = {
      deposit: 0,
      withdraw: 0,
      gameProfit: 0,
      profitAllTimeHigh: 0,
      profitAllTimeLow: 0,
      gamePlayed: 0,
      totalWagered: 0,
      gameLogList: []
    };

    for (const receipt of receipts) {
      if (receipt.payment_type === 'Deposit') {
        statistics.deposit += receipt.amount;
      } else if (receipt.payment_type === 'Withdraw') {
        statistics.withdraw += receipt.amount;
      }
    }

    for (const transaction of transactions) {
      if (transaction.description !== 'deposit' && transaction.description !== 'withdraw') {
        statistics.gameProfit += transaction.amount;
      }
    }

    const commission = await getCommission();

    for (const gameLog of gameLogs) {
      if (!gameLog.room) {
        console.log('Skipping gameLog:', gameLog._id, 'as room object is null.');
        continue; // Skip gameLogs with null room property
      }

      statistics.gamePlayed++;

      const creatorId = gameLog.creator ? gameLog.creator._id : null;
      const joinedUserId = gameLog.joined_user ? gameLog.joined_user._id : null;

      const opponentId = creatorId === _id ? joinedUserId : creatorId;
      const opponentUsername = opponentId ? (creatorId === _id ? gameLog.joined_user.username : gameLog.creator.username) : null;

      let profit = 0;

      if (gameLog.game_type && gameLog.game_type.short_name === 'S!') {
        profit = creatorId === _id ? 0 - gameLog.bet_amount : gameLog.bet_amount * 2 - gameLog.bet_amount;
      } else if (gameLog.game_type && gameLog.game_type.short_name === 'QS') {
        profit = creatorId === _id ? 0 - gameLog.bet_amount : gameLog.bet_amount * gameLog.room.qs_game_type - gameLog.bet_amount;
      } else if (gameLog.game_type && gameLog.game_type.short_name === 'MB') {
        profit = creatorId === _id ? gameLog.bet_amount - gameLog.game_result : gameLog.game_result - gameLog.bet_amount;
      } else {
        if (gameLog.game_result === 0) {
          profit = 0 - gameLog.bet_amount * commission;
        } else {
          profit = (creatorId === _id && gameLog.game_result === 1) || (joinedUserId === _id && gameLog.game_result === -1)
            ? 0 - gameLog.bet_amount
            : gameLog.bet_amount * 2 - gameLog.bet_amount;
        }
      }

      if (statistics.profitAllTimeHigh < profit) {
        statistics.profitAllTimeHigh = profit;
      }

      if (statistics.profitAllTimeLow > profit) {
        statistics.profitAllTimeLow = profit;
      }

      statistics.totalWagered += gameLog.bet_amount;

      if (!gameLog.room) {
        // console.log('Error: Room object is null or undefined');
        // console.log('gameLog:', gameLog);
        return { error: 'Room object is null or undefined' };
      }

      let gameTypeShortName = '';
      if (gameLog.game_type) {
        gameTypeShortName = gameLog.game_type.short_name || '';
      }

      statistics.gameLogList.push({
        game_id: `${gameTypeShortName}-${gameLog.room.room_number}`,
        room_id: gameLog.room._id,
        played: gameLog.created_at,
        bet: gameLog.bet_amount,
        opponent: { _id: opponentId, username: opponentUsername },
        profit,
        net_profit: 0
      });
    }

    const response = {
      success: true,
      statistics
    };

    // console.log('Statistics calculated successfully.');
    res.json(response);
  } catch (error) {
    console.error(error);
    res.json({
      success: false,
      error: error.message
    });
  }
});


getBetType = bet_amount => {
  if (bet_amount >= 1 && bet_amount < 10) {
    return 1;
  } else if (bet_amount >= 10 && bet_amount < 20) {
    return 2;
  } else if (bet_amount >= 20 && bet_amount < 30) {
    return 3;
  } else if (bet_amount >= 30 && bet_amount < 40) {
    return 4;
  } else if (bet_amount >= 40 && bet_amount < 50) {
    return 5;
  } else if (bet_amount >= 50 && bet_amount < 60) {
    return 6;
  } else if (bet_amount >= 60 && bet_amount < 70) {
    return 7;
  } else if (bet_amount >= 70 && bet_amount < 80) {
    return 8;
  } else if (bet_amount >= 80 && bet_amount < 90) {
    return 9;
  } else if (bet_amount >= 90 && bet_amount < 100) {
    return 10;
  } else if (bet_amount >= 100) {
    return 11;
  }

  return 0;
};

getIndexByGameType = game_type => {
  const game_types = ['RPS', 'S!', 'BG', 'MB', 'QS'];
  return game_types.indexOf(game_type);
};

router.get('/get-total-statistics', auth, async (req, res) => {
  try {
    const statistics = {
      totalGameCreated: 0,
      totalGameJoined: 0,
      totalWagered: 0,
      totalDeposited: 0,
      totalWithdrawn: 0,
      volumeOfBets: [
        { name: 'RPS', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
        { name: 'Spleesh', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
        { name: 'Mystery Box', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
        { name: 'Brain Game', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
        { name: 'Quick Shoot', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }
      ]
    };

    const receipts = await Receipt.find({});
    const rooms = await Room.find({}).populate({
      path: 'game_type',
      model: GameType
    });
    const gameLogs = await GameLog.find({}).populate({
      path: 'game_type',
      model: GameType
    });

    for (r of receipts) {
      if (r.payment_type === 'Deposit') {
        statistics['totalDeposited'] += r.amount;
      } else if (r.payment_type === 'Withdraw') {
        statistics['totalWithdrawn'] += r.amount;
      }
    }

    statistics['totalGameCreated'] = rooms.length;

    for (room of rooms) {
      statistics['totalWagered'] += room.bet_amount;
      statistics['volumeOfBets'][
        getIndexByGameType(room.game_type?.short_name)
      ].data[getBetType(room.bet_amount)] += room.bet_amount;
    }

    for (log of gameLogs) {
      if (log.game_result == -100) {
        //end_game
        continue;
      }
      statistics['totalGameJoined']++;
      statistics['totalWagered'] += log.bet_amount;
      statistics['volumeOfBets'][
        getIndexByGameType(log.game_type.short_name)
      ].data[getBetType(log.bet_amount)] += log.bet_amount;
    }

    res.json({
      success: true,
      statistics
    });
  } catch (err) {
    console.error(err);
    res.json({
      success: false,
      err: message
    });
  }
});

router.get('/get-room-statistics', auth, async (req, res) => {
  try {
    const room_id = req.query.room_id;

    const room = await Room.findOne({ _id: room_id })
      .populate({ path: 'creator', model: User })
      .populate({ path: 'game_type', model: GameType });

    const gameLogs = await GameLog.find({ room: room_id })
      .sort({ created_at: 'asc' })
      .populate({ path: 'game_type', model: GameType })
      .populate({ path: 'joined_user', model: User });

    const room_info = [];

    if (room.game_type.short_name === 'MB') {
      const boxList = await RoomBoxPrize.find({ room: room_id });

      const boxPrices = boxList.map((box) => `[RPS ${box.box_price}, RPS ${box.box_prize}]`);

      room_info.push({
        _id: room._id,
        created_at: room.created_at,
        actor: room.creator.username,
        action: 'Create boxes. ' + boxPrices.join(', ')
      });

      for (const log of gameLogs) {
        if (log.game_result === -100) {
          room_info.push({
            _id: log._id,
            created_at: log.created_at,
            actor: log.joined_user.username,
            action: 'End Game by Creator'
          });
        } else {
          room_info.push({
            _id: log._id,
            created_at: log.created_at,
            actor: log.joined_user.username,
            action: `Open a box. [RPS ${log.bet_amount}, RPS ${log.game_result}]`
          });
        }
      }
    } else {
      room_info.push({
        _id: room._id,
        created_at: room.created_at,
        actor: room.creator.username,
        bet_amount: 'RPS ' + room.bet_amount,
        action: 'Create Room'
      });

      for (const log of gameLogs) {
        if (log.game_result === -100) {
          room_info.push({
            _id: log._id,
            created_at: log.created_at,
            actor: log.joined_user.username,
            action: 'End Game by Creator'
          });
        } else {
          const result = log.game_result === 1 ? 'Win' : log.game_result === -1 ? 'Lose' : 'Draw';
          room_info.push({
            _id: log._id,
            created_at: log.created_at,
            actor: log.joined_user.username,
            action: `Bet RPS ${log.bet_amount} and ${result}`
          });
        }
      }
    }

    const response = {
      success: true,
      room_info
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.json({
      success: false,
      error: message
    });
  }
});


module.exports = router;

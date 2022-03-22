"use strict";
var BigNumber = require("bignumber.js");
const enumerable = require("linq");

module.exports.createBalances = async data => {
  const balances = new Map();
  const closingBalances = [];

  const setDeposits = event => {
    const wallet = event.to;

    let deposits = (balances.get(wallet) || {}).deposits || [];
    let withdrawals = (balances.get(wallet) || {}).withdrawals || [];

    if (!event.tokenId) {
      throw new TypeError('invalid tokenId value');
    }

    deposits = [...deposits, event.tokenId];
    balances.set(wallet, { deposits, withdrawals });
  };

  const setWithdrawals = event => {
    const wallet = event.from;

    let deposits = (balances.get(wallet) || {}).deposits || [];
    let withdrawals = (balances.get(wallet) || {}).withdrawals || [];

    if (!event.tokenId) {
      throw new TypeError('invalid tokenId value');
    }

    withdrawals = [...withdrawals, event.tokenId];
    balances.set(wallet, { deposits, withdrawals });
  };

  for (const event of data.events) {
    setDeposits(event);
    setWithdrawals(event);
  }

  for (const [key, value] of balances.entries()) {
    if (key === "0x0000000000000000000000000000000000000000") {
      continue;
    }

    const tokenIds = value.deposits.filter(x => !value.withdrawals.includes(x));

    closingBalances.push({
      wallet: key,
      tokenIds,
      balance: tokenIds.length
    });
  }

  return closingBalances.filter(b => b.balance > 0);
};

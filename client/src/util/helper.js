import { convertToCurrency } from './conversion';

export const cleanObj = obj => {
  let newObj = {};
  Object.keys(obj).forEach(prop => {
    if (obj[prop]) {
      newObj[prop] = obj[prop];
    }
  });
  return newObj;
};

export const hpGoToInput = id => {
  document.getElementById(id).focus();
};

export function updateDigitToPoint2(number) {
  if (parseFloat(number) - parseInt(number) !== 0) {
      return parseFloat(number).toFixed(2);
  }
  return number;
}

export function addCurrencySignal(amount) {
	if (amount > 0)
		return convertToCurrency(updateDigitToPoint2(amount));
	if (amount < 0) 
		return '-' + convertToCurrency(updateDigitToPoint2(Math.abs(amount)));
	return 0;
}

export async function getQsLottieAnimation(nation, short_name) {
  let nationStr = '';
  let shortStr = '';
  
  if (nation === 0) {
    nationStr = 'SA';
  } else if (nation === 1) {
    nationStr = 'EA';
  } else if (nation === 2) {
    nationStr = 'BR';
  } else if (nation === 3) {
    nationStr = 'AU';
  } else if (nation === 4) {
    nationStr = 'AF';
  }

  if (short_name === 'center') {
    shortStr = 'Bottom';
  } else if (short_name === 'tl') {
    shortStr = 'LeftTop';
  } else if (short_name === 'tr') {
    shortStr = 'RightTop';
  } else if (short_name === 'bl') {
    shortStr = 'LeftBottom';
  } else if (short_name === 'br') {
    shortStr = 'RightBottom';
  }
  
  const anim = await import(`../game_panel/LottieAnimations/${nationStr}${shortStr}.json`);

  return anim;
}
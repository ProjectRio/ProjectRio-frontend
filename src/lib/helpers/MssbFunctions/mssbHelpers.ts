// @ts-ignore
export function LinearInterpolateToNewRange(value, prevMin, prevMax, nextMin, nextMax) {
      let min = 0.0;
      let max = 0.0;
      let calcedValue
      if (min == (prevMax - prevMin)) {
          max = 1.0;
      }
      else {
          max = 1.0;
          calcedValue = (value - prevMin) / (prevMax - prevMin);
    
          if ((calcedValue <= max)) {
              max = calcedValue
              if (calcedValue < min) {
                  max = min;
              }
          }
      }
      return (nextMax - nextMin) * max + nextMin;
    
}

// @ts-ignore
export function randBetween(param_1, param_2, StaticRandomInt1, StaticRandomInt2, TotalframesAtPlay) {
  let uVar1;
  let iVar2;
  let uVar3;
  let uVar4;
  let iVar5;
  
  uVar4 = (param_2 - param_1) + 1;
  iVar5 = (uVar4 >> 0x1f ^ uVar4) - (uVar4 >> 0x1f);
  if (iVar5 < 2) {
    iVar5 = 0;
  }
  else {
    StaticRandomInt1 =
         (StaticRandomInt1 - (StaticRandomInt2 & 0xff)) +
         StaticRandomInt2 / iVar5 + TotalframesAtPlay;

    uVar1 = StaticRandomInt1 - (StaticRandomInt1 / iVar5) * iVar5;
    uVar3 = uVar1 >> 0x1f;
    iVar5 = (uVar3 ^ uVar1) - uVar3;
    if (uVar4 < 0) {
      iVar5 = -iVar5;
    }
    
  }
  return param_1 + iVar5;
}

// @ts-ignore
export function RandomInt_Game(MaxNum, StaticRandomInt1, StaticRandomInt2, TotalframesAtPlay) 
{
  let iVar1;
  let uVar2;
  let randomNum;
  let uVar3;
  
  randomNum = (MaxNum >> 0x1f ^ MaxNum) - (MaxNum >> 0x1f);
  if (randomNum < 2) {
    randomNum = 0;
  }
  else {
    StaticRandomInt1 =
         (StaticRandomInt1 - (StaticRandomInt2 & 0xff)) +
         StaticRandomInt2 / randomNum + TotalframesAtPlay;
    
    uVar2 = StaticRandomInt1 - (StaticRandomInt1 / randomNum) * randomNum;
    uVar3 = uVar2 >> 0x1f;
    randomNum = (uVar3 ^ uVar2) - uVar3;
    if (MaxNum < 0) {
      randomNum = -randomNum;
    }
  
  }
  return randomNum;
}

// @ts-ignore
export function randomInRange(param_1, param_2, StaticRandomInt1, StaticRandomInt2, TotalframesAtPlay) {
  // sometimes the game only sends 1 parameter. When this happens, I think it's for parameter 2, and parameter 1 is defaulted to 0.
  let uVar4 = 0;
  let uVar1;
  let uVar2;
  let const_7 = (1000 * (param_2 - param_1)) + 1;
  let const_7_ = const_7;
  if (const_7 < 0) {
    const_7_ = -const_7;
  }
  if (const_7_ < 2) {
    uVar1 = 0;
  }
  else {
    StaticRandomInt1 =
         (StaticRandomInt1 - (StaticRandomInt2 & 0xff)) +
         StaticRandomInt2 / const_7_ + TotalframesAtPlay;

      uVar2 = StaticRandomInt1 - (StaticRandomInt1 / const_7_) * const_7_;
      uVar1 =  uVar2 >> 0x1f;
      uVar1 = (uVar1 ^ uVar2) - uVar1;
      if (const_7 < 0) {
        uVar1 = -uVar1;
      }
    
  }
  let local_28 = uVar1;
  return (0.001 * (local_28) + param_1);
}

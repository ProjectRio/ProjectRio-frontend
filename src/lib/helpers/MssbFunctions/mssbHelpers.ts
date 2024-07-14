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
export function randBetween(param_1, param_2, dt) { //806dddb0
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
    dt.StaticRandomInt1 =
         (dt.StaticRandomInt1 - (dt.StaticRandomInt2 & 0xff)) +
         Math.floor(dt.StaticRandomInt2 / iVar5) + dt.TotalframesAtPlay;

    uVar1 = dt.StaticRandomInt1 - (dt.StaticRandomInt1 / iVar5) * iVar5;
    uVar3 = Math.floor(uVar1) >> 0x1f;
    iVar5 = (uVar3 ^ uVar1) - uVar3;
    if (uVar4 < 0) {
      iVar5 = -iVar5;
    }
    
  }
  return [param_1 + iVar5, dt];
}

// @ts-ignore
export function RandomInt_Game(MaxNum, dt)  //806ddf4c
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
    dt.StaticRandomInt1 =
         (dt.StaticRandomInt1 - (dt.StaticRandomInt2 & 0xff)) +
         dt.StaticRandomInt2 / randomNum + dt.TotalframesAtPlay;
    
    uVar2 = dt.StaticRandomInt1 - (dt.StaticRandomInt1 / randomNum) * randomNum;
    uVar3 = Math.floor(uVar2) >> 0x1f;
    randomNum = (uVar3 ^ uVar2) - uVar3;
    if (MaxNum < 0) {
      randomNum = -randomNum;
    }
  
  }
  return [randomNum, dt];
}

// @ts-ignore
export function randomInRange(param_1, param_2, dt) {
  // sometimes the decomp only sends 1 parameter. When this happens, I think parameter 1 is the negative version, and 2 is the positive version.
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
    dt.StaticRandomInt1 =
         (dt.StaticRandomInt1 - (dt.StaticRandomInt2 & 0xff)) +
         dt.StaticRandomInt2 / const_7_ + dt.TotalframesAtPlay;

      uVar2 = dt.StaticRandomInt1 - (dt.StaticRandomInt1 / const_7_) * const_7_;
      uVar1 =  Math.floor(uVar2) >> 0x1f;
      uVar1 = (uVar1 ^ uVar2) - uVar1;
      if (const_7 < 0) {
        uVar1 = -uVar1;
      }
    
  }
  let local_28 = uVar1;
  return [(0.001 * (local_28) + param_1), dt];
}

// @ts-ignore
export function WeightedRandomIndex(vals, count, dt) {
  let randomSum = 0;

  let loopSum = 0;

  let randomRange

  vals.forEach((element: number) => {
      loopSum += element;
  });

  let finSum = loopSum;

  if (loopSum < 0) {
      finSum = -loopSum;
  }

  if (finSum < 2) {
      randomSum = 0;
  }
  else {
      // update RandomInt in case it's called successive times
      dt.StaticRandomInt1 = (dt.StaticRandomInt1 - (dt.StaticRandomInt2 & 0xff)) + Math.floor(dt.StaticRandomInt2 / finSum) + dt.TotalframesAtPlay;
      randomRange = dt.StaticRandomInt1 - Math.floor(dt.StaticRandomInt1 / finSum) * finSum;
      randomSum = (randomRange >> 0x1f ^ randomRange) - (randomRange >> 0x1f);
      if (loopSum < 0) {
          randomSum = -randomSum;
      }
  }
  let p_loopArray = vals;
  let newIndex = 0;
  let i = 0;
  if (0 < count) {
      do {
          if (randomSum < p_loopArray[i]) {
              return [newIndex, dt];
          }
          randomSum -= p_loopArray[i];
          newIndex += 1;
          count += -1;
          i++;
      } while (count != 0);
  }
  return [0, dt];
}
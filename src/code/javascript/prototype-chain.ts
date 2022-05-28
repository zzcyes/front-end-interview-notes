export const _instanceof = (leftValue: any, rightValue: any)=>{
  let rightProto = rightValue.prototype;
  leftValue = leftValue.__proto__;
  console.debug('leftValue:',leftValue);
  while(true){
    if(leftValue === null) return false;
    if(leftValue === rightProto) return true;
    leftValue = leftValue.__proto__ ;
  }
}

export const checkInstanceof= (leftValue:any, rightValue:any) =>{
  const newValue = _instanceof(leftValue, rightValue)
  // const originValue = leftValue instanceof rightValue;
  return {
    // isValid:  newValue === originValue,
    newValue,
    // originValue
  }
}



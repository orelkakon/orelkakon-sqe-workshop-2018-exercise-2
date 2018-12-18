import * as esprima from 'esprima'; import * as codegen from 'escodegen';
const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse); };
let befGlobal=''; let aftGlobal=''; let FinalAnswer = []; let localValues = new Map();
let fullFunction = ''; let inputFunction = '';
let arrInput; let justFunction; let globalDS; let paramValues; let newMapLoacals;
export {start,parseCode};
function start(fF,inF) {
    paramValues = new Map();
    globalDS = new Map();
    FinalAnswer=[]; // to setUp
    fullFunction = fF;
    inputFunction = inF;
    arrInput = analyzeInputFunction(parseCode(inputFunction));
    justFunction = analyzeFullFunction(parseCode(fullFunction));
    globalDS = globalDataStructure(parseCode(befGlobal));
    paramValues = params(parseCode(justFunction), arrInput);
    FinalAnswer.push(justFunction.substring(0, justFunction.indexOf('{') + 1));
    symbolic1(parseCode(justFunction).body[0].body.body);
    FinalAnswer.push('}');
    checkCondition(FinalAnswer);
    return FinalAnswer; }


function symbolic1(code) {
    for(let i=0;i<code.length;i++){
        if(code[i].type === 'VariableDeclaration'){
            handlerVarDec(code[i].declarations[0]);
        }
        else if(code[i].type === 'ExpressionStatement'){
            handlerExpSta(code[i].expression);
        }
        else if(code[i].type === 'IfStatement'){
            handlerIfSta(code[i],false);


        }
        else
            symbolic2(code,i);
    }
}
function symbolic2(code,i) {
    if(code[i].type === 'ReturnStatement'){
        handlerReturnSta(code[i]);
    }
    else if(code[i].type === 'WhileStatement') {
        handlerWhileSta(code[i]);
    }
}
function symbolic1Line(code) {
    if(code.type === 'ExpressionStatement') {
        handlerExpSta(code.expression);
    }
    else if(code.type === 'ReturnStatement'){
        handlerReturnSta(code);
    }
    else {
        //not support ++ / --
    }
}
//handlers:
function params(code,arrInput){
    let functionVar = new Map();
    for (let j = 0; j < code.body[0].params.length; j++) {
        functionVar.set(code.body[0].params[j].name,arrInput[j]);
    }
    return functionVar;
}
function handlerVarDec(code) {
    let name = code.id.name ;let value ='';
    if(code.init !== null)
        value = codegen.generate(code.init).split('\n').join('').split(' ').join('');
    value = handlerLocalValue(value);
    let iter2 = globalDS.keys(); let val = iter2.next().value;
    while(val !== undefined) {
        if(value.includes(val)){
            value = value.split(val).join(globalDS.get(val));
        }
        val = iter2.next().value;
    }
    localValues.set(name,value);
}
function handlerLocalValue(value) {
    let iter1 = localValues.keys();let val = iter1.next().value;
    while(val !== undefined) {
        if(value.includes(val)){
            value = value.split(val).join(localValues.get(val));
        }
        val = iter1.next().value;
    }
    return value;
}
function handlerExpSta(code) {
    let name=''; let value='';
    if(code.type === 'AssignmentExpression'){
        if(code.left.type === 'Identifier')
            name = code.left.name;
        else
            name = handlerMemExp(code.left);
        if(code.right.type === 'MemberExpression'){
            value = handlerMemExp(code.right);
        }
        else if(code.right.type === 'BinaryExpression'){
            value = codegen.generate(code.right);
        }
        else
            value = handlerIdenOrLit(code.right);
        handlerExp(name,value);
    }
    else
        handlerUnaryOrUpdate(code);
}
function handlerReturnSta(code) {
    let line = codegen.generate(code.argument);
    let iter1 = localValues.keys(); let key = iter1.next().value;
    while (key !== undefined){
        if(line.includes(key)){
            line = line.split(key).join(localValues.get(key));
        }
        key = iter1.next().value;
    }
    FinalAnswer.push('return '+line+';');
}
function handlerMemExp(code) {
    let name = code.object.name;
    let uponName = handlerIdenOrLit(code.property);
    name = name +'['+ uponName +']';
    return name;
}
function handlerWhileSta(code) {
    let line = codegen.generate(code.test);
    line = handlerLocalValue(line);
    let iter2 = globalDS.keys(); let key=iter2.next().value;
    while (key !== undefined){
        if(line.includes(key) && line.charAt(line.indexOf(key)+1)!=='['){
            line = line.split(key).join(globalDS.get(key));
        }
        key = iter2.next().value;
    }
    FinalAnswer.push('while ( '+line+' ) {');
    handlerConsequent(code.body);
    FinalAnswer.push('}');
}
function handlerIfSta(code,boolVal) {
    let line = ''; newMapLoacals = new Map(localValues);
    line = handlerBinExp(code,line);
    if (!boolVal)
        FinalAnswer.push('if ( ' + line + ' ) {');
    else
        FinalAnswer.push('} else if ( ' + line + ' ) {');
    handlerConsequent(code.consequent);
    if (code.alternate !== null) {
        let bool = handlerAlternate(code.alternate);
        if (!bool) {
            FinalAnswer.push('}');
        }
    }
    else {
        FinalAnswer.push('}');
    }
}
function handlerBinExp(code,line) {
    if (code.test.type === 'BinaryExpression') {
        line = codegen.generate(code.test);
        line = handlerLocalValue(line);
        let iter2 = globalDS.keys(); let val = iter2.next().value;
        while(val !== undefined) {
            if(line.includes(val)){
                line = line.split(val).join(globalDS.get(val));
            }
            val = iter2.next().value;
        }
    }
    return line;
}
function handlerAlternate(code) {
    localValues = new Map(newMapLoacals);
    if(code.type === 'IfStatement'){
        handlerIfSta(code,true);
        return true;
    }
    else if(code.type === 'BlockStatement'){
        FinalAnswer.push('} else {');
        symbolic1(code.body);
        return false;
    }
    else{
        symbolic1Line(code);
        return true;
    }

}
function handlerConsequent(code) {
    if(code.type === 'BlockStatement'){
        symbolic1(code.body);
    }
    else {
        symbolic1Line(code);
    }
}
function handlerIdenOrLit(code) {
    if(code.type === 'Literal'){
        return code.value +'';
    }
    else if(code.type === 'Identifier'){
        return code.name;
    }
}
function handlerUnaryOrUpdate(code,name,value){
    if(code.type === 'UpdateExpression'){
        name = code.argument.name;
        if(code.operator === '++'){
            value = name + ' + '+'1';
        }
        else {
            value = name + ' - '+'1';
        }
        handlerExp(name,value);
    }
}
function handlerExp(name,value) {
    value = handlerLocalValue(value);
    let iter2 = globalDS.keys(); let val = iter2.next().value;
    while(val !== undefined) {
        if(value.includes(val)){
            value = value.split(val).join(globalDS.get(val));
        }
        val = iter2.next().value;
    }
    if(localValues.has(name)){
        localValues.set(name,value+'');
    }
    else if(globalDS.has(name)){
        globalDS.set(name,value); FinalAnswer.push(name + ' = ' + value + ' ;');
    }
    else {
        paramValues.set(name, value); FinalAnswer.push(name + ' = ' + value + ' ;');
    }
}

//data structure
function globalDataStructure(befGlobal) {
    let Ds = new Map(); let found = false;
    for(let i=0 ;i < befGlobal.body.length ;i++){
        let key = befGlobal.body[i].declarations[0].id.name; let value = '';
        if(befGlobal.body[i].declarations[0].init.type === 'Literal'){
            value = befGlobal.body[i].declarations[0].init.value + '';
        }
        else if(befGlobal.body[i].declarations[0].init.type === 'Identifier'){
            value = befGlobal.body[i].declarations[0].init.name;
        }
        else if(befGlobal.body[i].declarations[0].init.type === 'BinaryExpression'){
            value = codegen.generate(befGlobal.body[i].declarations[0].init);
        }
        else{
            value = arrayCheck(befGlobal.body[i].declarations[0].init.elements); found = true;
        }
        value = aftExchange(value,found,Ds); Ds.set(key,value); found = false;
    }
    return Ds;
}
function aftExchange(value,found,Ds) {
    if(!found){
        let iter1 = Ds.keys();
        let key=iter1.next().value;
        while (key !== undefined){
            if(value.includes(key)){
                value = value.split(key).join(Ds.get(key));
            }
            key = iter1.next().value;
        }
        return value;
    }
    return value;
}
//util DS
function arrayCheck(arrToCheck) {
    let arr = [];
    for(let i=0;i<arrToCheck.length;i++){
        if(arrToCheck[i].type === 'Literal'){
            arr.push(arrToCheck[i].value);
        }
        else if(arrToCheck[i].type === 'Identifier'){
            arr.push(arrToCheck[i].name);
        }
        else{
            let newArr = arrayCheck(arrToCheck[i].elements);
            arr.push(newArr);
        }
    }
    return '['+arr+']';
}

//analyze param
function analyzeFullFunction(fullFunction){
    let func = ''; let found = false;
    for (let i=0;i<fullFunction.body.length;i++){
        if(fullFunction.body[i].type === 'VariableDeclaration') {
            if(found === false) {
                befGlobal = befGlobal + 'let ' + codegen.generate(fullFunction.body[i].declarations[0])+ ';';
            }
            else {
                aftGlobal = aftGlobal + 'let ' + codegen.generate(fullFunction.body[i].declarations[0])+ ';';
            }
        }
        else if(fullFunction.body[i].type === 'FunctionDeclaration'){
            func = codegen.generate(fullFunction.body[i]);
            found = true;
        }
    }
    return func;
}
function analyzeInputFunction(inputfunction) {
    let array = [];
    if(inputfunction.body[0].expression.type === 'SequenceExpression') {
        for (let i = 0; i < inputfunction.body[0].expression.expressions.length; i++) {
            if (inputfunction.body[0].expression.expressions[i].type === 'ArrayExpression') {
                array.push(codegen.generate(inputfunction.body[0].expression.expressions[i]));
            }
            else{
                array.push(inputfunction.body[0].expression.expressions[i].raw);
            }
        }
    }
    else {
        if(inputfunction.body[0].expression.type === 'ArrayExpression')
            array.push(codegen.generate(inputfunction.body[0].expression));
        else
            array.push(inputfunction.body[0].expression.value);
    }
    return array;
}

//checks conditions
function checkCondition(arrToPaint) {
    for(let i=0;i<arrToPaint.length;i++){
        if(arrToPaint[i].includes('if')){
            let line = arrToPaint[i].substring(arrToPaint[i].indexOf('('),arrToPaint[i].indexOf(')')+1);
            line = doExchange(line);
            if(eval(line)){
                arrToPaint[i] = arrToPaint [i] + '     //this line is green';
            }
            else{
                arrToPaint[i] = arrToPaint [i] + '     //this line is red';
            }
        }
    }
}
function doExchange(line) {
    let iter1 = paramValues.keys(); let key=iter1.next().value;
    while (key !== undefined){
        if(line.includes(key)){
            line = line.split(key).join(paramValues.get(key));
        }
        key = iter1.next().value;
    }
    return line;
}

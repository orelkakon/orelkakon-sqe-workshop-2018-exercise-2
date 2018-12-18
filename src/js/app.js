import $ from 'jquery';
import {start,/*parseCode*/} from './code-analyzer';
let fullFunction = '';
let inputFunction = '';
let Answer;
$(document).ready(function () {
    $('#buttonStart').click(() => {
        fullFunction = $('#p1').val();
        inputFunction = $('#p2').val();
        Answer = start(fullFunction,inputFunction);
        clear();
        addColor(Answer);
    });
});
function printArr(arr) {
    let newarr='';
    for(let i=0;i<arr.length-1;i++){
        newarr = newarr + arr[i]+ '\n';
    }
    newarr = newarr + arr[arr.length-1];
    return newarr;
}

function addColor() {
    let htmlCodeObj = document.getElementById('p4'), cap = document.createElement('caption');
    cap.appendChild(document.createTextNode('Solution:'));
    cap.setAttribute('style', 'font:david; font-size:100% ; font-weight: bold;');
    htmlCodeObj.appendChild(cap);
    for (let i = 0; i < Answer.length; i++) { // remove empty lines loop
        let nextLine = document.createElement('line' + i); // next line to show
        nextLine.setAttribute('style', 'background-color: '+ getColor(Answer[i],i) +';');
        nextLine.appendChild(document.createTextNode(Answer[i])); // add it's code text
        htmlCodeObj.appendChild(nextLine);
        htmlCodeObj.appendChild(document.createElement('br')); // add new line
    }
    htmlCodeObj.setAttribute('style', 'font-size:25px; white-space: pre;');
}
function getColor(line,i) {
    if(line.includes('green')) {
        let temp = Answer[i].replace(Answer[i].substr(Answer[i].indexOf('/'),20),'');
        Answer[i]= temp;
        return 'green';
    }
    else if(line.includes('red')){
        let temp = Answer[i].replace(Answer[i].substr(Answer[i].indexOf('/'),18),'');
        Answer[i]=temp;
        return 'red';
    }
    else {
        return 'white';
    }
}
function clear() {
    document.getElementById('p4').innerHTML = '';
}
const express = require('express');
const router = express.Router();
const path = require('path');
const readline = require('readline');
const fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

/* Show Output */
router.post('/output', function(req,res){
  // Roman numeral and its associated value
  var digit = {
    'I':1,
    'V':5,
    'X':10,
    'L':50,
    'C':100,
    'D':500,
    'M':1000
  };
  // Store items that is associated with roman numerals such as 'glob'.
  var strObj = {};
  // Contains user input and output line.
  var lineObj = {
    input:[],
    output:[]
  };
  // Store items that have 'Credits'.
  var itemObj = {};
  var ext = path.extname(req.file.originalname).toLowerCase();
  // Validating file extension.
  if(ext == '.txt'){
    var lineReader = readline.createInterface({
      input: fs.createReadStream(req.file.path)
    });
    lineReader.on('line', function (line) {
      lineObj.input.push(line);
      stringDecode(line);
    }).on('close',function(){
      // Delete the temp file.
      fs.unlink(req.file.path,function(err){
        if(err){
          console.log(err);
        }
        return res.render('output',{data:lineObj,success:true});
      })
    });

    /* Convert roman numerals to our decimal system */
    function symbolToDigit(symbol){
      var sum = 0;
      for(var i=0;i<=symbol.length-1;i++){
        if(digit[symbol[i]] < digit[symbol[i+1]]){
          sum += digit[symbol[i+1]] - digit[symbol[i]];
          i += 1;
        }else{
          sum += digit[symbol[i]];
        }
      }
      return sum;
    }

    /* Read string and give the answer asked by the input user. */
    function stringDecode(str){
      var newstr = [];
      // Decode the first part where we are initializing what is what.
      if(!str.match(/credits/gi) && !str.match(/how/gi)){
        newstr = str.trim().split(' ');
        strObj[newstr[0]] = newstr[2];
      // Decoding the items and its associated credits.
      }else if (!str.match(/how/gi)) {
        newstr = str.split(' ');
        var isIndex = newstr.indexOf('is');
        var symbol = newstr.slice(0, isIndex);
        var num = newstr[isIndex+1];
        var digitSymbol = [];
        var item = {};
        symbol.forEach(function(value){
          if(strObj[value]){
            digitSymbol.push(strObj[value]);
          }else{
            item[value] = parseInt(num);
          }
        });
        var decimalValue = symbolToDigit(digitSymbol);
        Object.keys(item).forEach(function(key){
          itemObj[key] = item[key]/decimalValue;
        });
        // Finally giving the answer to the user.
      }else{
        newstr = str.split(' ');
        var isIndex = newstr.indexOf('is');
        var item = {};
        var digitSymbol = [];
        var question = newstr.slice(isIndex+1,newstr.length-1);
        var isValidQuery = false;
        question.forEach(function(q){
          if(strObj[q]){
            isValidQuery = true;
            digitSymbol.push(strObj[q]);
          }else{
            item[q] = 0;
          }
        });
        if(isValidQuery){
          var decimalValue = symbolToDigit(digitSymbol);
          var answer = '';
          if(Object.keys(item).length > 0){
            Object.keys(item).forEach(function(key){
              answer = question.join(' ') + ' is ' + itemObj[key]*decimalValue + ' Credits';
              lineObj.output.push(answer);
            });
          }else{
            answer = question.join(' ') + ' is ' + decimalValue;
            lineObj.output.push(answer);
          }
        }else{
          answer = 'I don\'t know what you are talking about';
          lineObj.output.push(answer);
        }
      }
    }
  }else{
    res.render('output',{"message":"Not valid extension","success":false});
  }
});

module.exports = router;

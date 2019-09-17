// Game Redesign: Crazy Flappy Bird
// Resources from:
// ml5.js & Flappy bird design in JavaScirpt @ https://www.youtube.com/watch?v=L07i4g-zhDA
// Copyright (c) 2018 ml5
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
/* ===
ml5 Example
KNN Classification on Webcam Images with mobileNet. Built with p5.js
=== */

// ----------- Define global variable and Setup--------------

// ------For Trans Learning
let video;
// Create a KNN classifier
const knnClassifier = ml5.KNNClassifier();
let featureExtractor;

// ----- For Flappy bird
var cvs = document.getElementById("canvas"); 
var ctx = cvs.getContext("2d");

// pre-load images
var bird = new Image();
var bg = new Image();
var fg = new Image();
var pipeNorth = new Image();
var pipeSouth = new Image();

bird.src = "images/bird.png";
bg.src = "images/bg.png";
fg.src = "images/fg.png";
pipeNorth.src = "images/pipeNorth.png";
pipeSouth.src = "images/pipeSouth.png";

// pre-load audio files
var fly = new Audio();
var scor = new Audio();

fly.src = "sounds/fly.mp3";
scor.src = "sounds/score.mp3";

// some variables
var flag = 0; // control game start
var restart = 0; // control restart

var gap = 85;
var constant;

var bX = 10; // position of bird
var bY = 150;

var gravity = 1.5;
var score = 0;

var move;

// pipe coordinates
var pipe = [];

pipe[0] = {
    x : cvs.width,
    y : 0
};

var pipeN = pipe.length; // Read pipe.length (Somehow my comp cannot use .length)

// Define function controling for the game 
//document.addEventListener("keydown",moveUp); //previously on key down

function moveUp(){
    if (move == 'Up'){ // when listening data == Up
      if(flag){
        bY -= 5; // Altering the difficulty by change the speed
        //console.log(bY);
        fly.play();
      }
    }
}


// --------------------- Transfer Learning -------------

function setup() {
  // Create a featureExtractor that can extract the already learned features from MobileNet
  featureExtractor = ml5.featureExtractor('MobileNet', modelReady);
  noCanvas();
  // Create a video element
  video = createCapture(VIDEO);
  // Append it to the videoContainer DOM element
  video.parent('videoContainer');
  // Create the UI buttons
  createButtons();

}

function modelReady(){
  select('#status').html('FeatureExtractor(mobileNet model) Loaded')
}

// Add the current frame from the video to the classifier
function addExample(label) {
  // Get the features of the input video
  const features = featureExtractor.infer(video);
  // You can also pass in an optional endpoint, defaut to 'conv_preds'
  // const features = featureExtractor.infer(video, 'conv_preds');
  // You can list all the endpoints by calling the following function
  // console.log('All endpoints: ', featureExtractor.mobilenet.endpoints)

  // Add an example with a label to the classifier
  knnClassifier.addExample(features, label);
  updateCounts();
}

// Predict the current frame.
function classify() {
  // Get the total number of labels from knnClassifier
  const numLabels = knnClassifier.getNumLabels();
  if (numLabels <= 0) {
    console.error('There is no examples in any label');
    return;
  }
  // Get the features of the input video
  const features = featureExtractor.infer(video);

  // Use knnClassifier to classify which label do these features belong to
  // You can pass in a callback function `gotResults` to knnClassifier.classify function
  knnClassifier.classify(features, gotResults);
  // You can also pass in an optional K value, K default to 3
  // knnClassifier.classify(features, 3, gotResults);

  // You can also use the following async/await function to call knnClassifier.classify
  // Remember to add `async` before `function predictClass()`
  // const res = await knnClassifier.classify(features);
  // gotResults(null, res);
}

// A util function to create UI buttons
// Up/Down/Play/Replay Button
function createButtons() {
  // When the A button is pressed, add the current frame
  // from the video with a label of "rock" to the classifier
  buttonA = select('#addGestureUp');
  buttonA.mousePressed(function() {
    addExample('Up');
  });

  buttonB = select('#addGestureDown');
  buttonB.mousePressed(function() {
    addExample('Down');
  });
  
  buttonP = select('#addPlay');
  buttonP.mousePressed(function(){
    flag = 1;
    restart = 0;
  });

  buttonRestart = select('#addRestart');
  buttonRestart.mousePressed(function(){
      restart = 1;
      flag = 0;
  });
  

  // Reset buttons
  resetBtnA = select('#resetUp');
  resetBtnA.mousePressed(function() {
    clearLabel('Up');
  });

  resetBtnB = select('#resetDown');
  resetBtnB.mousePressed(function() {
    clearLabel('Down');
  });
  
  // Predict button
  buttonPredict = select('#buttonPredict');
  buttonPredict.mousePressed(classify);

}

/*function runGame(){
    moveUp();
    draw();
};*/

// Show the results
function gotResults(err, results) {
  // Display any error
  if (err) {
    console.error(err);
  }else{
    select('#result').html(results.label);
    select('#result2').html(results.label);
    //select('#confidence').html(`${confidences[results.label] * 100} %`);
    
    //const confidences = results.confidencesByLabel;
    //select('#confidence').html(`${confidences[results.label] * 100} %`);
   // select('#confidence').html(results.confidencesByLabel);
    //console.log('confidence:',confidences);
    //select('#confidenceUp').html(`${confidences['Up'] ? confidences['Up'] * 100 : 0} %`);
    //console.log('results:', results);
    move = results.label;
    //console.log(move);
    moveUp();
  }

  classify();
}

// Update the example count for each label	
function updateCounts() {
  const counts = knnClassifier.getCountByLabel();

  select('#exampleUp').html(counts['Up'] || 0);
  select('#exampleDown').html(counts['Down'] || 0);
  //select('#exampleScissor').html(counts['Scissor'] || 0);
}

// Clear the examples in one label
function clearLabel(label) {
  knnClassifier.clearLabel(label);
  updateCounts();
}

// Clear all the examples in all labels
/*function clearAllLabels() {
  knnClassifier.clearAllLabels();
  updateCounts();
}*/

// Save dataset as myKNNDataset.json
/*function saveMyKNN() {
  knnClassifier.save('myKNNDataset');
}*/

// Load dataset to the classifier
function loadMyKNN() {
  knnClassifier.load('./myKNNDataset.json', updateCounts);
}




//------------------ flappy birds --------------


// draw images

function draw(){
    
    ctx.drawImage(bg,0,0);
    
    if (restart){
      restart = 0;
      bX = 10;
      bY = 150;

      score = 0;

      pipe = [];

      pipe[0] = {
       x : cvs.width,
       y : 0
      };

      pipeN = pipe.length;
      //location.reload(); // reload the page
    }

    if (flag){

      for(var i = 0; i < pipeN; i++){
        
        constant = pipeNorth.height+gap;
        ctx.drawImage(pipeNorth,pipe[i].x,pipe[i].y);
        ctx.drawImage(pipeSouth,pipe[i].x,pipe[i].y+constant);
             
        pipe[i].x--;
        
        if( pipe[i].x == 125 ){
            pipe.push({
                x : cvs.width,
                y : Math.floor(Math.random()*pipeNorth.height)-pipeNorth.height
            }); 
        }

        // detect collision
        
        if( bX + bird.width >= pipe[i].x && bX <= pipe[i].x + pipeNorth.width && (bY <= pipe[i].y + pipeNorth.height || bY+bird.height >= pipe[i].y+constant) || bY + bird.height >=  cvs.height - fg.height){
            flag = 0;
            //location.reload(); // reload the page
        }
        
        if(pipe[i].x == 5){
            score++;
            scor.play();
        }
      }

    bY += gravity;
    
    ctx.fillStyle = "#000";
    ctx.font = "20px Verdana";
    ctx.fillText("Score : "+score,10,cvs.height-20);
    
    //requestAnimationFrame(draw);
    }

    ctx.drawImage(fg,0,cvs.height - fg.height);
    ctx.drawImage(bird,bX,bY);
    
};

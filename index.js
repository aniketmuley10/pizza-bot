// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
 
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "ws://yoyopizza-carwwn.firebaseio.com/"
});

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements


 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request:request, response:response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }

  const uuidv4 = require('uuid/v1');
  var order= uuidv4();
  
  
  
  function addorder(agent){
    const pizzatype = agent.parameters.type;
    const pizzasize = agent.parameters.size;
    const pizzacount = agent.parameters.count;
    const customername = agent.parameters.name;
    const customerphone = agent.parameters.phone;
    const customeraddress = agent.parameters.address;
   
    agent.add(`Thanks  ` + customername +` for the information ! Your order id is  ` +order+``);
    
    var postsRef = admin.database().ref('data');
    return postsRef.push({
      	order_id :order,
    	pizzatype: pizzatype,
      	pizzasize: pizzasize,
      	pizzacount: pizzacount,
        customername: customername,
        customerphone: customerphone,
        customeraddress: customeraddress
      
      });
  }
  
  
    
function fromdb(agent){
    
      return admin.database().ref('data').once('value').then((snapshot) =>{
      const order=snapshot.child('data').val();
      //const custname= snapshot.child('customername').val();
        if(order !== null){
        
          agent.add(`The value from database are ${order}`);
        
        }
      });
   
    }
    
 
//agent.add(`Thanks,`+customername+`!!`+`your order_id is `+order_id+``);
  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('order', addorder);
  intentMap.set('Hungry', addorder);
  intentMap.set('status',fromdb);
  agent.handleRequest(intentMap);
 
  
});

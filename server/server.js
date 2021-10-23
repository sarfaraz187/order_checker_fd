exports = {
  onTicketCreateCallback: function(args) {
    console.log("------------------ On Ticket Create ---------------------");
    checkInDatabase(args.data.ticket.id, args.data.ticket.description_text);
  },
  onConversationCreateCallback: function(payload) {
    console.log("------------------ On Conversation Create ---------------------");
    checkInDatabase(payload.data.conversation.ticket_id, payload.data.conversation.body_text);
  }
};

async function checkInDatabase(ticket_id, description) {
  $db.get(`ticket_${ticket_id}`).then(dbData => {
    // console.log(dbData, description)
    checkDescription(description, ticket_id, dbData);
  }, err => {
    console.log("Status code from db : ", err);
    if(err.status === 404) {
      console.log(err)
      checkDescription(description, ticket_id, false);
    }
  });
  // checkDescription(description, ticket_id, false);
}

async function checkDescription(description, ticket_id, dbData) {
  console.log("Data from DB : ", dbData);
  let formatted_description = description.replace(/\s/g, '');
  let tempObj = { 
    'order' : (dbData.order) ? dbData.order : false, 
    'service_1' : (dbData.service_1) ? dbData.service_1 : false, 
    'service_2' : (dbData.service_2) ? dbData.service_2 : false, 
    'service_3' : (dbData.service_3) ? dbData.service_3 : false,
  };
  
  const orderRegex = new RegExp(/[0-9]{17}/, 'g');
  // const orderRegex_1 = new RegExp(/11384150113731419/, 'g');
  // const service_regex_1 = new RegExp(/001A07275853/, 'g');
  const service_regex_1 = new RegExp(/[0-9A-Fa-f]{12}/, 'g'); // Hexadecimal Numbers
  const service_regex_2 = new RegExp(/[0-9A-Fa-f]{10}/, 'g'); // Hexadecimal Numbers
  const service_regex_3 = new RegExp(/[0-9A-Za-z]{19}/, 'g'); // Alpha numeric Numbers

  let orderDescription = formatted_description.replace(/-/g, '');
  console.log({ orderDescription });
  let orderId = orderRegex.exec(orderDescription);
  console.log({ orderId });
  if(orderId !== null) {
    tempObj['order'] = orderId[0];
  } else {
    console.log("false in order")
  }

  var patternToTest_1 = formatted_description.substr(formatted_description.indexOf("001"), 12);
  console.log("Pattern to Test for service 1 : ", patternToTest_1);
  let service_1 = service_regex_1.exec(patternToTest_1);
  if((service_1 !== null)) {
    tempObj['service_1'] = patternToTest_1;
  } else {
    console.log('----------> ', 'false in service 1');
  }

  var patternToTest_3 = formatted_description.substr(formatted_description.indexOf("100"), 19);
  console.log("Pattern to Test for service 3 :", patternToTest_3);
  let service_3 = service_regex_3.exec(patternToTest_3);
  console.log({ service_3 });
  if((service_3 !== null)) {
    tempObj['service_3'] = patternToTest_3;
  } else {
    console.log('----------> ', 'false in service 3');
  }

  if((!tempObj.service_1) && (!tempObj.service_3)) {
    let service_2 = service_regex_2.exec(formatted_description);
    if(service_2 !== null) {
      console.log(service_2);
      tempObj['service_2'] = service_2[0];
      console.log("++++++++++ Service 2 found ++++++++");
    } else {
      console.log('----------> ', 'false in service 2');
    }
  }

  console.log(tempObj);
  storeInDatabase(ticket_id, tempObj);
}

function storeInDatabase(ticket_id, obj) {
  console.log(`------------------ Storing in Database ${ticket_id} ---------------------`);
  $db.set(`ticket_${ticket_id}`, obj).then(function(data) {
    console.log("Data stored in database", data);
  }, function(error) {
    console.log(error);
  });
}
document.onreadystatechange = function () {
  if (document.readyState === 'interactive') renderApp();

  function renderApp() {
    var onInit = app.initialized();
    onInit.then(getClient).catch(handleErr);
    function getClient(_client) {
      window.client = _client;
      client.events.on('app.activated', onAppActivate);
    }
  }
};

function onAppActivate() {
  client.data.get('ticket').then(function (payload) {
    client.db.get(`ticket_${payload.ticket.id}`).then(function (dbData) { 
      console.log("Data from DB : ", dbData);
      (dbData.order) ? showOrderDetails(dbData.order) : $('#order').attr('disabled', true);
      showServiceDetails(dbData);
    }, function (err) {
      console.log(err);
      $('#service').attr('disabled', true);
      $('#order').attr('disabled', true);
    });
  }).catch(handleErr);
}

function showOrderDetails(orderId) {
  $('#order').attr('disabled', false);
  $(document).off().on('click', '#order', function() {
    console.log(orderId);
    window.open(`https://sellercentral.amazon.com/orders-v3/order/${orderId.replace(/(\d{3})(\d{7})(\d{4})/, "$1-$2-$3")}`);
  });
}

function showServiceDetails(dbData) {
  if(dbData.service_1 || dbData.service_2 || dbData.service_3) {
    $('#service').attr('disabled', false);
    $(document).on('click', '#service', function() {
      if(dbData.service_1) {
        window.open(`https://fortin.ca/en/support/${dbData.service_1}/`);
      } else if(dbData.service_2) {
        window.open(`https://www.idatalink.com/weblink5/index/devices/?deviceInfo%5B0%5D%5Bmodule_type%5D=1&deviceInfo%5B0%5D%5Bserial%5D=${dbData.service_2}`);
      } else if(dbData.service_3) {
        window.open(`https://www.directechs.com/Resources/KitHistory?moduleID=${dbData.service_3}`);
      }
    });
  } else {
    $('#service').attr('disabled', true);
  }
}

function handleErr(err) {
  console.error(`Error occurred. Details:`, err);
}

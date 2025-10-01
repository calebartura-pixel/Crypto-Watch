let alerts = [];
let currentPrices = {
    bitcoin: 0,
    ethereum: 0,
    dogecoin: 0
};

const cryptoNames = {
    bitcoin: 'Bitcoin (BTC)',
    ethereum: 'Ethereum (ETH)',
    dogecoin: 'Dogecoin (DOGE)'
};

function fetchPrices() {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,dogecoin&vs_currencies=usd')
        .then(response => response.json())
        .then(data => {
            currentPrices.bitcoin = data.bitcoin.usd;
            currentPrices.ethereum = data.ethereum.usd;
            currentPrices.dogecoin = data.dogecoin.usd;
            
            updatePriceDisplay();
            checkAlerts();
            updateLastUpdateTime();
        })
        .catch(error => {
            console.error('Error fetching prices:', error);
        });
}

function updatePriceDisplay() {
    document.getElementById('btc-price').textContent = '$' + currentPrices.bitcoin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById('eth-price').textContent = '$' + currentPrices.ethereum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById('doge-price').textContent = '$' + currentPrices.dogecoin.toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 });
}

function updateLastUpdateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    document.getElementById('last-update').textContent = timeString;
}

function checkAlerts() {
    const alertsToRemove = [];
    
    alerts.forEach((alert, index) => {
        const currentPrice = currentPrices[alert.crypto];
        let conditionMet = false;
        
        if (alert.condition === 'above' && currentPrice > alert.targetPrice) {
            conditionMet = true;
        } else if (alert.condition === 'below' && currentPrice < alert.targetPrice) {
            conditionMet = true;
        }
        
        if (conditionMet) {
            const message = `Alert: ${cryptoNames[alert.crypto]} is now $${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}!\nYour alert: Price ${alert.condition} $${alert.targetPrice}`;
            window.alert(message);
            
            if (alert.deleteAfterTrigger) {
                alertsToRemove.push(index);
            }
        }
    });
    
    alertsToRemove.reverse().forEach(index => {
        alerts.splice(index, 1);
    });
    
    if (alertsToRemove.length > 0) {
        renderAlerts();
    }
}

function renderAlerts() {
    const alertsList = document.getElementById('alerts-list');
    const alertCount = document.getElementById('alert-count');
    
    alertCount.textContent = alerts.length;
    
    if (alerts.length === 0) {
        alertsList.innerHTML = '<p class="no-alerts">No alerts set. Create one above!</p>';
        return;
    }
    
    alertsList.innerHTML = '';
    
    alerts.forEach((alert, index) => {
        const alertItem = document.createElement('div');
        alertItem.className = 'alert-item';
        
        const alertInfo = document.createElement('div');
        alertInfo.className = 'alert-info';
        
        const cryptoDiv = document.createElement('div');
        cryptoDiv.className = 'alert-crypto';
        cryptoDiv.textContent = cryptoNames[alert.crypto];
        
        const conditionDiv = document.createElement('div');
        conditionDiv.className = 'alert-condition';
        conditionDiv.textContent = `Alert when price goes ${alert.condition} $${alert.targetPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
        if (alert.deleteAfterTrigger) {
            conditionDiv.textContent += ' (auto-delete)';
        }
        
        alertInfo.appendChild(cryptoDiv);
        alertInfo.appendChild(conditionDiv);
        
        const alertActions = document.createElement('div');
        alertActions.className = 'alert-actions';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-delete';
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => deleteAlert(index);
        
        alertActions.appendChild(deleteBtn);
        
        alertItem.appendChild(alertInfo);
        alertItem.appendChild(alertActions);
        
        alertsList.appendChild(alertItem);
    });
}

function deleteAlert(index) {
    alerts.splice(index, 1);
    renderAlerts();
}

document.getElementById('alertForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const crypto = document.getElementById('crypto-select').value;
    const condition = document.getElementById('condition').value;
    const targetPrice = parseFloat(document.getElementById('target-price').value);
    const deleteAfterTrigger = document.getElementById('delete-after-trigger').checked;
    
    if (targetPrice <= 0) {
        alert('Please enter a valid price greater than 0');
        return;
    }
    
    const newAlert = {
        crypto: crypto,
        condition: condition,
        targetPrice: targetPrice,
        deleteAfterTrigger: deleteAfterTrigger
    };
    
    alerts.push(newAlert);
    renderAlerts();
    
    this.reset();
});

fetchPrices();
setInterval(fetchPrices, 15000);

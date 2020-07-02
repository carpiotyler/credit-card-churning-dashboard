function getTransactions(cardName) {
    $.get('/transactions?cardName=' + cardName, function(transactionData) {
        $('#transaction-list').html('')
        transactionData.transactions.forEach(t => {t.date = moment(t.date, 'YYYY-MM-DD')}) //Building moment objects from date
        sortedTransactions = transactionData.transactions.sort(function(a, b){ return b.date.toDate() - a.date.toDate()})
        $.get('/cards?cardName=' + cardName, function(cardData) {
            drawGraph(cardData.cards[0], transactionData.transactions)
        });
        sortedTransactions.forEach(transaction => {
            $('#transaction-list').append(`
                <div class="transaction-card">
                    <b class="transaction-id">${transaction.id}</b> ${transaction.name} | $${transaction.value} | ${transaction.date.format("MMM Do YYYY")} <a class="delete-transaction" href="#">Delete</a>
                </div>
            `)
        });
        $('.delete-transaction').click(function(event) {
            $.post('/transactions', {
                action: 'delete',
                id: parseInt(event.target.parentElement.getElementsByClassName('transaction-id')[0].innerText)
            }, function(data) {
                if(data.error) {
                    alert(data.error)
                }
                else {
                    getTransactions($('#card-selector').val())
                }
            });
        });
    });
}

function drawGraph(card, transactionList) {
    let trace = {
        x: [],
        y: [],
        name: 'Transactions',
        type: 'scatter'
    }
    let target = {
        x: [],
        y: [],
        name: 'Target',
        type: 'scatter'
    }
    var total = 0.0;
    transactionList.reverse().forEach(transaction => {
        let index = trace.x.findIndex(val => moment(val).isSame(transaction.date, 'day'))

        total += transaction.value
        target.x.push(transaction.date.toDate())
        target.y.push(card.spend)

        if(index === -1) {
            trace.x.push(transaction.date.toDate())
            trace.y.push(total)
        } else {
            trace.y[index] = total
        }
    })
    let options = {
        title: 'Credit card Sign-Up Bonus Progress',
        xaxis: {
            title: 'Date'
        },
        yaxis: {
            title: 'Total Spent',
            rangemode: 'tozero'
        }
    }
    Plotly.newPlot('plotly-lineGraph', [trace, target], options)
}

$(document).ready(function() {
    $('#addCard').click(function (event) {
        let cardName = $('#cardName').val();
        let spendingGoal = $('#spendingGoal').val();
        let spendingDate = $('#spendingDate').val();
        $.post("/cards", {
            action: "add",
            cardName: cardName,
            spendingGoal: spendingGoal,
            spendingDate: spendingDate
        }, function(data) {
            if(data.error) {
                alert(data.error)
                //Reopen modal
                 $('#add-card-modal').modal('show');
            }
            else {
                $.get('/cards', function(cardData) {
                    $("#card-selector").html("")
                    cardData.cards.forEach(row => {
                        $('#card-selector').append(`<option>${row.name}</option>`)
                    });
                    $('#card-selector').val(cardName)
                    // Clear modal on success
                    $('#cardName').val('');
                    $('#spendingGoal').val('');
                    $('#spendingDate').val('');
                    getTransactions(cardName)
                })
            }
        });
    });

    $('#addTransaction').click(function (event) {
        let cardName = $('#card-selector').val();
        let transactionName = $('#transactionName').val();
        let transactionAmount = $('#transactionAmount').val();
        let transactionDate = $('#transactionDate').val();
        $.post("/transactions", {
            action: "add",
            transactionName: transactionName,
            transactionAmount: transactionAmount,
            transactionDate: transactionDate,
            cardName: cardName
        }, function(data) {
            if (data.error) {
                alert(data.error)
                // Reopen modal
                $('#add-transaction-modal').modal('show');
            } else {
                $.get('/cards', function (cardData) {
                    $("#card-selector").html("")
                    cardData.cards.forEach(row => {
                        $('#card-selector').append(`<option>${row.name}</option>`)
                    });
                    $('#card-selector').val(cardName)
                    $('#transactionName').val('');
                    $('#transactionAmount').val('');
                    $('#transactionDate').val('');
                    getTransactions(cardName)
                });
            }
        });
    });

    $('#delete-card').click(function (event) {
        let selectedCard = $('#card-selector').val();
        $.post("/cards", {
            action: "delete",
            cardName: selectedCard
        }, function(data) {
            if(data.error) {
                alert(data.error)
            }
            else {
                $.get('/cards', function(cardData) {
                    $("#card-selector").html("")
                    cardData.cards.forEach(row => {
                        $('#card-selector').append(`<option>${row.name}</option>`)
                    });
                    getTransactions($('#card-selector').val())
                });
            }
        });
    });

    $('#card-selector').change(function() {
        getTransactions($('#card-selector').val())
    });

    $.get('/cards', function(data) {
        $("#card-selector").html("")
        data.cards.forEach(row => {
            $('#card-selector').append(`<option>${row.name}</option>`)
        });
        getTransactions($('#card-selector').val())
    });
});


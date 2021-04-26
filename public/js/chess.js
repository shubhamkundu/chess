var socket = io();
var currentTeam = 'white';

socket.on('connect', function () {
    console.log('User connected to client');
    var params = jQuery.deparam(window.location.search);

    socket.emit('join', {
        name: params.name,
        room: params.room,
        purpose: 'chat'
    }, function (e) {
        window.location.href = '/';
        alert(e.message);
    });

    drawChessBoard();

    drawToken(8, 1, 'rook', 'white');
    drawToken(8, 2, 'knight', 'white');
    drawToken(8, 3, 'bishop', 'white');
    drawToken(8, 4, 'king', 'white');
    drawToken(8, 5, 'queen', 'white');
    drawToken(8, 6, 'bishop', 'white');
    drawToken(8, 7, 'knight', 'white');
    drawToken(8, 8, 'rook', 'white');

    drawToken(7, 1, 'pawn', 'white');
    drawToken(7, 2, 'pawn', 'white');
    drawToken(7, 3, 'pawn', 'white');
    drawToken(7, 4, 'pawn', 'white');
    drawToken(7, 5, 'pawn', 'white');
    drawToken(7, 6, 'pawn', 'white');
    drawToken(7, 7, 'pawn', 'white');
    drawToken(7, 8, 'pawn', 'white');

    drawToken(1, 1, 'rook', 'black');
    drawToken(1, 2, 'knight', 'black');
    drawToken(1, 3, 'bishop', 'black');
    drawToken(1, 4, 'queen', 'black');
    drawToken(1, 5, 'king', 'black');
    drawToken(1, 6, 'bishop', 'black');
    drawToken(1, 7, 'knight', 'black');
    drawToken(1, 8, 'rook', 'black');

    drawToken(2, 1, 'pawn', 'black');
    drawToken(2, 2, 'pawn', 'black');
    drawToken(2, 3, 'pawn', 'black');
    drawToken(2, 4, 'pawn', 'black');
    drawToken(2, 5, 'pawn', 'black');
    drawToken(2, 6, 'pawn', 'black');
    drawToken(2, 7, 'pawn', 'black');
    drawToken(2, 8, 'pawn', 'black');

    jQuery('#message-form').on('submit', function (ev) {
        ev.preventDefault();

        messageTextbox = jQuery('[name=message]');

        socket.emit('sendMessage', {
            from: params.name,
            text: messageTextbox.val()
        }, function () {
            messageTextbox.val('');
        },
            // function (e) {
            //     alert(e.message);
            // }
        );
    });

    jQuery('#send-location').on('click', function () {
        var sendLocationButton = jQuery('#send-location');
        sendLocationButton.text('Sending location...');
        sendLocationButton.attr('disabled', 'disabled');

        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            sendLocationButton.text('Send location');
            sendLocationButton.removeAttr('disabled');
        } else {
            navigator.geolocation.getCurrentPosition(function (position) {
                socket.emit('sendLocation', {
                    from: params.name,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                }, function () {
                    sendLocationButton.text('Send location');
                    sendLocationButton.removeAttr('disabled');
                },
                    // function (e) {
                    //     alert(e.message);
                    // }
                );
            });
        }
    });

    socket.on('receiveMessage', function (data) {
        // var html = Mustache.render(jQuery('#message-template' + '-' + data.type).html(), {
        //     from: data.from,
        //     text: data.text,
        //     createdOn: moment(data.createdOn).format('h:mm a')
        // });

        // jQuery('#messages').append(html);
        // forceScrollToBottom();
    });

    socket.on('receiveLocation', function (data) {
        var html = Mustache.render(jQuery('#location-template' + '-' + data.type).html(), {
            from: data.from,
            url: data.url,
            createdOn: moment(data.createdOn).format('h:mm a')
        });

        jQuery('#messages').append(html);
        forceScrollToBottom();
    });

    socket.on('updateUsers', function (users) {
        console.log(users);
        // var html = Mustache.render(jQuery('#users-template').html(), {
        //     users
        // });

        // jQuery('#users').html(html);
    });

    jQuery('.menu-icon').on('click', function () {
        jQuery('.chat__sidebar').toggle();
    });
});

function drawChessBoard() {
    let tbl = document.createElement('table');
    tbl = jQuery(tbl);
    for (let i = 0; i < 8; i++) {
        let tr = document.createElement('tr');
        tr = jQuery(tr);
        tr.attr('r', i + 1);
        for (let j = 0; j < 8; j++) {
            let cell = document.createElement('td');
            cell = jQuery(cell);
            cell.addClass('cell');
            // if (i !== 0) {
            //     cell.addClass('notTopMost');
            // }
            // if (j !== 0) {
            //     cell.addClass('notLeftMost');
            // }
            if ((i + j) % 2 !== 0) {
                cell.addClass('black');
            } else {
                cell.addClass('white');
            }
            // if (i !== 0 && j === 0) {
            //     cell.addClass('clearBoth');
            // }
            cell.attr('id', 'cell-' + (i + 1) + '-' + (j + 1));
            cell.attr('r', i + 1);
            cell.attr('c', j + 1);
            // jQuery('.main').append(cell);
            cell.click(function (event) {
                const cell1 = jQuery('#' + event.target.id);
                const r = Number(cell1.attr('r'));
                const c = Number(cell1.attr('c'));
                const token = jQuery('.token[r="' + r + '"][c="' + c + '"]');
                if (cell1.hasClass('possibleCell')) {
                    const selectedToken = jQuery('.selectedToken');
                    if (selectedToken.length) {
                        if (cell1.hasClass('enemy')) {
                            const team = token.attr('team');
                            const otherTeam = team === 'white' ? 'black' : 'white';
                            if (token.attr('tokenType') === 'king') {
                                alert(otherTeam + ' won');
                                window.location.reload();
                            }
                            token.remove();
                        }
                        deselectToken(selectedToken);
                        positionToken(selectedToken, r, c);
                        currentTeam = currentTeam === 'white' ? 'black' : 'white';
                    }
                } else if (token.length) {
                    if (token.attr('team') === currentTeam) {
                        if (!token.hasClass('selectedToken')) {
                            selectToken(token);
                            showPossibleCells(token);
                        } else {
                            deselectToken(token);
                        }
                    }
                }
            });
            tr.append(cell);
        }
        tbl.append(tr);
    }
    jQuery('.main').append(tbl);
}

function drawToken(r, c, tokenType, team) {
    const otherTeam = team === 'white' ? 'black' : 'white';
    let token = document.createElement('div');
    token = jQuery(token);
    token.addClass('token');
    token.addClass(tokenType);
    token.addClass(team);
    token.attr('ir', r);
    token.attr('ic', c);
    token.attr('tokenType', tokenType);
    token.attr('team', team);
    token.html('<i class="fas fa-chess-' + tokenType + ' ' + team + '"></i>');
    token.attr('id', 'token-' + tokenType + '-' + r + '-' + c);
    positionToken(token, r, c);
    jQuery('.main').append(token);
    token.click(function () {
        token = jQuery('#' + 'token-' + tokenType + '-' + r + '-' + c);
        if (!token.hasClass('selectedToken')) {
            const r = token.attr('r');
            const c = token.attr('c');
            const otherTeamSelectedToken = jQuery('.selectedToken.' + otherTeam);
            const thisCell = jQuery('#cell-' + r + '-' + c);
            if (thisCell.hasClass('enemy')) {
                const team = token.attr('team');
                const otherTeam = team === 'white' ? 'black' : 'white';
                if (token.attr('tokenType') === 'king') {
                    alert(otherTeam + ' won');
                    window.location.reload();
                }
                token.remove();
                deselectToken(otherTeamSelectedToken);
                positionToken(otherTeamSelectedToken, r, c);
                currentTeam = currentTeam === 'white' ? 'black' : 'white';
            } else {
                if (token.attr('team') === currentTeam) {
                    selectToken(token);
                    showPossibleCells(token);
                }
            }
        } else {
            if (token.attr('team') === currentTeam) {
                deselectToken(token);
            }
        }
    });
}

function positionToken(token, r, c) {
    const tokenType = token.attr('tokenType');
    const cell = jQuery('#cell-' + r + '-' + c);
    cell.addClass('hasToken');
    cell.attr('tokenId', token.attr('id'));
    token.attr('r', r);
    token.attr('c', c);
    let tknWidth;
    if (tokenType === 'king') {
        tknWidth = 43.75;
    } else if (tokenType === 'queen') {
        tknWidth = 50;
    } else if (tokenType === 'bishop') {
        tknWidth = 31.25;
    } else if (tokenType === 'knight') {
        tknWidth = 37.5;
    } else if (tokenType === 'rook') {
        tknWidth = 37.5;
    } else if (tokenType === 'pawn') {
        tknWidth = 31.25;
    }
    const tknHeight = 50;
    token.css('left', (cell[0].offsetLeft + (cell[0].clientWidth - tknWidth) / 2) + 'px');
    token.css('top', (cell[0].offsetTop + (cell[0].clientHeight - tknHeight) / 2) + 'px');
}

function selectToken(token) {
    jQuery('.selectedToken').removeClass('selectedToken');
    token.addClass('selectedToken');
    jQuery('.possibleCell').removeClass('possibleCell');
    jQuery('.enemy').removeClass('enemy');
}

function deselectToken(token) {
    token.removeClass('selectedToken');
    jQuery('.possibleCell').removeClass('possibleCell');
    jQuery('.enemy').removeClass('enemy');
}

function showPossibleCells(token) {
    const r = parseInt(token.attr('r'));
    const c = parseInt(token.attr('c'));
    const tokenType = token.attr('tokenType');
    const team = token.attr('team');
    const otherTeam = team === 'white' ? 'black' : 'white';
    if (tokenType === 'queen') {
        showPath(r, c, tokenType, team, otherTeam, 'straight');
        showPath(r, c, tokenType, team, otherTeam, 'angular');
    } else if (tokenType === 'pawn') {
        if (team === 'white') {
            if (r === 1) {
                return;
            }
            let r1 = r - 1;
            let c1 = c;
            let possibleCell = jQuery('#cell-' + r1 + '-' + c1);
            let ownToken = jQuery('.token.' + team + '[r="' + r1 + '"][c="' + c1 + '"]');
            let otherToken = jQuery('.token.' + otherTeam + '[r="' + r1 + '"][c="' + c1 + '"]');
            if (!(ownToken.length || otherToken.length)) {
                possibleCell.addClass('possibleCell');
            }

            r1 = r - 1;
            c1 = c - 1;
            possibleCell = jQuery('#cell-' + r1 + '-' + c1);
            otherToken = jQuery('.token.' + otherTeam + '[r="' + r1 + '"][c="' + c1 + '"]');
            if (otherToken.length) {
                possibleCell.addClass('possibleCell');
                possibleCell.addClass('enemy');
            }
            r1 = r - 1;
            c1 = c + 1;
            possibleCell = jQuery('#cell-' + r1 + '-' + c1);
            otherToken = jQuery('.token.' + otherTeam + '[r="' + r1 + '"][c="' + c1 + '"]');
            if (otherToken.length) {
                possibleCell.addClass('possibleCell');
                possibleCell.addClass('enemy');
            }
        } else if (team === 'black') {
            if (r === 8) {
                return;
            }
            let r1 = r + 1;
            let c1 = c;
            let possibleCell = jQuery('#cell-' + r1 + '-' + c1);
            let ownToken = jQuery('.token.' + team + '[r="' + r1 + '"][c="' + c1 + '"]');
            let otherToken = jQuery('.token.' + otherTeam + '[r="' + r1 + '"][c="' + c1 + '"]');
            if (!(ownToken.length || otherToken.length)) {
                possibleCell.addClass('possibleCell');
            }

            r1 = r + 1;
            c1 = c - 1;
            possibleCell = jQuery('#cell-' + r1 + '-' + c1);
            otherToken = jQuery('.token.' + otherTeam + '[r="' + r1 + '"][c="' + c1 + '"]');
            if (otherToken.length) {
                possibleCell.addClass('possibleCell');
                possibleCell.addClass('enemy');
            }
            r1 = r + 1;
            c1 = c + 1;
            possibleCell = jQuery('#cell-' + r1 + '-' + c1);
            otherToken = jQuery('.token.' + otherTeam + '[r="' + r1 + '"][c="' + c1 + '"]');
            if (otherToken.length) {
                possibleCell.addClass('possibleCell');
                possibleCell.addClass('enemy');
            }
        }
    } else if (tokenType === 'bishop') {
        showPath(r, c, tokenType, team, otherTeam, 'angular');
    } else if (tokenType === 'rook') {
        showPath(r, c, tokenType, team, otherTeam, 'straight');
    } else if (tokenType === 'king') {
        showPath(r, c, tokenType, team, otherTeam, 'straight', 1);
        showPath(r, c, tokenType, team, otherTeam, 'angular', 1);
    } else if (tokenType === 'knight') {
        showPath(r, c, tokenType, team, otherTeam, 'knight');
    }
}

function showPath(r, c, tokenType, team, otherTeam, pathType, limit) {
    let toplimit = 1;
    let bottomlimit = 8;
    let leftlimit = 1;
    let rightlimit = 8;
    if (limit) {
        toplimit = r - limit;
        bottomlimit = r + limit;
        leftlimit = c - limit;
        rightlimit = c + limit;
    }
    if (pathType === 'straight') {
        // up
        let r1 = r - 1;
        let c1 = c;
        let otherToken = [];
        while (r1 >= toplimit && !otherToken.length) {
            const possibleCell = jQuery('#cell-' + r1 + '-' + c1);
            const ownToken = jQuery('.token.' + team + '[r="' + r1 + '"][c="' + c1 + '"]');
            otherToken = jQuery('.token.' + otherTeam + '[r="' + r1 + '"][c="' + c1 + '"]');
            if (ownToken.length) {
                break;
            }
            possibleCell.addClass('possibleCell');
            if (otherToken.length) {
                possibleCell.addClass('enemy');
            }
            r1--;
        }
        // down
        r1 = r + 1;
        c1 = c;
        otherToken = [];
        while (r1 <= bottomlimit && !otherToken.length) {
            const possibleCell = jQuery('#cell-' + r1 + '-' + c1);
            const ownToken = jQuery('.token.' + team + '[r="' + r1 + '"][c="' + c1 + '"]');
            otherToken = jQuery('.token.' + otherTeam + '[r="' + r1 + '"][c="' + c1 + '"]');
            if (ownToken.length) {
                break;
            }
            possibleCell.addClass('possibleCell');
            if (otherToken.length) {
                possibleCell.addClass('enemy');
            }
            r1++;
        }
        // left
        r1 = r;
        c1 = c - 1;
        otherToken = [];
        while (c1 >= leftlimit && !otherToken.length) {
            const possibleCell = jQuery('#cell-' + r1 + '-' + c1);
            const ownToken = jQuery('.token.' + team + '[r="' + r1 + '"][c="' + c1 + '"]');
            otherToken = jQuery('.token.' + otherTeam + '[r="' + r1 + '"][c="' + c1 + '"]');
            if (ownToken.length) {
                break;
            }
            possibleCell.addClass('possibleCell');
            if (otherToken.length) {
                possibleCell.addClass('enemy');
            }
            c1--;
        }
        // right
        r1 = r;
        c1 = c + 1;
        otherToken = [];
        while (c1 <= rightlimit && !otherToken.length) {
            const possibleCell = jQuery('#cell-' + r1 + '-' + c1);
            const ownToken = jQuery('.token.' + team + '[r="' + r1 + '"][c="' + c1 + '"]');
            otherToken = jQuery('.token.' + otherTeam + '[r="' + r1 + '"][c="' + c1 + '"]');
            if (ownToken.length) {
                break;
            }
            possibleCell.addClass('possibleCell');
            if (otherToken.length) {
                possibleCell.addClass('enemy');
            }
            c1++;
        }
    } else if (pathType === 'angular') {
        // up-left
        let r1 = r - 1;
        let c1 = c - 1;
        let otherToken = [];
        while (c1 >= leftlimit && r1 >= toplimit && !otherToken.length) {
            const possibleCell = jQuery('#cell-' + r1 + '-' + c1);
            const ownToken = jQuery('.token.' + team + '[r="' + r1 + '"][c="' + c1 + '"]');
            otherToken = jQuery('.token.' + otherTeam + '[r="' + r1 + '"][c="' + c1 + '"]');
            if (ownToken.length) {
                break;
            }
            possibleCell.addClass('possibleCell');
            if (otherToken.length) {
                possibleCell.addClass('enemy');
            }
            r1--;
            c1--;
        }
        // up-right
        r1 = r - 1;
        c1 = c + 1;
        otherToken = [];
        while (c1 <= rightlimit && r1 >= toplimit && !otherToken.length) {
            const possibleCell = jQuery('#cell-' + r1 + '-' + c1);
            const ownToken = jQuery('.token.' + team + '[r="' + r1 + '"][c="' + c1 + '"]');
            otherToken = jQuery('.token.' + otherTeam + '[r="' + r1 + '"][c="' + c1 + '"]');
            if (ownToken.length) {
                break;
            }
            possibleCell.addClass('possibleCell');
            if (otherToken.length) {
                possibleCell.addClass('enemy');
            }
            r1--;
            c1++;
        }
        // down-left
        r1 = r + 1;
        c1 = c - 1;
        otherToken = [];
        while (c1 >= leftlimit && r1 <= bottomlimit && !otherToken.length) {
            const possibleCell = jQuery('#cell-' + r1 + '-' + c1);
            const ownToken = jQuery('.token.' + team + '[r="' + r1 + '"][c="' + c1 + '"]');
            otherToken = jQuery('.token.' + otherTeam + '[r="' + r1 + '"][c="' + c1 + '"]');
            if (ownToken.length) {
                break;
            }
            possibleCell.addClass('possibleCell');
            if (otherToken.length) {
                possibleCell.addClass('enemy');
            }
            r1++;
            c1--;
        }
        // down-right
        r1 = r + 1;
        c1 = c + 1;
        otherToken = [];
        while (c1 <= rightlimit && r1 <= bottomlimit && !otherToken.length) {
            const possibleCell = jQuery('#cell-' + r1 + '-' + c1);
            const ownToken = jQuery('.token.' + team + '[r="' + r1 + '"][c="' + c1 + '"]');
            otherToken = jQuery('.token.' + otherTeam + '[r="' + r1 + '"][c="' + c1 + '"]');
            if (ownToken.length) {
                break;
            }
            possibleCell.addClass('possibleCell');
            if (otherToken.length) {
                possibleCell.addClass('enemy');
            }
            r1++;
            c1++;
        }
    } else if (pathType === 'knight') {
        let r1 = r - 1;
        let c1 = c - 2;
        showSinglePath(r1, c1, tokenType, team, otherTeam);
        r1 = r - 2;
        c1 = c - 1;
        showSinglePath(r1, c1, tokenType, team, otherTeam);
        r1 = r - 2;
        c1 = c + 1;
        showSinglePath(r1, c1, tokenType, team, otherTeam);
        r1 = r - 1;
        c1 = c + 2;
        showSinglePath(r1, c1, tokenType, team, otherTeam);
        r1 = r + 1;
        c1 = c + 2;
        showSinglePath(r1, c1, tokenType, team, otherTeam);
        r1 = r + 2;
        c1 = c + 1;
        showSinglePath(r1, c1, tokenType, team, otherTeam);
        r1 = r + 2;
        c1 = c - 1;
        showSinglePath(r1, c1, tokenType, team, otherTeam);
        r1 = r + 1;
        c1 = c - 2;
        showSinglePath(r1, c1, tokenType, team, otherTeam);
    }
}

function showSinglePath(r1, c1, tokenType, team, otherTeam) {
    const possibleCell = jQuery('#cell-' + r1 + '-' + c1);
    const ownToken = jQuery('.token.' + team + '[r="' + r1 + '"][c="' + c1 + '"]');
    const otherToken = jQuery('.token.' + otherTeam + '[r="' + r1 + '"][c="' + c1 + '"]');
    if (ownToken.length) {
        return;
    }
    possibleCell.addClass('possibleCell');
    if (otherToken.length) {
        possibleCell.addClass('enemy');
    }
}
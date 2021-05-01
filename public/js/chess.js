var socket = io();
var activeTeam, thisTeam;

prepareBoard();

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

    socket.on('clickCell', function (data) {
        onClickCell(data);
    });
    socket.on('clickToken', function (data) {
        onClickToken(data);
    });
    socket.on('setActiveTeam', function (data) {
        setActiveTeam(data);
    });
    socket.on('setThisTeam', function (data) {
        setThisTeam(data);
    });
});

function prepareBoard() {
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

    setActiveTeam({ activeTeam: 'white' });
}

function setThisTeam(data) {
    thisTeam = data.thisTeam;
}

function setActiveTeam(data) {
    activeTeam = data.activeTeam;
}

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
            if ((i + j) % 2 !== 0) {
                cell.addClass('black');
            } else {
                cell.addClass('white');
            }
            cell.attr('id', 'cell-' + (i + 1) + '-' + (j + 1));
            cell.attr('r', i + 1);
            cell.attr('c', j + 1);
            cell.click(function (event) {
                if (thisTeam === activeTeam) {
                    const cellSelector = '#' + event.target.id;
                    emit('clickCell', { cellSelector, activeTeam });
                }
            });
            tr.append(cell);
        }
        tbl.append(tr);
    }
    jQuery('.main').append(tbl);
}

function onClickCell(data) {
    jQuery('.lastMoveCell').removeClass('lastMoveCell');
    const cell = jQuery(data.cellSelector);
    const r = Number(cell.attr('r'));
    const c = Number(cell.attr('c'));
    const tokenSelector = '.token[r="' + r + '"][c="' + c + '"]';
    const token = jQuery(tokenSelector);
    if (cell.hasClass('possibleCell')) {
        const selectedToken = jQuery('.selectedToken');
        if (selectedToken.length) {
            if (cell.hasClass('enemy')) {
                const team = token.attr('team');
                const otherTeam = team === 'white' ? 'black' : 'white';
                if (token.attr('tokenType') === 'king') {
                    alert(otherTeam + ' won');
                    window.location.href = window.location.origin;
                }
                token.remove();
            }
            deselectToken(selectedToken);
            positionToken(selectedToken, r, c, 'clickCell');
        }
    } else if (token.length) {
        if (token.attr('team') === activeTeam) {
            if (!token.hasClass('selectedToken')) {
                selectToken({ tokenSelector });
            } else {
                deselectToken(token);
            }
        }
    }
}

function drawToken(r, c, tokenType, team) {
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
    jQuery('.main').append(token);
    positionToken(token, r, c, 'drawToken');
    token.click(function () {
        if (thisTeam === activeTeam) {
            const tokenSelector = '#' + 'token-' + tokenType + '-' + r + '-' + c;
            emit('clickToken', { tokenSelector, activeTeam });
        }
    });
}

function onClickToken(data) {
    jQuery('.lastMoveCell').removeClass('lastMoveCell');
    const token = jQuery(data.tokenSelector);
    const team = token.attr('team');
    const otherTeam = team === 'white' ? 'black' : 'white';
    if (!token.hasClass('selectedToken')) { // on click non-selected token
        const r = token.attr('r');
        const c = token.attr('c');
        const otherTeamSelectedToken = jQuery('.selectedToken.' + otherTeam);
        const thisCell = jQuery('#cell-' + r + '-' + c);
        if (thisCell.hasClass('enemy')) { // on click enemy token to remove
            const team = token.attr('team');
            const otherTeam = team === 'white' ? 'black' : 'white';
            if (token.attr('tokenType') === 'king') {
                alert(otherTeam + ' won');
                window.location.href = window.location.origin;
            }
            token.remove();
            deselectToken(otherTeamSelectedToken);
            positionToken(otherTeamSelectedToken, r, c, 'clickToken');
        } else { // on click non-selected token to select
            if (token.attr('team') === activeTeam) {
                selectToken({ tokenSelector: data.tokenSelector });
            }
        }
    } else { // on click selected token
        if (token.attr('team') === activeTeam) {
            deselectToken(token);
        }
    }
}

function positionToken(token, r, c, actionType) {
    const tokenType = token.attr('tokenType');
    const cell = jQuery('#cell-' + r + '-' + c);
    cell.addClass('hasToken');
    cell.attr('tokenId', token.attr('id'));
    token.attr('r', r);
    token.attr('c', c);
    const tokenFontSize = parseInt(token.css('font-size'));
    let tknWidthFactor;
    if (tokenType === 'king') {
        tknWidthFactor = 0.875;
    } else if (tokenType === 'queen') {
        tknWidthFactor = 1;
    } else if (tokenType === 'bishop') {
        tknWidthFactor = 0.625;
    } else if (tokenType === 'knight') {
        tknWidthFactor = 0.75;
    } else if (tokenType === 'rook') {
        tknWidthFactor = 0.75;
    } else if (tokenType === 'pawn') {
        tknWidthFactor = 0.625;
    }
    const tknWidth = tknWidthFactor * tokenFontSize;
    const tknHeight = tokenFontSize;

    token.animate({
        left: (cell[0].offsetLeft + (cell[0].clientWidth - tknWidth) / 2) + 'px',
        top: (cell[0].offsetTop + (cell[0].clientHeight - tknHeight) / 2) + 'px'
    });

    if (actionType !== 'drawToken') {
        cell.addClass('lastMoveCell');
    }

    emit('setActiveTeam', { activeTeam: activeTeam === 'white' ? 'black' : 'white' });
}

function emit(eventName, data) {
    socket.emit(eventName + 'S', data);
}

function selectToken(data) {
    const token = jQuery(data.tokenSelector);
    jQuery('.selectedToken').removeClass('selectedToken');
    token.addClass('selectedToken');
    jQuery('.possibleCell').removeClass('possibleCell');
    jQuery('.enemy').removeClass('enemy');
    showPossibleCells(token);
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
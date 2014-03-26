/**
 * Created by sergey on 2/23/14.
 */

var mirrorClient, oauthClient;

function route(command, data, client, oauth2Client, success, failure){
    mirrorClient = client;
    oauthClient = oauth2Client;
    switch (command){
        case 'insert': insert(data, success, failure);
            break;
        case 'delete': deleteCard(data, success, failure);
            break;
        case 'list': getCardList(success, failure);
            break;
        case 'list-insert': listInsert(data, success, failure);
            break;

        default: getCardList(success, failure);
            break;
    }
}

function insert(data, successCallback, errorCallback){
    mirrorClient
        .mirror.timeline.insert(data)
        .withAuthClient(oauthClient)
        .execute(function (err, data) {
            if (!!err)
                errorCallback(err);
            else
                successCallback(data);
        });
}

function listInsert(data, successCallback, errorCallback){
    mirrorClient
        .mirror.timeline.insert(data)
        .withAuthClient(oauthClient)
        .execute(function (err, data) {
            if (!!err) {
                errorCallback(err);
            } else {
                successCallback(data);
            }
        });
}

function deleteCard(cardId, successCallback, errorCallback){
    console.log('item id: ', cardId);
    mirrorClient
        .mirror.timeline.delete({id: cardId})
        .withAuthClient(oauthClient)
        .execute(function (err, data) {
            if (!!err)
                errorCallback(err);
            else
                successCallback(data);
        });
}

function getCardList(successCallback, errorCallback){
    mirrorClient
        .mirror.timeline.list()
        .withAuthClient(oauthClient)
        .execute(function (err, data) {
            if (!!err) {
                errorCallback(err);
            } else {
                successCallback(data);
            }
        });
}

exports.route = route;

var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var cloudinary = require('cloudinary');
var multer = require('multer');
var fs = require('fs');
var boardController = require("../controller/board_controller");
var Board = mongoose.model('Board');




cloudinary.config({
    cloud_name: 'shyamal',
    api_key: '517683456484993',
    api_secret: 'r-ZR3H2rRvvcGr8wVYxxEZlfN5A',
});


var app = express();





app.route('/portlet/:index')
    .get(function(req, res) {
        Board.findOne({ 'boardId': req.params.index }, function(err, result) {
            if (err) throw err;
            res.json(result);
        });
    })
    .put(function(req, res) {
        Board.findOne({ 'boardId': req.params.index }, function(err, result) {
            if (err) throw err;
            if (!result) {
                res.json({
                    message: "Board with ID: " + req.params.index + " not found.",
                });
            }
            var portletId = makeId('xyyxyy-xyxyy-xxyx-xyxyx');
            if (result) {
                result.portlet.push({
                    "portletName": req.body.portletname,
                    "portletId": portletId,
                    "portletCards": [],
                    "portletCreatedOn": new Date()
                });
                result.boardActivity.push({
                    activity: ['Created New Portlet named "' + req.body.portletname + '"'],
                    boardUpdatedyName: result.created_byName,
                    boardUpdatedBy: result.created_by,
                    boardOperation: 'Create Portlet',
                    boardId: result.boardId,
                    boardOperationOn: new Date(),
                })
                result.markModified('portlet');
                result.save(function(err, result) {
                    if (err) throw err;
                    res.json({
                        message: "Successfully updated the portlet",
                        board: result
                    });
                });
            }


        });

    });


app.route('/edit/portlet/:portletId')
    .put(function(req, res) {
        Board.findOne({ 'portlet.portletId': req.params.portletId }, function(err, result) {
            var responseResult = result;
            var pName = '';
            responseResult.portlet.forEach(function(element) {
                if (element.portletId === req.params.portletId) {
                    pName = element.portletName;
                    var index = result.portlet.indexOf(element);
                    responseResult.portlet.splice(index, 1);
                }
            });
            responseResult.boardActivity.push({
                activity: ['Deleted Portlet named "' + pName + '"'],
                boardUpdatedyName: responseResult.created_byName,
                boardUpdatedBy: responseResult.created_by,
                boardOperation: 'Delete Portlet',
                boardId: responseResult.boardId,
                boardOperationOn: new Date(),
            })
            responseResult.save(function(err, result) {
                if (err) throw err;
                res.json({
                    message: 'Successfully deleted the portlet',
                    board: result
                });
            });
        });
    });

app.route('/edit/comments/:commentId/:portletCardId/:editField/:action')
    .put(function(req, res) {
        Board.findOne({ 'portlet.portletCards.portletCardId': req.params.portletCardId }, function(err, result) {
            var responseResult = result;
            responseResult.portlet.forEach(function(element) {
                if (element.portletCardId === req.params.portletId) {
                    element.portletCards.forEach(function(card) {
                        if (card.portletCardId = req.params.portletCardId) {
                            card.portletCardsComments.forEach(function(comments) {
                                if (comments.portletCardCommentId === req.params.commentId) {
                                    if (req.params.action === 'edit') {
                                        comments.portletCardsComments = req.body.portletCardsComments;
                                        responseResult.portletCardUpdatedOn = new Date();
                                        card.portletCardActivity.push({
                                            "portletCardId": req.params.portletCardId,
                                            "activity": ['Edited Comment "' + req.body.portletCardsComments + '"'],
                                            "portletCardCreatedBy": result.created_by,
                                            "portletCardCreatedByName": result.created_byName,
                                            "portletCardOperation": 'Edit Comment',
                                            "portletCardOperationOn": responseResult.portletCardUpdatedOn
                                        });
                                    } else {
                                        var index = card.portletCardsComments.indexOf(comments);
                                        console.log(index);
                                        card.portletCardsComments.splice(index, 1);
                                        responseResult.portletCardUpdatedOn = new Date();
                                        card.portletCardActivity.push({
                                            "portletCardId": req.params.portletCardId,
                                            "activity": ['Deleted Comment "' + req.body.portletCardsComments + '"'],
                                            "portletCardCreatedBy": result.created_by,
                                            "portletCardCreatedByName": result.created_byName,
                                            "portletCardOperation": 'Delete Comment',
                                            "portletCardOperationOn": responseResult.portletCardUpdatedOn
                                        });
                                    }
                                }
                            })
                        }
                    })
                }
            });
            responseResult.markModified('portlet');
            responseResult.save(function(err, result) {
                if (err) {
                    throw err;
                }
                res.json({
                    message: 'Successfully added value',
                    board: result
                });
            });
        });
    });

app.route('/add/cards/:portletId')
    .put(function(req, res) {
        Board.findOne({ 'portlet.portletId': req.params.portletId }, function(err, result) {
            if (err) throw err;
            if (!result) {
                res.json({
                    message: "Board with ID: " + req.params.portletId + " not found.",
                });
            }
            var portletCardId = makeId('yxcay-xyxyy-xayx-xycyx');
            if (result) {
                var responseCardResult = result;
                responseCardResult.portlet.forEach(function(element) {
                    if (element.portletId === req.params.portletId) {
                        element.portletCards.push({
                            "portletCardName": req.body.cardlabel,
                            "portletCardId": portletCardId,
                            "portletCardTagLine": "",
                            "portletCardCreatedOn": new Date(),
                            "portletCardUpdatedOn": new Date(),
                            "portletCardsImages": [],
                            "portletCardsAttachments": [],
                            "portletCardsComments": [],
                            "portletCardsMembers": [],
                            "portletCardsTodo": [],
                            "portletCardsDescription": '',
                            "portletCardDueDate": '',
                            "portletCardActivity": [{
                                "activity": ['Created New Card Named as "' + req.body.cardlabel + '"'],
                                "portletCardId": portletCardId,
                                "portletCardCreatedBy": responseCardResult.created_by,
                                "portletCardCreatedByName": responseCardResult.created_byName,
                                "portletCardOperation": 'Create Card',
                                "portletCardOperationOn": new Date(),
                            }],
                        });


                        responseCardResult.markModified('portlet');
                        responseCardResult.save(function(err, result) {
                            if (err) {
                                throw err;
                            }
                            res.json({
                                message: 'Successfully added card',
                                board: result
                            });
                        });
                    }
                });
            }
        });

    });

app.route('/edit/cards/:portletId/:editField')
    .put(function(req, res) {
        var editField = req.params.editField;
        var PortletCardId = req.params.portletId;
        var editFieldDiff;
        if (editField === 'portletCardName') {
            editFieldDiff = 'Name';
        } else if (editField === 'portletCardTagLine') {
            editFieldDiff = 'Tagline';
        } else if (editField === 'portletCardsDescription') {
            editFieldDiff = 'Description';
        }
        Board.findOne({ 'portlet.portletCards.portletCardId': req.params.portletId }, function(err, result) {
            if (err) throw err;
            if (!result) {
                res.json({
                    message: "portlet card with ID: " + req.params.portletId + " not found.",
                });
            }
            if (result) {
                var responseCardResult = result;
                responseCardResult.portlet.forEach(function(element) {
                    element.portletCards.forEach(function(card) {
                        if (card.portletCardId === req.params.portletId) {
                            if (card.portletCardId === req.params.portletId) {
                                if (editField === 'portletCardsComments') {
                                    var portletCardCommentId = makeId('oxxay-xyxcy-xayx-xycox');
                                    req.body.portletCardCommentId = portletCardCommentId;
                                    card[editField].push(req.body);
                                    card.portletCardUpdatedOn = new Date();
                                    card.portletCardActivity.push({
                                        "portletCardId": card.portletCardId,
                                        "activity": ['Added Comment "' + req.body[editField] + '"'],
                                        "portletCardCreatedBy": result.created_by,
                                        "portletCardCreatedByName": result.created_byName,
                                        "portletCardOperation": 'Edit Comment',
                                        "portletCardOperationOn": new Date()
                                    });
                                } else {
                                    card[editField] = req.body[editField];
                                    card.portletCardUpdatedOn = new Date();
                                    card.portletCardActivity.push({
                                        "portletCardId": card.portletCardId,
                                        "activity": ['Edited card\'s ' + editFieldDiff + '"' + req.body[editField] + '"'],
                                        "portletCardCreatedBy": responseCardResult.created_by,
                                        "portletCardCreatedByName": responseCardResult.created_byName,
                                        "portletCardOperation": 'Edit Card',
                                        "portletCardOperationOn": new Date()
                                    });
                                }
                            }
                        }
                    });
                });
                responseCardResult.markModified('portlet');
                responseCardResult.save(function(err, result) {
                    if (err) {
                        console.log(err);
                    }
                    res.json({
                        message: 'Successfully added comments',
                        board: result
                    });
                });

            }
        })
    })

app.route('/move/:movedCardId/:movedFromPortletId/:movedIntoPortletId')
    .put(function(req, res) {
        var movedFromPortletId = req.params.movedFromPortletId;
        var movedIntoPortletId = req.params.movedIntoPortletId;
        var cardId = req.params.movedCardId;

        Board.findOne({ 'portlet.portletId': movedFromPortletId }, function(err, result) {
                var copiedElem;
                if (err) {
                    throw err;
                }
                if (!result) {
                    res.json({
                        message: "portlet card with ID: " + movedFromPortletId + " not found.",
                    });
                }
                result.markModified('portlet');
                var responseResult = result;
                responseResult.portlet.forEach(function(element) {
                    if (element.portletId === req.params.movedFromPortletId) {
                        element.portletCards.forEach(function(card) {
                            if (card.portletCardId === cardId) {
                                copiedElem = card;
                                var index = element.portletCards.indexOf(card);
                                element.portletCards.splice(index, 1);
                            }
                        })
                    }
                });
                responseResult.save(function(err, result) {
                    if (err) {
                        throw err
                    }
                    Board.findOne({ 'portlet.portletId': movedIntoPortletId }, function(err, result) {
                        //console.log(result);
                        result.portlet.forEach(function(portlet) {
                            //console.log(portlet.portletId === movedIntoPortletId)
                            if (portlet.portletId === movedIntoPortletId) {
                                portlet.portletCards.push(copiedElem);
                            }
                        });
                        result.markModified('portlet');
                        result.save(function(err, result) {
                            if (err) {
                                throw err;
                            }
                            res.json({
                                message: 'Successfully added card',
                                board: result
                            });
                        });

                    });
                })





            })
            //console.log(req);

    });

function makeId(pattern) { // Public Domain/MIT
    var d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
        d += performance.now(); //use high-precision timer if available
    }
    return pattern.replace(/[xy-]/g, function(c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'y' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

module.exports = app;
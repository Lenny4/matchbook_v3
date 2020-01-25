"use strict";
const mysql2 = require('mysql2');
const Const = require('../../Const');

class MySql {
    constructor() {
        this.host = Const.mysql.host;
        this.user = Const.mysql.user;
        this.password = Const.mysql.password;
        this.database = Const.mysql.database;
        this.pool = mysql2.createPool({
            host: this.host,
            user: this.user,
            password: this.password,
            database: this.database,
        });
    }

    getAllEvents(callback) {
        const sql = `SELECT id, name, eventId, sportId, start FROM event;`;
        this.pool.execute(
            sql,
            [],
            (err, events, fields) => {
                if (err) console.log(err);
                callback(events);
            }
        );
    }

    getEvent(id, callback) {
        const sql = `SELECT json FROM event WHERE eventId = ? LIMIT 1;`;
        this.pool.execute(
            sql,
            [id],
            (err, event, fields) => {
                if (err) console.log(err);
                callback(event[0]);
            }
        );
    }

    // insertNotificationNewMessage(notificationId, data) {
    //     this.pool.execute(
    //         'INSERT INTO `notification_new_message`(`id`, `sender_id`, `chat_room_id`, `chat_type`, `nb_message`, `notification_id`, `deletedAt`) VALUES (NULL, ?, ?, ?, ?, ?, NULL);',
    //         [data.senderId, data.chatRoomId, data.chatType, 1, notificationId],
    //         (err, results, fields) => {
    //             if (err) console.log(err);
    //         }
    //     );
    // }
}

module.exports = MySql;
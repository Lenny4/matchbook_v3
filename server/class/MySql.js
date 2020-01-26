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

    getCleanEvent(id, callback) {
        const sql = `SELECT json FROM clean_event WHERE eventId = ? LIMIT 1;`;
        this.pool.execute(
            sql,
            [id],
            (err, cleanEvent, fields) => {
                if (err) console.log(err);
                callback(cleanEvent[0]);
            }
        );
    }

    saveCleanEvent(cleanEvent, callback) {
        this.pool.execute(
            'INSERT INTO `clean_event`(`eventId`, `start`, `json`) VALUES (?, ?, ?);',
            [(cleanEvent.eventId).toString(), parseInt(cleanEvent.start / 1000), JSON.stringify(cleanEvent)],
            (err, results, fields) => {
                if (err) console.log(err);
                callback();
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

    createMissingTables(callback) {
        const sql = `CREATE TABLE IF NOT EXISTS clean_event (
                      id int(11) NOT NULL AUTO_INCREMENT,
                      eventId varchar(255) NOT NULL,
                      start int(11) NOT NULL,
                      json longtext NOT NULL,
                      PRIMARY KEY (id)
                    ) ENGINE=InnoDB DEFAULT CHARSET=latin1;`;
        this.pool.execute(
            sql,
            [],
            (err, event, fields) => {
                if (err) console.log(err);
                callback();
            }
        );
    }

    truncateCleanEvent(callback) {
        console.log("truncate clean event");
        const sql = `TRUNCATE clean_event;`;
        this.pool.execute(
            sql,
            [],
            (err, event, fields) => {
                if (err) console.log(err);
                callback();
            }
        );
    }
}

module.exports = MySql;
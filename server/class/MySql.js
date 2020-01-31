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
        const sql = `
                     SELECT e.name,
                           e.eventId,
                           e.sportId,
                           e.start,
                           ce.raceName,
                           ce.weekday,
                           ce.nbBets,
                           ce.gain
                    FROM   event as e
                           LEFT JOIN clean_event as ce
                                  ON ce.eventid = e.eventid;  
                    `;
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
            'INSERT INTO `clean_event`(`eventId`, `start`, `json`, `raceName`, `hour`, `weekday`, `nbBets`, `gain`) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
            [
                (cleanEvent.eventId).toString(),
                parseInt(cleanEvent.start / 1000),
                JSON.stringify(cleanEvent),
                (cleanEvent.raceName).toString(),
                parseInt(cleanEvent.hour),
                parseInt(cleanEvent.weekday),
                parseInt(cleanEvent.nbBets),
                parseFloat(cleanEvent.gain),
            ],
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
        const sql = `CREATE TABLE IF NOT EXISTS matchbook_v2.clean_event
                      (
                         id        INT NOT NULL auto_increment,
                         eventId   VARCHAR(255) NOT NULL,
                         start     INT NOT NULL,
                         json      LONGTEXT NOT NULL,
                         raceName VARCHAR(255) NOT NULL,
                         hour      INT NOT NULL,
                         weekday   INT NOT NULL,
                         nbBets    INT NOT NULL,
                         gain      FLOAT NOT NULL,
                         PRIMARY KEY (id)
                      )
                    engine = innodb;`;
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
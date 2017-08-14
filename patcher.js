var fs          = require('fs');
var path        = require('path');
var util        = require('util');
var Transform   = require('stream').Transform;
var File        = require('vinyl');

// function isPatchable(raw, key, value) {
//     return raw !== undefined && (!raw || raw === key || raw !== value);
// }

function tryToPatch(data, key, value, callback) {
    for (var dk in data) {
        if (typeof data[dk] === 'object' && data[dk].constructor !== Array) {
            tryToPatch(data[dk], key, value, callback)
        } else if (dk === key) {
            data[dk] = value
            callback(key);
        }
    }
}

function Patcher(input) {
    var patcherPath = path.resolve(process.cwd(), input);

    this.patch = JSON.parse(fs.readFileSync(patcherPath));
    this.appliedTranslations = [];
    this.modification = {};

    Transform.call(this, { objectMode: true });
}

util.inherits(Patcher, Transform);

Patcher.prototype._transform = function(file, encoding, done) {
    var self = this;
    var data;
    this.base = this.base || file.base;

    if(file.isNull()) {
        if ( file.stat.isDirectory() ) {
            return done();
        }
        else if ( file.path && fs.existsSync( file.path ) ) {
            data = JSON.parse(fs.readFileSync(file.path).toString('utf-8'));
        }
        else {
            this.emit('error', 'File has no content and is not readable');
            return done();
        }
    }

    var modified = false;
    var setModified = function(k) {
        modified = true
        self.appliedTranslations.push(k);
    };
    for (var k in this.patch) {
        tryToPatch(data, k, this.patch[k], setModified);
    }

    if (modified) { this.modification[file.path] = data; }

    this.emit( 'reading', file.path );
    done();
}

Patcher.prototype._flush = function(done) {
    var missingKeys = Object.keys(this.patch).filter(k => !this.appliedTranslations.includes(k));
    if (missingKeys.length > 0) { console.log('[missing keys]'.red + "\n" + missingKeys.join("\n")) }

    for (var p in this.modification) {
        this.emit('writing', p);
        this.push(new File({
            path: p,
            base: this.base,
            contents: new Buffer(JSON.stringify( this.modification[p], null, 2 ))
        }))
    }

    done();
}

module.exports = function(path) {
    return new Patcher(path);
};

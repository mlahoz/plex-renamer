var fs = require('fs');
var path = require('path');

console.log('*** PLEX RENAMER ***');

var dir = '.';

// Get directory name from command line arguments
if (process.argv.length > 2) {
        dir = process.argv[2]
}

// Check if directory is valid
fs.lstat(dir, function (err, stats) {
    if (!err && stats.isDirectory()) {
        console.log('Directory to process: ', dir);
        processDir(dir);
    }
    else {
        console.log('ERROR, invalid input directory: ', dir);
    }
});

// Process directory recursively
var processDir = function (dir) {
    fs.readdir(dir, function (err, files) {
        if (err) {
            console.log('ERROR reading directory: ', err);
        }
        else {
            files
            .filter(function (i) {
                return i[0] !== '.';
            })
            .map(function (i) {
                return path.join(dir, i);
            })
            .forEach(function (i) {
                processFileOrDir(i);
            });
        }
    });
}

// Process file or directory
var processFileOrDir = function (file) {
    fs.lstat(file, function (err, stats) {
        if (err) {
            console.log('ERROR stating file:', file);
        }
        else if (stats.isDirectory()) {
            checkAndProcessDir(file);
        }
        else {
            processFile(file);
        }
    });
}

// Process directory, checking name first
var checkAndProcessDir = function (dirname) {
    console.log('Processing directory', dirname, '...');

    // Check if rename is needed
    var newdirname = newDirName(dirname);
    if (newdirname) {
        fs.rename(dirname, newdirname, function (err) {
                if (err) {
                    console.log('ERROR renaming directory, from', dirname, 'to', newdirname);
                }
                else {
                    console.log('Directory renamed, from', dirname, 'to', newdirname);
                    processDir(newdirname);
                }
        });
    }
    else {
        processDir(dirname);
    }
}

// Process file
var processFile = function (file) {
    console.log('Processing file', file, '...');

    filepath = path.parse(file);
    filename = filepath.name;

    var newfilename = newFileName(filename);

    if (newfilename) {
        var newfile = path.join(filepath.dir, newfilename.concat(filepath.ext));

        fs.rename(file, newfile, function (err) {
                if (err) {
                    console.log('ERROR renaming file, from', file, 'to', newfile);
                }
                else {
                    console.log('File renamed, from', file, 'to', newfile);
                }
        });
    }
}

// Checks if new directory name is needed, undef if not
var newDirName = function (dir) {
    dirname = path.basename(dir);

    var dir_regex = /[Ss]eason.(\d{1,2})/;
    var r = dir_regex.exec(dirname);

    if (r) {
        var season = r[1];
        if (season.length === 1) season = '0'.concat(season);

        var fullname = path.join(path.dirname(dir), 'Season '.concat(season))

        if (fullname !== dir) {
            return fullname;
        }
    }
}

var newFileName = function (file) {

    // show name - 2.3 - title
    var regex = /(.*)(\d{1,2})\.(\d{1,2})(.*)/;
    var r = regex.exec(file);
    if (r) return formatFileName(r[1], r[2], r[3], r[4]);

    // show name season 2 episode 3 title
    regex = /(.*)season (\d{1,2}) episode (\d{1,2})(.*)/;
    r = regex.exec(file);
    if (r) return formatFileName(r[1], r[2], r[3], r[4]);

}

var formatFileName = function (pre, season, episode, post) {
    if (season.length === 1) season = '0'.concat(season);
    if (episode.length === 1) episode = '0'.concat(episode);

    return [pre, 'S', season, 'E', episode, post].join('');
}

console.log('Bye!');

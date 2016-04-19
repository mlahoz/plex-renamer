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
        console.log('Invalid input directory: ', dir);
    }
});

// Process directory recursively
var processDir = function (dir) {
    fs.readdir(dir, function (err, files) {
        if (err) {
            console.log('Error reading dir: ', err);
        }
        else {
            files
            .filter(function (i) {
                return i[0] != '.';
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
            console.log('Error with file:', file);
        }
        else if (stats.isDirectory()) {
            console.log('Processing directory', file, '...');
            // Check if rename is needed
            processDir(file);
        }
        else {
            processFile(file);
        }
    });
}

// Process file
var processFile = function (file) {
    console.log('Processing file', file, '...');
}

console.log('Bye!');

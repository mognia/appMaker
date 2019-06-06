var gulp = require("gulp");
var ts = require("gulp-typescript");
var fs = require("fs-extra");
var mocha = require("gulp-mocha");
var runSequence = require("run-sequence");
var child = require("child_process");

var paths = {
  dist: "dist",
  tsSources: "src/**/*.ts",
  tests: "dist/tests/*.js"
};

// compile typescripts
function build() {
  if (fs.existsSync(paths.dist)) {
    fs.emptyDirSync(paths.dist);
  }

  return gulp
    .src(paths.tsSources)
    .pipe(
      ts({
        noImplicitAny: false,
        target: "ES2015",
        sourceMap: true,
        module: "CommonJS",
        baseUrl: ".",
        paths: {
          "*": ["node_modules/*", "src/types/*"]
        }
      })
    )
    .pipe(gulp.dest(paths.dist));
}
function handleError(err) {
  console.log(err.toString());
  this.emit("end");
}
function test() {
  return gulp.src([paths.tests], { read: false }).pipe(
    mocha({
      reporter: "spec",
      exit: true
    }).on("error", handleError)
  );
}

let server;

function run(done) {
  if (server) if (server.kill) server.kill();

  let childProcess = child.spawn("node", ["./dist/start.js"], {
    stdio: "inherit",
    env: {
      ...process.env
    }
  });

  server = childProcess;

  done();
}

gulp.watch(paths.tsSources, gulp.series(build, test, run));

exports.test = gulp.series(build, test, async () => {});
exports.build = gulp.series(build);
exports.default = gulp.series(build, test, run);
